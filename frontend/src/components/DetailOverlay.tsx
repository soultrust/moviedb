interface DetailOverlayProps {
  children: React.ReactNode;
  onClose: () => void;
  contentClassName?: string;
}

/**
 * Single overlay container for all detail views (movie, TV, person).
 * Ensures only one overlay exists at a time when navigating between details.
 */
function DetailOverlay({ children, onClose, contentClassName }: DetailOverlayProps) {
  const contentClass = contentClassName
    ? `movie-details-content ${contentClassName}`
    : 'movie-details-content';
  return (
    <div className="movie-details-overlay" onClick={onClose}>
      <div className={contentClass} onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose} type="button">
          ×
        </button>
        {children}
      </div>
    </div>
  );
}

export default DetailOverlay;
