"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Box } from "lucide-react";
import { PortfolioBuilderNav } from "@/components/portfolio-builder/portfolio-builder-nav";
import { PortfolioGenerationCard } from "@/components/portfolio-builder/portfolio-generation-card";
import {
  fetchUserPortfolioGenerations,
  type PortfolioGenerationWithPagination,
} from "@/lib/api/portfolio-builder";

function PortfolioCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card/60 backdrop-blur-md p-5 space-y-3">
      <Skeleton className="h-5 w-1/2 bg-muted" />
      <Skeleton className="h-4 w-full bg-muted" />
      <Skeleton className="h-4 w-5/6 bg-muted" />
      <Skeleton className="h-3 w-1/4 bg-muted" />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex min-h-[500px] flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card/40 p-12 backdrop-blur">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <Box className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="mt-6 text-base font-medium text-foreground">
        No portfolio generations found
      </h3>
      <p className="mt-1 text-center text-xs text-muted-foreground">
        You have not generated any portfolios yet. Generate one to see it here.
      </p>
    </div>
  );
}

export function PortfolioDatabaseScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;

  const [data, setData] = useState<PortfolioGenerationWithPagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPortfolioHistory() {
      try {
        setLoading(true);
        setError(null);
        const result = await fetchUserPortfolioGenerations(currentPage, 10);
        setData(result);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load portfolio history",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadPortfolioHistory();
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    router.push(`/services/portfolio-builder/database?page=${page}`);
  };

  const generatePaginationItems = () => {
    if (!data) return [];

    const items: (number | "ellipsis")[] = [];
    const { page, totalPages } = data;

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        items.push(i);
      }
    } else if (page <= 3) {
      items.push(1, 2, 3, 4, "ellipsis", totalPages);
    } else if (page >= totalPages - 2) {
      items.push(
        1,
        "ellipsis",
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      );
    } else {
      items.push(1, "ellipsis", page - 1, page, page + 1, "ellipsis", totalPages);
    }

    return items;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background px-6 py-10">
      <div className="container mx-auto max-w-7xl">
        <PortfolioBuilderNav />

        <div className="mb-6">
          <h1 className="text-2xl font-medium tracking-tight text-foreground">
            Your Portfolio History
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            View your generated portfolio pages.
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200/40 bg-red-50/50 backdrop-blur p-4 text-xs text-red-600 dark:border-red-800/40 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 9 }).map((_, index) => (
              <PortfolioCardSkeleton key={index} />
            ))}
          </div>
        ) : data && data.generations.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {data?.generations.map((generation) => (
                <PortfolioGenerationCard key={generation.id} generation={generation} />
              ))}
            </div>

            {data && data.totalPages > 1 && (
              <div className="mt-12">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => handlePageChange(currentPage - 1)}
                        className={
                          currentPage === 1
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>

                    {generatePaginationItems().map((item, index) => (
                      <PaginationItem key={`${item}-${index}`}>
                        {item === "ellipsis" ? (
                          <PaginationEllipsis />
                        ) : (
                          <PaginationLink
                            onClick={() => handlePageChange(item)}
                            isActive={currentPage === item}
                            className="cursor-pointer"
                          >
                            {item}
                          </PaginationLink>
                        )}
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => handlePageChange(currentPage + 1)}
                        className={
                          currentPage === data.totalPages
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
