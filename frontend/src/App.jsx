import { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { getTrending, getPopularMovies, getMovieDetails, search, getGenres } from './api/tmdb';
import { useAuth } from './context/AuthContext';
import MovieGrid from './components/MovieGrid';
import MovieDetails from './components/MovieDetails';
import SearchBar from './components/SearchBar';
import ConsumedPage from './pages/ConsumedPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import './App.css';

function App() {
  const { user, logout, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('trending');
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [genres, setGenres] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    loadGenres();
    loadInitialData();
  }, []);

  useEffect(() => {
    if (activeTab !== 'search') {
      loadInitialData();
    }
  }, [activeTab]);

  const loadGenres = async () => {
    try {
      const data = await getGenres();
      setGenres(data.genres || []);
    } catch (error) {
      console.error('Failed to load genres:', error);
    }
  };

  const loadInitialData = async () => {
    setLoading(true);
    setPage(1);
    try {
      let data;
      if (activeTab === 'trending') {
        data = await getTrending('movie', 'week', 1);
      } else if (activeTab === 'popular') {
        data = await getPopularMovies(1);
      }
      
      if (data) {
        setMovies(data.results || []);
        setHasMore(data.page < data.total_pages);
      }
    } catch (error) {
      console.error('Failed to load movies:', error);
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query) => {
    setActiveTab('search');
    setLoading(true);
    setPage(1);
    try {
      const data = await search(query, 1);
      setMovies(data.results || []);
      setHasMore(data.page < data.total_pages);
    } catch (error) {
      console.error('Search failed:', error);
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMovieClick = async (movie) => {
    try {
      const details = await getMovieDetails(movie.id);
      setSelectedMovie(details);
    } catch (error) {
      console.error('Failed to load movie details:', error);
    }
  };

  const loadMore = async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    const nextPage = page + 1;
    try {
      let data;
      if (activeTab === 'trending') {
        data = await getTrending('movie', 'week', nextPage);
      } else if (activeTab === 'popular') {
        data = await getPopularMovies(nextPage);
      } else if (activeTab === 'search') {
        // For search, we'd need to store the query
        return;
      }
      
      if (data) {
        setMovies([...movies, ...(data.results || [])]);
        setPage(nextPage);
        setHasMore(data.page < data.total_pages);
      }
    } catch (error) {
      console.error('Failed to load more:', error);
    } finally {
      setLoading(false);
    }
  };

  const location = useLocation();
  const isConsumedPage = location.pathname === '/consumed';

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎬 MovieDB</h1>
        <p className="subtitle">Discover movies and TV shows</p>
      </header>

      <nav className="app-nav">
        <button 
          className={activeTab === 'trending' && !isConsumedPage ? 'active' : ''}
          onClick={() => setActiveTab('trending')}
        >
          Trending
        </button>
        <button 
          className={activeTab === 'popular' && !isConsumedPage ? 'active' : ''}
          onClick={() => setActiveTab('popular')}
        >
          Popular
        </button>
        <button 
          className={activeTab === 'search' && !isConsumedPage ? 'active' : ''}
          onClick={() => setActiveTab('search')}
        >
          Search
        </button>
        <Link
          to="/consumed"
          className={`nav-link ${isConsumedPage ? 'active' : ''}`}
        >
          Consumed
        </Link>
        {user ? (
          <>
            <span className="nav-user">{user.email}</span>
            <button type="button" onClick={logout} className="nav-logout">Log out</button>
          </>
        ) : (
          <>
            <Link to="/login" className={`nav-link ${location.pathname === '/login' ? 'active' : ''}`}>Log in</Link>
            <Link to="/register" className={`nav-link ${location.pathname === '/register' ? 'active' : ''}`}>Sign up</Link>
          </>
        )}
      </nav>

      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/consumed"
          element={<ConsumedPage />}
        />
        <Route
          path="/"
          element={
            <>
              {activeTab === 'search' && (
                <div className="search-section">
                  <SearchBar onSearch={handleSearch} loading={loading} />
                </div>
              )}

              <main className="app-main">
                <MovieGrid 
                  movies={movies} 
                  onMovieClick={handleMovieClick}
                  loading={loading}
                />
                
                {hasMore && movies.length > 0 && (
                  <div className="load-more-container">
                    <button onClick={loadMore} disabled={loading} className="load-more-btn">
                      {loading ? 'Loading...' : 'Load More'}
                    </button>
                  </div>
                )}
              </main>

              {selectedMovie && (
                <MovieDetails 
                  movie={selectedMovie} 
                  onClose={() => setSelectedMovie(null)} 
                />
              )}
            </>
          }
        />
      </Routes>
    </div>
  );
}

export default App;
