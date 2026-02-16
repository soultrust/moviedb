import { useState, useEffect } from "react";
import { Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import { getTrending, getPopularMovies, search } from "./api/tmdb";
import { useAuth } from "./context/AuthContext";
import MovieGrid from "./components/MovieGrid";
import SearchBar from "./components/SearchBar";
import ConsumedPage from "./pages/ConsumedPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import PersonDetailPage from "./pages/PersonDetailPage";
import MovieDetailPage from "./pages/MovieDetailPage";
import TvDetailPage from "./pages/TvDetailPage";
import type { TMDBMovieListItem } from "./types";
import "./App.css";

type Tab = "trending" | "popular" | "search";

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [movies, setMovies] = useState<TMDBMovieListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [searchMode, setSearchMode] = useState(false);

  const activeTab: Tab =
    location.pathname === "/popular"
      ? "popular"
      : location.pathname === "/trending"
        ? "trending"
        : location.pathname === "/" && searchMode
          ? "search"
          : "trending";

  useEffect(() => {
    if (location.pathname === "/trending" || location.pathname === "/popular") setSearchMode(false);
  }, [location.pathname]);

  useEffect(() => {
    if (location.pathname === "/" && searchMode) return;
    if (location.pathname !== "/" && location.pathname !== "/trending" && location.pathname !== "/popular") return;
    loadInitialData();
  }, [location.pathname, searchMode]);

  const loadInitialData = async () => {
    const mode: Tab =
      location.pathname === "/popular"
        ? "popular"
        : location.pathname === "/trending"
          ? "trending"
          : "trending";
    setLoading(true);
    setPage(1);
    try {
      let data;
      if (mode === "trending") {
        data = await getTrending("movie", "week", 1);
      } else if (mode === "popular") {
        data = await getPopularMovies(1);
      }

      if (data) {
        setMovies(data.results ?? []);
        setHasMore(data.page < data.total_pages);
      }
    } catch (error) {
      console.error("Failed to load movies:", error);
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (query: string) => {
    navigate("/");
    setSearchMode(true);
    setLoading(true);
    setPage(1);
    try {
      const data = await search(query, 1);
      setMovies(data.results ?? []);
      setHasMore(data.page < data.total_pages);
    } catch (error) {
      console.error("Search failed:", error);
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMovieClick = (movie: TMDBMovieListItem) => {
    const path = movie.media_type === 'tv' ? `/tv/${movie.id}` : `/movie/${movie.id}`;
    navigate(path);
  };

  const loadMore = async () => {
    if (loading || !hasMore) return;

    setLoading(true);
    const nextPage = page + 1;
    try {
      let data;
      if (activeTab === "trending") {
        data = await getTrending("movie", "week", nextPage);
      } else if (activeTab === "popular") {
        data = await getPopularMovies(nextPage);
      } else if (activeTab === "search") {
        return;
      }

      if (data) {
        setMovies((prev) => [...prev, ...(data.results ?? [])]);
        setPage(nextPage);
        setHasMore(data.page < data.total_pages);
      }
    } catch (error) {
      console.error("Failed to load more:", error);
    } finally {
      setLoading(false);
    }
  };

  const isConsumedPage = location.pathname === "/consumed";

  const movieGridContent = (
    <>
      <main className="app-main">
        <MovieGrid movies={movies} onMovieClick={handleMovieClick} loading={loading} />

        {hasMore && movies.length > 0 && (
          <div className="load-more-container">
            <button
              type="button"
              onClick={loadMore}
              disabled={loading}
              className="load-more-btn"
            >
              {loading ? "Loading..." : "Load More"}
            </button>
          </div>
        )}
      </main>
    </>
  );

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-inner">
          <div className="header-brand">
            <h1>Soultrust Movie DB</h1>
            <p className="subtitle">Discover movies and TV shows</p>
          </div>
          <div className="header-auth">
            {user ? (
              <>
                <span className="header-email">{user.email}</span>
                <button type="button" onClick={logout} className="header-btn header-logout">
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`header-link ${location.pathname === "/login" ? "active" : ""}`}
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className={`header-link ${location.pathname === "/register" ? "active" : ""}`}
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </div>
        <nav className="header-nav">
          <div className="header-search">
            <SearchBar onSearch={handleSearch} loading={loading} />
          </div>
          <Link
            to="/trending"
            className={`header-link ${(location.pathname === "/trending" || (location.pathname === "/" && !searchMode)) ? "active" : ""}`}
          >
            Trending
          </Link>
          <Link
            to="/popular"
            className={`header-link ${location.pathname === "/popular" ? "active" : ""}`}
          >
            Popular
          </Link>
          <Link to="/consumed" className={`header-link ${isConsumedPage ? "active" : ""}`}>
            Consumed
          </Link>
        </nav>
      </header>

      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/consumed" element={<ConsumedPage />} />
        <Route path="/person/:id" element={<PersonDetailPage />} />
        <Route path="/movie/:id" element={<MovieDetailPage />} />
        <Route path="/tv/:id" element={<TvDetailPage />} />
        <Route path="/trending" element={movieGridContent} />
        <Route path="/popular" element={movieGridContent} />
        <Route path="/" element={movieGridContent} />
      </Routes>
    </div>
  );
}

export default App;
