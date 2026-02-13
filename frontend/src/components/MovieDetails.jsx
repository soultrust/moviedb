const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const BACKDROP_BASE_URL = 'https://image.tmdb.org/t/p/w1280';

function MovieDetails({ movie, onClose }) {
  if (!movie) return null;

  const backdropUrl = movie.backdrop_path 
    ? `${BACKDROP_BASE_URL}${movie.backdrop_path}` 
    : null;
  
  const posterUrl = movie.poster_path 
    ? `${IMAGE_BASE_URL}${movie.poster_path}` 
    : null;

  return (
    <div className="movie-details-overlay" onClick={onClose}>
      <div className="movie-details-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>
        
        {backdropUrl && (
          <div className="movie-backdrop">
            <img src={backdropUrl} alt={movie.title} />
          </div>
        )}
        
        <div className="movie-details-body">
          {posterUrl && (
            <div className="movie-details-poster">
              <img src={posterUrl} alt={movie.title} />
            </div>
          )}
          
          <div className="movie-details-info">
            <h1>{movie.title}</h1>
            
            {movie.tagline && <p className="tagline">{movie.tagline}</p>}
            
            <div className="movie-meta">
              {movie.release_date && (
                <span>{new Date(movie.release_date).getFullYear()}</span>
              )}
              {movie.runtime && <span>{movie.runtime} min</span>}
              {movie.vote_average && (
                <span>⭐ {movie.vote_average.toFixed(1)}</span>
              )}
            </div>
            
            {movie.genres && movie.genres.length > 0 && (
              <div className="genres">
                {movie.genres.map((genre) => (
                  <span key={genre.id} className="genre-tag">{genre.name}</span>
                ))}
              </div>
            )}
            
            {movie.overview && (
              <div className="overview">
                <h3>Overview</h3>
                <p>{movie.overview}</p>
              </div>
            )}
            
            {movie.credits && movie.credits.cast && movie.credits.cast.length > 0 && (
              <div className="cast">
                <h3>Cast</h3>
                <div className="cast-list">
                  {movie.credits.cast.slice(0, 10).map((actor) => (
                    <div key={actor.id} className="cast-member">
                      {actor.profile_path && (
                        <img 
                          src={`${IMAGE_BASE_URL}${actor.profile_path}`} 
                          alt={actor.name}
                        />
                      )}
                      <p>{actor.name}</p>
                      <p className="character">{actor.character}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {movie.videos && movie.videos.results && movie.videos.results.length > 0 && (
              <div className="videos">
                <h3>Trailers</h3>
                <div className="video-list">
                  {movie.videos.results
                    .filter(video => video.type === 'Trailer' && video.site === 'YouTube')
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
      </div>
    </div>
  );
}

export default MovieDetails;
