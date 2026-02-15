// Auth
export interface User {
  id: number;
  email: string;
  name: string | null;
  username: string;
}

export interface AuthPayload {
  access: string;
  refresh: string;
  user: User;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  setAuth: (payload: Partial<AuthPayload>) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

// Consumed (backend model)
export interface ConsumedItem {
  id: number;
  tmdb_id: number;
  title: string;
  media_type: string;
}

export interface ToggleConsumedPayload {
  id: number;
  title?: string;
  name?: string;
  media_type?: string;
}

// TMDB API (minimal shapes; API returns more)
export interface TMDBMovieListItem {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  release_date?: string;
  vote_average?: number;
  media_type?: string;
}

export interface TMDBPaginatedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results?: number;
}

export interface TMDBGenre {
  id: number;
  name: string;
}

export interface TMDBMovieDetails extends TMDBMovieListItem {
  backdrop_path: string | null;
  tagline?: string;
  runtime?: number;
  overview?: string;
  genres?: TMDBGenre[];
  credits?: {
    cast?: Array<{
      id: number;
      name: string;
      character: string;
      profile_path: string | null;
    }>;
  };
  videos?: {
    results?: Array<{
      id: string;
      name: string;
      type: string;
      site: string;
      key: string;
    }>;
  };
}

export interface TMDBSearchResponse {
  page: number;
  results: TMDBMovieListItem[];
  total_pages: number;
}

export interface TMDBGenresResponse {
  genres: TMDBGenre[];
}
