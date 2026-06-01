from concurrent.futures import ThreadPoolExecutor, as_completed

from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from services.tmdb_client import TMDBClient

from .models import List, ListItem
from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    UserSerializer,
    ListSerializer,
)

User = get_user_model()


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token),
        "user": UserSerializer(user).data,
    }


@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    user = serializer.save()
    return Response(get_tokens_for_user(user), status=status.HTTP_201_CREATED)


@api_view(["POST"])
@permission_classes([AllowAny])
def login(request):
    serializer = LoginSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    email = serializer.validated_data["email"].lower()
    password = serializer.validated_data["password"]
    user = User.objects.filter(email=email).first()
    if not user or not user.check_password(password):
        return Response(
            {"detail": "Invalid email or password."},
            status=status.HTTP_401_UNAUTHORIZED,
        )
    return Response(get_tokens_for_user(user))


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me(request):
    return Response(UserSerializer(request.user).data)


# --- Lists ---


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def lists_list(request):
    """List user's lists (filtered by media_type) or create a new one."""
    if request.method == "GET":
        list_media_type = request.query_params.get("media_type", "media")
        tmdb_id = request.query_params.get("tmdb_id")
        item_media_type = request.query_params.get("item_media_type", "movie")
        qs = List.objects.filter(user=request.user, media_type=list_media_type)
        context = {"tmdb_id": tmdb_id, "item_media_type": item_media_type}
        serializer = ListSerializer(qs, many=True, context=context)
        return Response(serializer.data)
    # POST - require media_type for new list
    title = request.data.get("title", "").strip()
    media_type = request.data.get("media_type", "media")
    if media_type not in ("media", "person"):
        return Response(
            {"detail": "media_type must be media or person."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    if not title:
        return Response(
            {"detail": "Title is required."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    obj = List.objects.create(user=request.user, title=title, media_type=media_type)
    return Response(
        {"id": obj.id, "title": obj.title, "media_type": obj.media_type},
        status=status.HTTP_201_CREATED,
    )


@api_view(["GET", "DELETE", "PATCH"])
@permission_classes([IsAuthenticated])
def list_items(request, list_id):
    """GET: items in a list. PATCH: rename list. DELETE: remove the list (and its items)."""
    lst = List.objects.filter(user=request.user, pk=list_id).first()
    if not lst:
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

    if request.method == "DELETE":
        lst.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    if request.method == "PATCH":
        title = request.data.get("title", "").strip()
        if not title:
            return Response(
                {"detail": "Title is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        lst.title = title
        lst.save()
        return Response(
            {"id": lst.id, "title": lst.title, "media_type": lst.media_type}
        )

    items = lst.items.all().order_by("-id")
    data = [
        {
            "id": item.tmdb_id,
            "media_type": item.media_type,
            "title": item.title if item.media_type != "person" else None,
            "name": item.title if item.media_type == "person" else None,
            "poster_path": item.poster_path,
        }
        for item in items
    ]
    return Response(
        {
            "id": lst.id,
            "title": lst.title,
            "media_type": lst.media_type,
            "items": data,
        }
    )


MAX_REC_SEEDS = 15
MAX_REC_RESULTS = 24


def _normalize_rec_item(raw, fallback_media_type):
    mt = raw.get("media_type") or fallback_media_type
    if mt not in ("movie", "tv"):
        return None
    return {
        "id": raw["id"],
        "media_type": mt,
        "title": raw.get("title"),
        "name": raw.get("name"),
        "poster_path": raw.get("poster_path"),
        "release_date": raw.get("release_date"),
        "vote_average": raw.get("vote_average"),
    }


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_recommendations(request, list_id):
    """Aggregate TMDB recommendations across list items (movies/TV only)."""
    lst = List.objects.filter(user=request.user, pk=list_id).first()
    if not lst:
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

    if lst.media_type == "person":
        return Response({"results": []})

    all_items = list(lst.items.all())
    in_list = {(i.media_type, i.tmdb_id) for i in all_items}
    seeds = [i for i in all_items if i.media_type in ("movie", "tv")][:MAX_REC_SEEDS]

    if not seeds:
        return Response({"results": []})

    client = TMDBClient()
    scores = {}

    def fetch_for_seed(seed):
        try:
            return seed, client.get_recommendations(seed.media_type, seed.tmdb_id)
        except Exception:
            return seed, {"results": []}

    with ThreadPoolExecutor(max_workers=5) as executor:
        futures = [executor.submit(fetch_for_seed, s) for s in seeds]
        for fut in as_completed(futures):
            seed, data = fut.result()
            for raw in (data.get("results") or [])[:12]:
                norm = _normalize_rec_item(raw, seed.media_type)
                if not norm:
                    continue
                key = (norm["media_type"], norm["id"])
                if key in in_list:
                    continue
                if key not in scores:
                    scores[key] = {"item": norm, "count": 0}
                scores[key]["count"] += 1

    ranked = sorted(
        scores.values(),
        key=lambda x: (-x["count"], -(x["item"].get("vote_average") or 0)),
    )
    results = [x["item"] for x in ranked[:MAX_REC_RESULTS]]
    return Response({"results": results})


@api_view(["POST", "DELETE"])
@permission_classes([IsAuthenticated])
def list_toggle_item(request, list_id):
    """Add or remove a movie/show from a list."""
    lst = List.objects.filter(user=request.user, pk=list_id).first()
    if not lst:
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)

    tmdb_id = request.data.get("tmdb_id") or request.query_params.get("tmdb_id")
    item_media_type = request.data.get("media_type") or request.query_params.get("media_type", "movie")
    title = request.data.get("title", "")
    poster_path = request.data.get("poster_path")

    if tmdb_id is None:
        return Response(
            {"detail": "tmdb_id is required."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    tmdb_id = int(tmdb_id)

    # Validate: list.media_type "media" accepts movie/tv; "person" accepts person
    if lst.media_type == "media" and item_media_type not in ("movie", "tv"):
        return Response(
            {"detail": "This list accepts only movies and TV shows."},
            status=status.HTTP_400_BAD_REQUEST,
        )
    if lst.media_type == "person" and item_media_type != "person":
        return Response(
            {"detail": "This list accepts only persons."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if request.method == "POST":
        item, created = ListItem.objects.get_or_create(
            list=lst,
            tmdb_id=tmdb_id,
            media_type=item_media_type,
            defaults={"title": title, "poster_path": poster_path},
        )
        if not created and (title or poster_path is not None):
            if title:
                item.title = title
            if poster_path is not None:
                item.poster_path = poster_path
            item.save()
        return Response({"in_list": True}, status=status.HTTP_200_OK)

    # DELETE
    ListItem.objects.filter(
        list=lst, tmdb_id=tmdb_id, media_type=item_media_type
    ).delete()
    return Response({"in_list": False}, status=status.HTTP_200_OK)
