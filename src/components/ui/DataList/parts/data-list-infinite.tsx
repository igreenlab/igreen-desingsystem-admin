import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/** Cards skeleton (mesma receita do List.loading) exibidos ao paginar. */
export function DataListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="flex flex-col gap-gp-lg" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="w-full p-pad-xl bg-bg-surface border border-border-subtle dark:border-border-default rounded-radius-lg"
        >
          <div className={cn("h-[12px] rounded-radius-full bg-bg-muted animate-pulse", "w-1/3 mb-gp-md")} />
          <div className={cn("h-[12px] rounded-radius-full bg-bg-muted animate-pulse", "w-2/3")} />
        </div>
      ))}
    </div>
  );
}

/**
 * Sentinel de infinite scroll — observa a entrada do elemento no viewport e
 * dispara `onLoadMore` (uma vez por interseção, enquanto `hasMore` e não
 * `loading`). Renderiza skeletons enquanto `loading`.
 */
export function DataListInfinite({
  onLoadMore,
  hasMore,
  loading,
  skeletonCount = 3,
}: {
  onLoadMore: () => void;
  hasMore: boolean;
  loading: boolean;
  skeletonCount?: number;
}) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const onLoadMoreRef = useRef(onLoadMore);
  onLoadMoreRef.current = onLoadMore;

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore || loading) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) onLoadMoreRef.current();
      },
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, loading]);

  return (
    <>
      {loading && <DataListSkeleton count={skeletonCount} />}
      {hasMore && <div ref={sentinelRef} className="h-px w-full" aria-hidden="true" />}
    </>
  );
}
