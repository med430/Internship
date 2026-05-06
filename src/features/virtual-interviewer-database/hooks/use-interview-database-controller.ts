"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  fetchUserInterviews,
  InterviewWithPagination,
} from "@/lib/api/interviews";

export function useInterviewDatabaseController(currentPage: number) {
  const router = useRouter();
  const [data, setData] = useState<InterviewWithPagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadInterviews() {
      try {
        setLoading(true);
        setError(null);
        const result = await fetchUserInterviews(currentPage, 10);
        setData(result);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load interviews",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadInterviews();
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    router.push(`/services/virtual-interviewer/database?page=${page}`);
  };

  return {
    data,
    loading,
    error,
    handlePageChange,
  };
}
