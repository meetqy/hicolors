"use client";

import { useQuery } from "@apollo/client";
import { GET_PALETTE_LIST, PaletteListResponse, PaletteListItem } from "@/query/palette";
import { PaletteCard } from "../components/palette-card";
import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useIntersectionObserver } from "usehooks-ts";

export const MoreList = ({ category, colors }: { category: string; colors: string[] }) => {
  const [page, setPage] = useState(1);
  const [allPalettes, setAllPalettes] = useState<PaletteListItem[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const { loading, error, data, fetchMore } = useQuery<PaletteListResponse>(GET_PALETTE_LIST, {
    variables: {
      pagination: {
        pageSize: 24,
        page: 1,
      },
      sort: ["publishedAt:desc"],
      filters: {
        or: [
          {
            colors: {
              or: colors.map((color) => ({
                name: { containsi: color },
              })),
            },
          },
          { category: { containsi: category } },
        ],
      },
    },
  });

  // Handle initial data loading
  useEffect(() => {
    if (data?.palettes_connection) {
      setAllPalettes(data.palettes_connection.nodes);
      setHasMore(1 < data.palettes_connection.pageInfo.pageCount);
    }
  }, [data]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading || isLoadingMore) return;

    setIsLoadingMore(true);
    const nextPage = page + 1;

    try {
      const { data: newData } = await fetchMore({
        variables: {
          pagination: {
            pageSize: 24,
            page: nextPage,
          },
        },
      });

      if (newData?.palettes_connection?.nodes) {
        setAllPalettes((prev) => [...prev, ...newData.palettes_connection.nodes]);
        setPage(nextPage);
        setHasMore(nextPage < newData.palettes_connection.pageInfo.pageCount);
      }
    } catch (error) {
      console.error("Error loading more palettes:", error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasMore, loading, isLoadingMore, fetchMore, page]);

  const { isIntersecting, ref } = useIntersectionObserver({
    threshold: 0.1,
  });

  // Trigger load more when the element is visible
  useEffect(() => {
    if (isIntersecting && hasMore && !loading && !isLoadingMore) {
      loadMore();
    }
  }, [isIntersecting, hasMore, loading, isLoadingMore, loadMore]);

  if (error) {
    return <div className="text-center text-red-500">Error loading palettes: {error.message}</div>;
  }

  return (
    <div className="not-prose">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8 mb-12">
        {allPalettes.map((palette, index) => (
          <PaletteCard key={`${palette.documentId}-${index}`} palette={palette} />
        ))}
      </div>

      {(loading || isLoadingMore) && (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span className="ml-2">Loading more palettes...</span>
        </div>
      )}

      {!loading && !isLoadingMore && hasMore && (
        <div className="flex justify-center py-8">
          <Button onClick={loadMore} variant="outline">
            Load More
          </Button>
        </div>
      )}

      {!hasMore && allPalettes.length > 0 && <div className="text-center text-muted-foreground py-8">No more palettes to load</div>}

      {/* Intersection Observer Target */}
      <div ref={ref} className="h-4" />
    </div>
  );
};
