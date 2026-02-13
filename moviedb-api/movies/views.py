from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET
from services.tmdb_client import TMDBClient
import logging
import requests

logger = logging.getLogger(__name__)
client = TMDBClient()


@csrf_exempt
@require_GET
def get_trending(request):
    """Get trending movies or TV shows"""
    try:
        media_type = request.GET.get("media_type", "movie")
        window = request.GET.get("window", "week")
        page = int(request.GET.get("page", 1))
        
        data = client.get_trending(media_type=media_type, window=window, page=page)
        return JsonResponse(data, safe=False)
    except Exception as e:
        logger.error(f"Error fetching trending: {str(e)}")
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
@require_GET
def get_popular_movies(request):
    """Get popular movies"""
    try:
        page = int(request.GET.get("page", 1))
        data = client.get_popular_movies(page=page)
        return JsonResponse(data, safe=False)
    except Exception as e:
        logger.error(f"Error fetching popular movies: {str(e)}")
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
@require_GET
def get_movie_details(request, movie_id):
    """Get detailed movie information"""
    try:
        data = client.get_movie_details(movie_id)
        return JsonResponse(data, safe=False)
    except Exception as e:
        logger.error(f"Error fetching movie details: {str(e)}")
        return JsonResponse({"error": str(e)}, status=500)


@csrf_exempt
@require_GET
def search(request):
    """Search for movies, TV shows, or people"""
    try:
        from django.conf import settings
        if not settings.TMDB_ACCESS_TOKEN:
            return JsonResponse({
                "error": "TMDB_ACCESS_TOKEN is not configured. Please set it as an environment variable."
            }, status=500)
        
        query = request.GET.get("query", "")
        page = int(request.GET.get("page", 1))
        
        if not query:
            return JsonResponse({"error": "Query parameter is required"}, status=400)
        
        data = client.search(query=query, page=page)
        return JsonResponse(data, safe=False)
    except requests.exceptions.HTTPError as e:
        error_text = ""
        if hasattr(e, 'response') and e.response is not None:
            try:
                error_data = e.response.json()
                error_text = error_data.get('status_message', e.response.text[:200])
            except:
                error_text = e.response.text[:200] if e.response.text else str(e)
        logger.error(f"HTTP error searching: {str(e)} - Response: {error_text}")
        return JsonResponse({
            "error": f"TMDB API error: {str(e)}",
            "details": error_text
        }, status=500)
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        logger.error(f"Error searching: {str(e)}\n{error_trace}")
        return JsonResponse({
            "error": str(e),
            "type": type(e).__name__
        }, status=500)


@csrf_exempt
@require_GET
def get_genres(request):
    """Get list of movie genres"""
    try:
        data = client.get_genres()
        return JsonResponse(data, safe=False)
    except Exception as e:
        logger.error(f"Error fetching genres: {str(e)}")
        return JsonResponse({"error": str(e)}, status=500)
