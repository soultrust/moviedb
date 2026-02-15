import type {
  TMDBMovieDetails,
  TMDBMovieListItem,
  TMDBPaginatedResponse,
  TMDBGenresResponse,
  TMDBSearchResponse,
} from '../types';

const API_BASE_URL = 'http://localhost:8000/api/movies';

/**
 * Fetch trending movies or TV shows
 */
export const getTrending = async (
  mediaType: 'movie' | 'tv' = 'movie',
  window: 'day' | 'week' = 'week',
  page = 1
): Promise<TMDBPaginatedResponse<TMDBMovieListItem>> => {
  const response = await fetch(
    `${API_BASE_URL}/trending/?media_type=${mediaType}&window=${window}&page=${page}`
  );
  if (!response.ok) throw new Error('Failed to fetch trending');
  return response.json() as Promise<TMDBPaginatedResponse<TMDBMovieListItem>>;
};

/**
 * Fetch popular movies
 */
export const getPopularMovies = async (
  page = 1
): Promise<TMDBPaginatedResponse<TMDBMovieListItem>> => {
  const response = await fetch(`${API_BASE_URL}/popular/?page=${page}`);
  if (!response.ok) throw new Error('Failed to fetch popular movies');
  return response.json() as Promise<TMDBPaginatedResponse<TMDBMovieListItem>>;
};

/**
 * Fetch movie details by ID
 */
export const getMovieDetails = async (movieId: number): Promise<TMDBMovieDetails> => {
  const response = await fetch(`${API_BASE_URL}/movie/${movieId}/`);
  if (!response.ok) throw new Error('Failed to fetch movie details');
  return response.json() as Promise<TMDBMovieDetails>;
};

/**
 * Search for movies, TV shows, or people
 */
export const search = async (
  query: string,
  page = 1
): Promise<TMDBSearchResponse> => {
  const response = await fetch(
    `${API_BASE_URL}/search/?query=${encodeURIComponent(query)}&page=${page}`
  );
  if (!response.ok) {
    const errorData = (await response.json().catch(() => ({ error: 'Failed to search' }))) as {
      error?: string;
    };
    throw new Error(errorData.error ?? `Search failed with status ${response.status}`);
  }
  return response.json() as Promise<TMDBSearchResponse>;
};

/**
 * Fetch movie genres
 */
export const getGenres = async (): Promise<TMDBGenresResponse> => {
  const response = await fetch(`${API_BASE_URL}/genres/`);
  if (!response.ok) throw new Error('Failed to fetch genres');
  return response.json() as Promise<TMDBGenresResponse>;
};
