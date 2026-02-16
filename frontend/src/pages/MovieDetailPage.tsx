import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMovieDetails } from '../api/tmdb';
import MovieDetails from '../components/MovieDetails';
import type { TMDBMovieDetails } from '../types';

function MovieDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<TMDBMovieDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const movieId = id != null ? parseInt(id, 10) : NaN;

  useEffect(() => {
    if (Number.isNaN(movieId)) {
      navigate('/trending', { replace: true });
      return;
    }
    setLoading(true);
    setError(null);
    getMovieDetails(movieId)
      .then(setMovie)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [movieId, navigate]);

  if (Number.isNaN(movieId)) {
    return null;
  }

  if (loading) {
    return (
      <div className="movie-details-overlay" onClick={() => navigate(-1)}>
        <div className="movie-details-content" onClick={(e) => e.stopPropagation()}>
          <button className="close-button" onClick={() => navigate(-1)} type="button">
            ×
          </button>
          <div className="loading-container" style={{ padding: '3rem' }}>
            <div className="spinner" />
            <p>Loading…</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="movie-details-overlay" onClick={() => navigate(-1)}>
        <div className="movie-details-content" onClick={(e) => e.stopPropagation()}>
          <button className="close-button" onClick={() => navigate(-1)} type="button">
            ×
          </button>
          <div style={{ padding: '2rem' }}>
            <p className="person-detail-error">{error ?? 'Movie not found.'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <MovieDetails
      movie={movie}
      onClose={() => navigate(-1)}
    />
  );
}

export default MovieDetailPage;
