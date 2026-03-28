import { useEffect, type RefObject } from "react";

export interface UseInfiniteScrollOptions {
  enabled: boolean;
  hasMore: boolean;
  loading: boolean;
  /** e.g. "200px" to prefetch before the user reaches the bottom */
  rootMargin?: string;
}

/**
 * Calls onLoadMore when the sentinel element intersects the viewport.
 */
export function useInfiniteScroll(
  sentinelRef: RefObject<Element | null>,
  onLoadMore: () => void | Promise<void>,
  { enabled, hasMore, loading, rootMargin = "200px" }: UseInfiniteScrollOptions,
): void {
  useEffect(() => {
    if (!enabled || !hasMore) return;

    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting || loading) return;
        void onLoadMore();
      },
      { root: null, rootMargin, threshold: 0 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [enabled, hasMore, loading, onLoadMore, rootMargin, sentinelRef]);
}
