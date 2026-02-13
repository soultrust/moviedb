import { useState } from 'react';

const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

function MovieCard({ movie, onClick }) {
  const [imageError, setImageError] = useState(false);
  
  const posterPath = movie.poster_path 
    ? `${IMAGE_BASE_URL}${movie.poster_path}` 
    : '/placeholder-poster.jpg';
  
  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className="movie-card" onClick={() => onClick && onClick(movie)}>
      <div className="movie-poster">
        {!imageError ? (
          <img 
            src={posterPath} 
            alt={movie.title || movie.name || 'Movie poster'} 
            onError={handleImageError}
            loading="lazy"
          />
        ) : (
          <div className="poster-placeholder">
            <span>No Image</span>
          </div>
        )}
      </div>
      <div className="movie-info">
        <h3 className="movie-title">{movie.title || movie.name}</h3>
        {movie.release_date && (
          <p className="movie-date">{new Date(movie.release_date).getFullYear()}</p>
        )}
        {movie.vote_average && (
          <div className="movie-rating">
            <span>⭐</span>
            <span>{movie.vote_average.toFixed(1)}</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default MovieCard;
