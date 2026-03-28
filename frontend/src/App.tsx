import { useState, useEffect, useRef, useCallback, type RefObject } from "react";
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
import { useInfiniteScroll } from "./hooks/useInfiniteScroll";
import "./App.css";

type Tab = "trending" | "popular" | "search" | "list";

interface BrowseSlotState {
  movies: TMDBMovieListItem[];
  page: number;
  hasMore: boolean;
  loading: boolean;
}

function emptySlot(): BrowseSlotState {
  return {
    movies: [],
    page: 1,
    hasMore: false,
    loading: false,
  };
}

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

  const [trending, setTrending] = useState<BrowseSlotState>(emptySlot);
  const [popular, setPopular] = useState<BrowseSlotState>(emptySlot);
  const [searchSlot, setSearchSlot] = useState<BrowseSlotState & { query: string }>({
    ...emptySlot(),
    query: "",
  });
  const [listSlots, setListSlots] = useState<Record<number, BrowseSlotState>>({});

  const [searchMode, setSearchMode] = useState(false);
  const loadMoreInFlightRef = useRef(false);
  const trendingSentinelRef = useRef<HTMLDivElement>(null);
  const popularSentinelRef = useRef<HTMLDivElement>(null);
  const searchSentinelRef = useRef<HTMLDivElement>(null);

  const listMatch = location.pathname.match(/^\/lists\/(\d+)$/);
  const listId = listMatch ? listMatch[1] : null;
  const listIdNum = listId ? parseInt(listId, 10) : null;

  const activeTab: Tab = listId
    ? "list"
    : location.pathname === "/popular"
      ? "popular"
      : location.pathname === "/trending"
        ? "trending"
        : location.pathname === "/" && searchMode
          ? "search"
          : "trending";

  const listSlot = listIdNum != null ? (listSlots[listIdNum] ?? emptySlot()) : emptySlot();

  useEffect(() => {
    if (location.pathname === "/trending" || location.pathname === "/popular" || listId)
      setSearchMode(false);
  }, [location.pathname, listId]);

  const loadTrending = useCallback(async () => {
    setTrending((s) => ({ ...s, loading: true, movies: [] }));
    try {
      const data = await getTrending("movie", "week", 1);
      if (data) {
        setTrending({
          movies: sortWithPosterFirst(data.results ?? []),
          page: 1,
          hasMore: data.page < data.total_pages,
          loading: false,
        });
      }
    } catch (error) {
      console.error("Failed to load movies:", error);
      setTrending(emptySlot());
    }
  }, []);

  const loadPopular = useCallback(async () => {
    setPopular((s) => ({ ...s, loading: true, movies: [] }));
    try {
      const data = await getPopularMovies(1);
      if (data) {
        setPopular({
          movies: sortWithPosterFirst(data.results ?? []),
          page: 1,
          hasMore: data.page < data.total_pages,
          loading: false,
        });
      }
    } catch (error) {
      console.error("Failed to load movies:", error);
      setPopular(emptySlot());
    }
  }, []);

  const loadListData = useCallback(
    async (id: number) => {
      if (!user) {
        setListSlots((prev) => ({ ...prev, [id]: emptySlot() }));
        return;
      }
      setListSlots((prev) => ({
        ...prev,
        [id]: { ...emptySlot(), loading: true, movies: [] },
      }));
      try {
        const data = await fetchListItems(id);
        const mapped = data.map((item) => ({
          ...item,
          title: item.title ?? undefined,
          name: item.name ?? undefined,
        }));
        const sorted = sortWithPosterFirst(mapped);
        setListSlots((prev) => ({
          ...prev,
          [id]: { movies: sorted, page: 1, hasMore: false, loading: false },
        }));
      } catch (error) {
        console.error("Failed to load list:", error);
        setListSlots((prev) => ({
          ...prev,
          [id]: emptySlot(),
        }));
      }
    },
    [user],
  );

  useEffect(() => {
    if (searchMode) return;
    if (
      location.pathname !== "/" &&
      location.pathname !== "/trending" &&
      location.pathname !== "/popular" &&
      !listId
    )
      return;

    if (listId && listIdNum != null) {
      const slot = listSlots[listIdNum];
      if (slot?.loading) return;
      if (slot && slot.movies.length > 0) return;
      void loadListData(listIdNum);
      return;
    }

    if (location.pathname === "/popular") {
      if (popular.loading) return;
      if (popular.movies.length > 0) return;
      void loadPopular();
      return;
    }

    if (trending.loading) return;
    if (trending.movies.length > 0) return;
    void loadTrending();
  }, [
    location.pathname,
    searchMode,
    listId,
    listIdNum,
    loadListData,
    loadPopular,
    loadTrending,
    popular.loading,
    popular.movies.length,
    trending.loading,
    trending.movies.length,
    listSlots,
  ]);

  const handleSearch = async (query: string) => {
    setSearchMode(true);
    navigate("/");
    setSearchSlot({ ...emptySlot(), query, loading: true, movies: [] });
    try {
      const data = await search(query, 1);
      setSearchSlot({
        query,
        movies: sortWithPosterFirst(data.results ?? []),
        page: 1,
        hasMore: data.page < data.total_pages,
        loading: false,
      });
    } catch (error) {
      console.error("Search failed:", error);
      setSearchSlot({ ...emptySlot(), query, loading: false });
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

  const loadMoreTrending = useCallback(async () => {
    if (loadMoreInFlightRef.current || trending.loading || !trending.hasMore) return;
    loadMoreInFlightRef.current = true;
    setTrending((s) => ({ ...s, loading: true }));
    const nextPage = trending.page + 1;
    try {
      const data = await getTrending("movie", "week", nextPage);
      if (data) {
        setTrending((s) => ({
          ...s,
          movies: sortWithPosterFirst([...s.movies, ...(data.results ?? [])]),
          page: nextPage,
          hasMore: data.page < data.total_pages,
          loading: false,
        }));
      }
    } catch (error) {
      console.error("Failed to load more:", error);
      setTrending((s) => ({ ...s, loading: false }));
    } finally {
      loadMoreInFlightRef.current = false;
    }
  }, [trending.loading, trending.hasMore, trending.page]);

  const loadMorePopular = useCallback(async () => {
    if (loadMoreInFlightRef.current || popular.loading || !popular.hasMore) return;
    loadMoreInFlightRef.current = true;
    setPopular((s) => ({ ...s, loading: true }));
    const nextPage = popular.page + 1;
    try {
      const data = await getPopularMovies(nextPage);
      if (data) {
        setPopular((s) => ({
          ...s,
          movies: sortWithPosterFirst([...s.movies, ...(data.results ?? [])]),
          page: nextPage,
          hasMore: data.page < data.total_pages,
          loading: false,
        }));
      }
    } catch (error) {
      console.error("Failed to load more:", error);
      setPopular((s) => ({ ...s, loading: false }));
    } finally {
      loadMoreInFlightRef.current = false;
    }
  }, [popular.loading, popular.hasMore, popular.page]);

  const loadMoreSearch = useCallback(async () => {
    if (loadMoreInFlightRef.current || searchSlot.loading || !searchSlot.hasMore || !searchSlot.query.trim())
      return;
    loadMoreInFlightRef.current = true;
    setSearchSlot((s) => ({ ...s, loading: true }));
    const nextPage = searchSlot.page + 1;
    try {
      const data = await search(searchSlot.query.trim(), nextPage);
      if (data) {
        setSearchSlot((s) => ({
          ...s,
          movies: sortWithPosterFirst([...s.movies, ...(data.results ?? [])]),
          page: nextPage,
          hasMore: data.page < data.total_pages,
          loading: false,
        }));
      }
    } catch (error) {
      console.error("Failed to load more:", error);
      setSearchSlot((s) => ({ ...s, loading: false }));
    } finally {
      loadMoreInFlightRef.current = false;
    }
  }, [searchSlot.loading, searchSlot.hasMore, searchSlot.page, searchSlot.query]);

  const canTrendingScroll = activeTab === "trending" && trending.hasMore && trending.movies.length > 0;
  const canPopularScroll = activeTab === "popular" && popular.hasMore && popular.movies.length > 0;
  const canSearchScroll =
    activeTab === "search" && searchSlot.hasMore && searchSlot.movies.length > 0;

  useInfiniteScroll(trendingSentinelRef, loadMoreTrending, {
    enabled: canTrendingScroll,
    hasMore: trending.hasMore,
    loading: trending.loading,
  });

  useInfiniteScroll(popularSentinelRef, loadMorePopular, {
    enabled: canPopularScroll,
    hasMore: popular.hasMore,
    loading: popular.loading,
  });

  useInfiniteScroll(searchSentinelRef, loadMoreSearch, {
    enabled: canSearchScroll,
    hasMore: searchSlot.hasMore,
    loading: searchSlot.loading,
  });

  const headerLoading =
    activeTab === "trending"
      ? trending.loading
      : activeTab === "popular"
        ? popular.loading
        : activeTab === "search"
          ? searchSlot.loading
          : activeTab === "list" && listIdNum != null
            ? listSlot.loading
            : false;

  function renderBrowsePanel(
    tab: Tab,
    slot: BrowseSlotState,
    sentinelRef: RefObject<HTMLDivElement | null>,
    showInfinite: boolean,
  ) {
    const loadingInitial = slot.loading && slot.movies.length === 0;
    const loadingMore = slot.loading && slot.movies.length > 0;
    const active = activeTab === tab;

    return (
      <div
        className="browse-panel"
        style={{ display: active ? "block" : "none" }}
        aria-hidden={!active}
      >
        <main className="app-main">
          <MovieGrid
            movies={slot.movies}
            onMovieClick={handleMovieClick}
            loadingInitial={loadingInitial}
          />
          {showInfinite && (
            <>
              <div ref={sentinelRef} className="load-more-sentinel" aria-hidden />
              {loadingMore && (
                <div className="load-more-inline">
                  <div className="spinner spinner-inline" />
                </div>
              )}
            </>
          )}
        </main>
      </div>
    );
  }

  const movieGridContent = (
    <>
      {renderBrowsePanel(
        "trending",
        trending,
        trendingSentinelRef,
        trending.hasMore && trending.movies.length > 0,
      )}
      {renderBrowsePanel(
        "popular",
        popular,
        popularSentinelRef,
        popular.hasMore && popular.movies.length > 0,
      )}
      {renderBrowsePanel(
        "search",
        searchSlot,
        searchSentinelRef,
        searchSlot.hasMore && searchSlot.movies.length > 0,
      )}
      {listIdNum != null && (
        <div
          className="browse-panel"
          style={{ display: activeTab === "list" ? "block" : "none" }}
          aria-hidden={activeTab !== "list"}
        >
          <main className="app-main">
            <MovieGrid
              movies={listSlot.movies}
              onMovieClick={handleMovieClick}
              loadingInitial={listSlot.loading && listSlot.movies.length === 0}
            />
          </main>
        </div>
      )}
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
            <SearchBar onSearch={handleSearch} loading={headerLoading} />
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
