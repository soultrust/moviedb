const API_BASE_URL = 'http://localhost:8000/api/movies';

/**
 * Fetch trending movies or TV shows
 * @param {string} mediaType - 'movie' or 'tv'
 * @param {string} window - 'day' or 'week'
 * @param {number} page - Page number
 */
export const getTrending = async (mediaType = 'movie', window = 'week', page = 1) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/trending/?media_type=${mediaType}&window=${window}&page=${page}`
    );
    if (!response.ok) throw new Error('Failed to fetch trending');
    return await response.json();
  } catch (error) {
    console.error('Error fetching trending:', error);
    throw error;
  }
};

/**
 * Fetch popular movies
 * @param {number} page - Page number
 */
export const getPopularMovies = async (page = 1) => {
  try {
    const response = await fetch(`${API_BASE_URL}/popular/?page=${page}`);
    if (!response.ok) throw new Error('Failed to fetch popular movies');
    return await response.json();
  } catch (error) {
    console.error('Error fetching popular movies:', error);
    throw error;
  }
};

/**
 * Fetch movie details by ID
 * @param {number} movieId - Movie ID
 */
export const getMovieDetails = async (movieId) => {
  try {
    const response = await fetch(`${API_BASE_URL}/movie/${movieId}/`);
    if (!response.ok) throw new Error('Failed to fetch movie details');
    return await response.json();
  } catch (error) {
    console.error('Error fetching movie details:', error);
    throw error;
  }
};

/**
 * Search for movies, TV shows, or people
 * @param {string} query - Search query
 * @param {number} page - Page number
 */
export const search = async (query, page = 1) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/search/?query=${encodeURIComponent(query)}&page=${page}`
    );
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to search' }));
      throw new Error(errorData.error || `Search failed with status ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error searching:', error);
    throw error;
  }
};

/**
 * Fetch movie genres
 */
export const getGenres = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/genres/`);
    if (!response.ok) throw new Error('Failed to fetch genres');
    return await response.json();
  } catch (error) {
    console.error('Error fetching genres:', error);
    throw error;
  }
};
