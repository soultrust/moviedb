/**
 * API configuration
 * Uses VITE_API_URL from environment, falls back to localhost for local development
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const API_URLS = {
  // Base API URL (no trailing slash)
  BASE: API_BASE_URL,
  // Movies/TMDB endpoints
  MOVIES: `${API_BASE_URL}/api/movies`,
  // Auth endpoints
  AUTH: `${API_BASE_URL}/api/auth`,
  // Consumed endpoints
  CONSUMED: `${API_BASE_URL}/api/auth/consumed`,
} as const;
