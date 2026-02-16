import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTvDetails } from '../api/tmdb';
import TvDetails from '../components/TvDetails';
import type { TMDBTvDetails } from '../types';

function TvDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [show, setShow] = useState<TMDBTvDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const tvId = id != null ? parseInt(id, 10) : NaN;

  useEffect(() => {
    if (Number.isNaN(tvId)) {
      navigate('/trending', { replace: true });
      return;
    }
    setLoading(true);
    setError(null);
    getTvDetails(tvId)
      .then(setShow)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [tvId, navigate]);

  if (Number.isNaN(tvId)) return null;

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

  if (error || !show) {
    return (
      <div className="movie-details-overlay" onClick={() => navigate(-1)}>
        <div className="movie-details-content" onClick={(e) => e.stopPropagation()}>
          <button className="close-button" onClick={() => navigate(-1)} type="button">
            ×
          </button>
          <div style={{ padding: '2rem' }}>
            <p className="person-detail-error">{error ?? 'Show not found.'}</p>
          </div>
        </div>
      </div>
    );
  }

  return <TvDetails show={show} onClose={() => navigate(-1)} />;
}

export default TvDetailPage;
