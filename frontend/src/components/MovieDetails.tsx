import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AddToListModal from './AddToListModal';
import type { TMDBMovieDetails as TMDBMovieDetailsType } from '../types';
import { sortCrewWithDirectorsFirst } from '../utils/crew';

const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const BACKDROP_BASE_URL = 'https://image.tmdb.org/t/p/w1280';

interface MovieDetailsProps {
  movie: TMDBMovieDetailsType | null;
}

function MovieDetails({ movie }: MovieDetailsProps) {
  const { user } = useAuth();
  const [showAddToListModal, setShowAddToListModal] = useState(false);

  if (!movie) return null;

  const backdropUrl = movie.backdrop_path
    ? `${BACKDROP_BASE_URL}${movie.backdrop_path}`
    : null;

  const posterUrl = movie.poster_path
    ? `${IMAGE_BASE_URL}${movie.poster_path}`
    : null;

  const sortedCrew = useMemo(
    () =>
      movie.credits?.crew?.length
        ? sortCrewWithDirectorsFirst(movie.credits.crew)
        : [],
    [movie.credits?.crew],
  );

  return (
    <>
      {backdropUrl && (
          <div className="movie-backdrop">
            <img src={backdropUrl} alt={movie.title ?? movie.name ?? ''} />
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
              <img src={posterUrl} alt={movie.title ?? movie.name ?? ''} />
            </div>
          )}

          <div className="movie-details-info">
            <h1 className="movie-detail-title">{movie.title ?? movie.name}</h1>

            {movie.tagline && <p className="tagline">{movie.tagline}</p>}

            <div className="movie-meta">
              {movie.release_date && (
                <span>{new Date(movie.release_date).getFullYear()}</span>
              )}
              {movie.runtime != null && <span>{movie.runtime} min</span>}
              {movie.vote_average != null && (
                <span>⭐ {movie.vote_average.toFixed(1)}</span>
              )}
            </div>

            {movie.genres && movie.genres.length > 0 && (
              <div className="genres">
                {movie.genres.map((genre) => (
                  <span key={genre.id} className="genre-tag">
                    {genre.name}
                  </span>
                ))}
              </div>
            )}

            {movie.overview && (
              <div className="overview">
                <h3 className="movie-detail-section-title">Overview</h3>
                <p>{movie.overview}</p>
              </div>
            )}

            {movie.credits?.cast && movie.credits.cast.length > 0 && (
              <div className="cast">
                <h3 className="movie-detail-section-title">Cast</h3>
                <div className="cast-list">
                  {movie.credits.cast.slice(0, 10).map((actor) => (
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

            {sortedCrew.length > 0 && (
              <div className="crew">
                <h3 className="movie-detail-section-title">Crew</h3>
                <table className="movie-crew-table">
                  <tbody>
                    {sortedCrew.map((member, index) => (
                      <tr key={`${member.id}-${member.job}-${index}`}>
                        <td>{member.job}</td>
                        <td>
                          <Link to={`/person/${member.id}`} replace>
                            {member.name}
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {movie.videos?.results && movie.videos.results.length > 0 && (
              <div className="videos">
                <h3 className="movie-detail-section-title">Trailers</h3>
                <div className="video-list">
                  {movie.videos.results
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
            id: movie.id,
            mediaType: 'movie',
            title: movie.title ?? movie.name ?? '',
            posterPath: movie.poster_path ?? null,
          }}
          listMediaType="media"
          onClose={() => setShowAddToListModal(false)}
        />
      )}
    </>
  );
}

export default MovieDetails;
