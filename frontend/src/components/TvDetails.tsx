import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AddToListModal from './AddToListModal';
import type { TMDBTvDetails } from '../types';

const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const BACKDROP_BASE_URL = 'https://image.tmdb.org/t/p/w1280';

interface TvDetailsProps {
  show: TMDBTvDetails | null;
}

function TvDetails({ show }: TvDetailsProps) {
  const { user } = useAuth();
  const [showAddToListModal, setShowAddToListModal] = useState(false);

  if (!show) return null;

  const backdropUrl = show.backdrop_path
    ? `${BACKDROP_BASE_URL}${show.backdrop_path}`
    : null;
  const posterUrl = show.poster_path
    ? `${IMAGE_BASE_URL}${show.poster_path}`
    : null;

  return (
    <>
      {backdropUrl && (
          <div className="movie-backdrop">
            <img src={backdropUrl} alt={show.name} />
          </div>
        )}

        <div className="movie-details-body">
          <div className="movie-details-content-header">
            {user ? (
              <button
                type="button"
                className="add-to-list-btn"
                onClick={() => setShowAddToListModal(true)}
              >
                Add to Lists
              </button>
            ) : (
              <span className="consumed-login-hint">
                <Link to="/login">Log in</Link> to add to lists
              </span>
            )}
          </div>
          {posterUrl && (
            <div className="movie-details-poster">
              <img src={posterUrl} alt={show.name} />
            </div>
          )}

          <div className="movie-details-info">
            <h1>{show.name}</h1>

            <div className="movie-meta">
              {show.first_air_date && (
                <span>First aired {new Date(show.first_air_date).getFullYear()}</span>
              )}
              {show.number_of_seasons != null && (
                <span>{show.number_of_seasons} season{show.number_of_seasons !== 1 ? 's' : ''}</span>
              )}
              {show.vote_average != null && (
                <span>⭐ {show.vote_average.toFixed(1)}</span>
              )}
            </div>

            {show.genres && show.genres.length > 0 && (
              <div className="genres">
                {show.genres.map((genre) => (
                  <span key={genre.id} className="genre-tag">
                    {genre.name}
                  </span>
                ))}
              </div>
            )}

            {show.overview && (
              <div className="overview">
                <h3>Overview</h3>
                <p>{show.overview}</p>
              </div>
            )}

            {show.credits?.cast && show.credits.cast.length > 0 && (
              <div className="cast">
                <h3>Cast</h3>
                <div className="cast-list">
                  {show.credits.cast.slice(0, 10).map((actor) => (
                    <Link
                      key={actor.id}
                      to={`/person/${actor.id}`}
                      replace
                      className="cast-member cast-member-link"
                    >
                      {actor.profile_path ? (
                        <img
                          src={`${IMAGE_BASE_URL}${actor.profile_path}`}
                          alt={actor.name}
                        />
                      ) : (
                        <div className="cast-member-placeholder">No photo</div>
                      )}
                      <p>{actor.name}</p>
                      <p className="character">{actor.character}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {show.videos?.results && show.videos.results.length > 0 && (
              <div className="videos">
                <h3>Trailers</h3>
                <div className="video-list">
                  {show.videos.results
                    .filter(
                      (video) =>
                        video.type === 'Trailer' && video.site === 'YouTube'
                    )
                    .slice(0, 3)
                    .map((video) => (
                      <div key={video.id} className="video-item">
                        <a
                          href={`https://www.youtube.com/watch?v=${video.key}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {video.name}
                        </a>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>

      {showAddToListModal && user && (
        <AddToListModal
          item={{
            id: show.id,
            mediaType: 'tv',
            title: show.name,
            posterPath: show.poster_path ?? null,
          }}
          listMediaType="media"
          onClose={() => setShowAddToListModal(false)}
        />
      )}
    </>
  );
}

export default TvDetails;
