import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { listConsumed } from '../api/consumed';
import MovieGrid from '../components/MovieGrid';
import type { ConsumedItem, TMDBMovieListItem } from '../types';

function consumedToMovieItem(item: ConsumedItem): TMDBMovieListItem {
  return {
    id: item.tmdb_id,
    title: item.media_type === 'tv' ? undefined : item.title,
    name: item.media_type === 'tv' ? item.title : undefined,
    poster_path: item.poster_path ?? null,
    media_type: item.media_type,
  };
}

function ConsumedPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<ConsumedItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadItems = useCallback(() => {
    if (!user) return;
    setLoading(true);
    listConsumed()
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [user]);

  useEffect(() => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }
    loadItems();
  }, [user, loadItems]);

  const handleMovieClick = useCallback(
    (movie: TMDBMovieListItem) => {
      const path = movie.media_type === 'tv' ? `/tv/${movie.id}` : `/movie/${movie.id}`;
      navigate(path);
    },
    [navigate]
  );

  if (!user) {
    return (
      <div className="consumed-page">
        <div className="consumed-page-inner">
          <h2 className="consumed-page-title">Consumed</h2>
          <p className="consumed-page-subtitle">
            Your list of movies and shows you've marked as consumed.
          </p>
          <p className="consumed-page-empty">
            <Link to="/login">Log in</Link> to see and manage your consumed list.
          </p>
          <Link to="/" className="consumed-back-link">
            ← Back to Soultrust Movie DB
          </Link>
        </div>
      </div>
    );
  }

  const movieItems = items.map(consumedToMovieItem);

  return (
    <div className="consumed-page">
      <div className="consumed-page-inner">
        <h2 className="consumed-page-title">Consumed</h2>
        <p className="consumed-page-subtitle">
          Movies and shows you marked as consumed.
        </p>
        {loading ? (
          <div className="loading-container">
            <div className="spinner" />
            <p>Loading…</p>
          </div>
        ) : items.length === 0 ? (
          <p className="consumed-page-empty">
            Nothing here yet. Open a movie or show and check "Consumed" to add it.
          </p>
        ) : (
          <MovieGrid
            movies={movieItems}
            onMovieClick={handleMovieClick}
            loading={false}
          />
        )}
        <Link to="/" className="consumed-back-link">
          ← Back to Soultrust Movie DB
        </Link>
      </div>
    </div>
  );
}

export default ConsumedPage;
