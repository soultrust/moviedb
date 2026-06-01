import { useState, useEffect, useCallback, useRef, type ChangeEvent } from 'react';
import MovieGrid from './MovieGrid';
import { fetchListRecommendations } from '../api/lists';
import type { TMDBMovieListItem } from '../types';

function showByDefaultStorageKey(listId: number): string {
  return `moviedb_list_recommendations_show_default_${listId}`;
}

function readShowByDefaultForList(listId: number): boolean {
  try {
    return localStorage.getItem(showByDefaultStorageKey(listId)) === '1';
  } catch {
    return false;
  }
}

function writeShowByDefaultForList(listId: number, enabled: boolean): void {
  try {
    localStorage.setItem(showByDefaultStorageKey(listId), enabled ? '1' : '0');
  } catch {
    /* ignore */
  }
}

interface ListRecommendationsSectionProps {
  listId: number;
  listMovies: TMDBMovieListItem[];
  listLoaded: boolean;
  onMovieClick?: (movie: TMDBMovieListItem) => void;
}

export default function ListRecommendationsSection({
  listId,
  listMovies,
  listLoaded,
  onMovieClick,
}: ListRecommendationsSectionProps) {
  const canRecommend = listMovies.some(
    (m) => m.media_type === 'movie' || m.media_type === 'tv',
  );
  const [showByDefault, setShowByDefault] = useState(() =>
    readShowByDefaultForList(listId),
  );
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<TMDBMovieListItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fetchedForListRef = useRef<number | null>(null);

  useEffect(() => {
    setVisible(false);
    setRecommendations([]);
    setError(null);
    setLoading(false);
    fetchedForListRef.current = null;
    setShowByDefault(readShowByDefaultForList(listId));
  }, [listId]);

  const loadRecommendations = useCallback(async () => {
    if (fetchedForListRef.current === listId) return;
    setLoading(true);
    setError(null);
    try {
      const results = await fetchListRecommendations(listId);
      setRecommendations(results);
      fetchedForListRef.current = listId;
    } catch {
      setError('Could not load recommendations.');
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  }, [listId]);

  const showRecs = useCallback(async () => {
    setVisible(true);
    if (fetchedForListRef.current !== listId) {
      await loadRecommendations();
    }
  }, [listId, loadRecommendations]);

  useEffect(() => {
    if (!listLoaded || !canRecommend || !showByDefault) return;
    void showRecs();
  }, [listLoaded, canRecommend, showByDefault, listId, showRecs]);

  const handleShowClick = () => {
    void showRecs();
  };

  const handleDefaultChange = (e: ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setShowByDefault(checked);
    writeShowByDefaultForList(listId, checked);
  };

  if (!listLoaded || !canRecommend) return null;

  return (
    <>
      <div className="list-recommendations-controls">
        <button
          type="button"
          className="list-recommendations-show-btn"
          onClick={handleShowClick}
          disabled={loading && !visible}
        >
          Show Me Recommendations
        </button>
        <label className="list-recommendations-default-label">
          <input
            type="checkbox"
            checked={showByDefault}
            onChange={handleDefaultChange}
          />
          Show by Default
        </label>
      </div>
      {visible && (
        <section className="list-recommendations-section" aria-label="Recommendations">
          <h3 className="list-recommendations-heading">Recommendations</h3>
          {error ? <p className="list-recommendations-error">{error}</p> : null}
          <MovieGrid
            movies={recommendations}
            onMovieClick={onMovieClick}
            loadingInitial={loading && recommendations.length === 0}
          />
        </section>
      )}
    </>
  );
}
