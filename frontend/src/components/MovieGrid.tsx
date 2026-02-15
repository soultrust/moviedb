import MovieCard from './MovieCard';
import type { TMDBMovieListItem } from '../types';

interface MovieGridProps {
  movies: TMDBMovieListItem[];
  onMovieClick?: (movie: TMDBMovieListItem) => void;
  loading: boolean;
}

function MovieGrid({ movies, onMovieClick, loading }: MovieGridProps) {
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading movies...</p>
      </div>
    );
  }

  if (!movies || movies.length === 0) {
    return (
      <div className="empty-state">
        <p>No movies found</p>
      </div>
    );
  }

  return (
    <div className="movie-grid">
      {movies.map((movie) => (
        <MovieCard
          key={movie.id}
          movie={movie}
          onClick={onMovieClick}
        />
      ))}
    </div>
  );
}

export default MovieGrid;
