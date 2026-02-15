from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Consumed
from .serializers import (
    RegisterSerializer,
    LoginSerializer,
    UserSerializer,
    ConsumedSerializer,
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


# --- Consumed (your list only; requires auth) ---


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def consumed_list(request):
    """List or add consumed items for the current user only."""
    if request.method == "GET":
        items = Consumed.objects.filter(user=request.user)
        return Response(ConsumedSerializer(items, many=True).data)
    # POST (idempotent: get_or_create so duplicate add is ok)
    serializer = ConsumedSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    data = serializer.validated_data
    obj, created = Consumed.objects.get_or_create(
        user=request.user,
        tmdb_id=data["tmdb_id"],
        defaults={"title": data["title"], "media_type": data["media_type"]},
    )
    return Response(
        ConsumedSerializer(obj).data,
        status=status.HTTP_201_CREATED if created else status.HTTP_200_OK,
    )


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def consumed_detail(request, pk):
    """Remove a consumed item. Only the owner can delete."""
    item = Consumed.objects.filter(user=request.user, pk=pk).first()
    if not item:
        return Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
    item.delete()
    return Response(status=status.HTTP_204_NO_CONTENT)
