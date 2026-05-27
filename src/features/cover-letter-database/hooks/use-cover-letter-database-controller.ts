"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { fetchUserCoverLetters, type CoverLetterWithPagination } from "@/lib/api/cover-letters";

export function useCoverLetterDatabaseController() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;

  const [data, setData] = useState<CoverLetterWithPagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (page: number) => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchUserCoverLetters(page, 10);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load cover letters");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load(currentPage);
  }, [currentPage, load]);

  const goToPage = (page: number) => {
    router.push(`/services/cover-letters/database?page=${page}`);
  };

  const goToDetail = (id: string) => {
    router.push(`/services/cover-letters/database/${id}`);
  };

  const reload = () => void load(currentPage);

  return { data, loading, error, currentPage, goToPage, goToDetail, reload };
}