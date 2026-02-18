import { useState, useEffect } from "react";
import { Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import { getTrending, getPopularMovies, search } from "./api/tmdb";
import { fetchListItems } from "./api/lists";
import { useAuth } from "./context/AuthContext";
import MovieGrid from "./components/MovieGrid";
import SearchBar from "./components/SearchBar";
import ListsDropdown from "./components/ListsDropdown";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DetailOverlay from "./components/DetailOverlay";
import PersonDetailPage from "./pages/PersonDetailPage";
import MovieDetailPage from "./pages/MovieDetailPage";
import TvDetailPage from "./pages/TvDetailPage";
import type { TMDBMovieListItem } from "./types";
import "./App.css";

type Tab = "trending" | "popular" | "search" | "list";

/** Sort so items with a poster/thumbnail appear first. */
function sortWithPosterFirst<T extends { poster_path?: string | null }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const aHas = Boolean(a.poster_path);
    const bHas = Boolean(b.poster_path);
    if (aHas === bHas) return 0;
    return aHas ? -1 : 1;
  });
}

function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [movies, setMovies] = useState<TMDBMovieListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [searchMode, setSearchMode] = useState(false);

  const listMatch = location.pathname.match(/^\/lists\/(\d+)$/);
  const listId = listMatch ? listMatch[1] : null;

  const activeTab: Tab = listId
    ? "list"
    : location.pathname === "/popular"
      ? "popular"
      : location.pathname === "/trending"
        ? "trending"
        : location.pathname === "/" && searchMode
          ? "search"
          : "trending";

  useEffect(() => {
    if (location.pathname === "/trending" || location.pathname === "/popular" || listId)
      setSearchMode(false);
  }, [location.pathname, listId]);

  useEffect(() => {
    if (searchMode) return;
    if (
      location.pathname !== "/" &&
      location.pathname !== "/trending" &&
      location.pathname !== "/popular" &&
      !listId
    )
      return;
    if (listId) {
      loadListData(parseInt(listId, 10));
      return;
    }
    loadInitialData();
  }, [location.pathname, searchMode, listId]);

  const loadListData = async (id: number) => {
    if (!user) {
      setMovies([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setPage(1);
    try {
      const data = await fetchListItems(id);
      const mapped = data.map((item) => ({
        ...item,
        title: item.title ?? undefined,
        name: item.name ?? undefined,
      }));
      setMovies(sortWithPosterFirst(mapped));
      setHasMore(false);
    } catch (error) {
      console.error("Failed to load list:", error);
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

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
        setMovies(sortWithPosterFirst(data.results ?? []));
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
    setSearchMode(true);
    navigate("/");
    setLoading(true);
    setPage(1);
    try {
      const data = await search(query, 1);
      setMovies(sortWithPosterFirst(data.results ?? []));
      setHasMore(data.page < data.total_pages);
    } catch (error) {
      console.error("Search failed:", error);
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMovieClick = (item: TMDBMovieListItem) => {
    const path =
      item.media_type === "person"
        ? `/person/${item.id}`
        : item.media_type === "tv"
          ? `/tv/${item.id}`
          : `/movie/${item.id}`;
    navigate(path);
  };

  const loadMore = async () => {
    if (loading || !hasMore || activeTab === "list" || activeTab === "search") return;

    setLoading(true);
    const nextPage = page + 1;
    try {
      let data;
      if (activeTab === "trending") {
        data = await getTrending("movie", "week", nextPage);
      } else if (activeTab === "popular") {
        data = await getPopularMovies(nextPage);
      } else {
        return;
      }

      if (data) {
        setMovies((prev) => sortWithPosterFirst([...prev, ...(data.results ?? [])]));
        setPage(nextPage);
        setHasMore(data.page < data.total_pages);
      }
    } catch (error) {
      console.error("Failed to load more:", error);
    } finally {
      setLoading(false);
    }
  };

  const movieGridContent = (
    <>
      <main className="app-main">
        <MovieGrid movies={movies} onMovieClick={handleMovieClick} loading={loading} />

        {hasMore && movies.length > 0 && (
          <div className="load-more-container">
            <button type="button" onClick={loadMore} disabled={loading} className="load-more-btn">
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
            className={`header-link ${location.pathname === "/trending" || (location.pathname === "/" && !searchMode) ? "active" : ""}`}
          >
            Trending
          </Link>
          <Link
            to="/popular"
            className={`header-link ${location.pathname === "/popular" ? "active" : ""}`}
          >
            Popular
          </Link>
          <ListsDropdown
            isAuthenticated={!!user}
            onSelectList={(id) => navigate(`/lists/${id}`)}
            isListActive={!!listId}
          />
        </nav>
      </header>

      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/person/:id"
          element={
            <DetailOverlay
              key={location.pathname}
              onClose={() => navigate(-1)}
              contentClassName="person-details-content"
            >
              <PersonDetailPage />
            </DetailOverlay>
          }
        />
        <Route
          path="/movie/:id"
          element={
            <DetailOverlay key={location.pathname} onClose={() => navigate(-1)}>
              <MovieDetailPage />
            </DetailOverlay>
          }
        />
        <Route
          path="/tv/:id"
          element={
            <DetailOverlay key={location.pathname} onClose={() => navigate(-1)}>
              <TvDetailPage />
            </DetailOverlay>
          }
        />
        <Route path="/trending" element={movieGridContent} />
        <Route path="/popular" element={movieGridContent} />
        <Route path="/lists/:listId" element={movieGridContent} />
        <Route path="/" element={movieGridContent} />
      </Routes>
    </div>
  );
}

export default App;
