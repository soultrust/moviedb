import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { getPersonDetails } from '../api/tmdb';
import type { TMDBPersonDetails } from '../types';

const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

function PersonDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [person, setPerson] = useState<TMDBPersonDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const numId = parseInt(id, 10);
    if (Number.isNaN(numId)) {
      setError('Invalid person ID');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    getPersonDetails(numId)
      .then(setPerson)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="person-detail-page">
        <div className="loading-container">
          <div className="spinner" />
          <p>Loading…</p>
        </div>
      </div>
    );
  }

  if (error || !person) {
    return (
      <div className="person-detail-page">
        <p className="person-detail-error">{error ?? 'Person not found.'}</p>
        <button type="button" onClick={() => navigate(-1)} className="load-more-btn">
          Go back
        </button>
      </div>
    );
  }

  const profileUrl = person.profile_path
    ? `${IMAGE_BASE_URL}${person.profile_path}`
    : null;
  const cast = person.movie_credits?.cast ?? [];
  const sortedCast = [...cast].sort((a, b) => {
    const aYear = a.release_date ? new Date(a.release_date).getFullYear() : 0;
    const bYear = b.release_date ? new Date(b.release_date).getFullYear() : 0;
    return bYear - aYear;
  });

  return (
    <div className="person-detail-page">
      <div className="person-detail-inner">
        <Link to="/trending" className="person-detail-back">
          ← Back
        </Link>

        <div className="person-detail-header">
          {profileUrl && (
            <div className="person-detail-profile">
              <img src={profileUrl} alt={person.name} />
            </div>
          )}
          <div className="person-detail-meta">
            <h1 className="person-detail-name">{person.name}</h1>
            {person.known_for_department && (
              <p className="person-detail-dept">{person.known_for_department}</p>
            )}
            {person.birthday && (
              <p className="person-detail-birth">
                Born {person.birthday}
                {person.place_of_birth && ` in ${person.place_of_birth}`}
              </p>
            )}
            {person.deathday && (
              <p className="person-detail-death">Died {person.deathday}</p>
            )}
          </div>
        </div>

        {person.biography && (
          <div className="person-detail-bio">
            <h3>Biography</h3>
            <p>{person.biography}</p>
          </div>
        )}

        {sortedCast.length > 0 && (
          <div className="person-detail-movies">
            <h3>Movie credits</h3>
            <ul className="person-movie-list">
              {sortedCast.slice(0, 24).map((movie) => (
                <li key={movie.id} className="person-movie-item">
                  <Link to="/trending" state={{ openMovieId: movie.id }} className="person-movie-link">
                    {movie.poster_path ? (
                      <img
                        src={`${IMAGE_BASE_URL}${movie.poster_path}`}
                        alt=""
                        className="person-movie-poster"
                      />
                    ) : (
                      <div className="person-movie-poster person-movie-poster-placeholder">
                        No image
                      </div>
                    )}
                    <span className="person-movie-title">{movie.title}</span>
                    {movie.release_date && (
                      <span className="person-movie-year">
                        {new Date(movie.release_date).getFullYear()}
                      </span>
                    )}
                    {movie.character && (
                      <span className="person-movie-character">as {movie.character}</span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default PersonDetailPage;
