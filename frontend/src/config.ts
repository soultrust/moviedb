/**
 * API configuration
 * In dev: use relative URL so Vite proxy handles /api -> backend (avoids CORS)
 * In prod: use VITE_API_URL or fallback
 */
const API_BASE_URL =
  import.meta.env.DEV ? "" : (import.meta.env.VITE_API_URL || "http://localhost:8000");

export const API_URLS = {
  // Base API URL (no trailing slash)
  BASE: API_BASE_URL,
  // Movies/TMDB endpoints
  MOVIES: `${API_BASE_URL}/api/movies`,
  // Auth endpoints
  AUTH: `${API_BASE_URL}/api/auth`,
  // Lists endpoints
  LISTS: `${API_BASE_URL}/api/auth/lists`,
} as const;
