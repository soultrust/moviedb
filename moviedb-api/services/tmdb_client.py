import requests
from django.conf import settings
from django.core.cache import cache
import logging

logger = logging.getLogger(__name__)


class TMDBClient:
    """
    Lean TMDB client. Start small, expand as needed.
    """

    BASE_URL = "https://api.themoviedb.org/3"

    def __init__(self):
        token = settings.TMDB_ACCESS_TOKEN
        if not token:
            logger.warning("TMDB_ACCESS_TOKEN is not set. API calls will fail.")
        self.headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json;charset=utf-8",
        }

    def _get(self, endpoint, cache_ttl=None, **params):
        params.setdefault("language", "en-US")

        cache_key = f"tmdb:{endpoint}:{hash(frozenset(params.items()))}"
        if cache_ttl:
            cached = cache.get(cache_key)
            if cached:
                return cached

        try:
            response = requests.get(
                f"{self.BASE_URL}/{endpoint}",
                headers=self.headers,
                params=params,
                timeout=10,
            )
            response.raise_for_status()
            data = response.json()

            if cache_ttl:
                cache.set(cache_key, data, cache_ttl)

            return data
        except requests.exceptions.HTTPError as e:
            error_msg = f"TMDB API HTTP Error: {e.response.status_code}"
            if e.response.text:
                try:
                    error_data = e.response.json()
                    error_msg += f" - {error_data.get('status_message', e.response.text)}"
                except:
                    error_msg += f" - {e.response.text[:200]}"
            logger.error(f"{error_msg} - Endpoint: {endpoint}, Params: {params}")
            raise Exception(error_msg) from e
        except requests.exceptions.RequestException as e:
            logger.error(f"TMDB API Request Error: {str(e)} - Endpoint: {endpoint}")
            raise Exception(f"TMDB API request failed: {str(e)}") from e

    # --- The essentials to get your app running ---

    def get_trending(self, media_type="movie", window="week", page=1):
        return self._get(f"trending/{media_type}/{window}", cache_ttl=3600, page=page)

    def get_popular_movies(self, page=1):
        return self._get("movie/popular", cache_ttl=3600, page=page)

    def get_movie_details(self, movie_id):
        return self._get(
            f"movie/{movie_id}",
            cache_ttl=86400,
            append_to_response="credits,videos,similar"
        )

    def search(self, query, page=1):
        return self._get("search/multi", query=query, page=page)

    def get_genres(self):
        return self._get("genre/movie/list", cache_ttl=86400 * 7)

    def get_person_details(self, person_id):
        return self._get(
            f"person/{person_id}",
            cache_ttl=86400,
            append_to_response="movie_credits",
        )
