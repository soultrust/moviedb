import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { listConsumed } from '../api/consumed';
import type { ConsumedItem } from '../types';

function ConsumedPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<ConsumedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    listConsumed()
      .then((data) => setItems(Array.isArray(data) ? data : []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <div className="consumed-page">
        <h2 className="consumed-page-title">Consumed</h2>
        <p className="consumed-page-subtitle">
          Your list of movies and shows you've marked as consumed.
        </p>
        <p className="consumed-page-empty">
          <Link to="/login">Log in</Link> to see and manage your consumed list.
        </p>
        <Link to="/" className="consumed-back-link">
          ← Back to MovieDB
        </Link>
      </div>
    );
  }

  return (
    <div className="consumed-page">
      <h2 className="consumed-page-title">Consumed</h2>
      <p className="consumed-page-subtitle">
        Movies and shows you marked as consumed.
      </p>
      {loading ? (
        <p className="consumed-page-empty">Loading…</p>
      ) : items.length === 0 ? (
        <p className="consumed-page-empty">
          Nothing here yet. Open a movie or show and check "Consumed" to add it.
        </p>
      ) : (
        <ul className="consumed-list">
          {items.map((item) => (
            <li
              key={`${item.media_type}-${item.tmdb_id}-${item.id}`}
              className="consumed-list-item"
            >
              <span className="consumed-list-title">{item.title}</span>
              <span className="consumed-list-type">
                {item.media_type === 'tv' ? 'TV' : 'Movie'}
              </span>
            </li>
          ))}
        </ul>
      )}
      <Link to="/" className="consumed-back-link">
        ← Back to MovieDB
      </Link>
    </div>
  );
}

export default ConsumedPage;
