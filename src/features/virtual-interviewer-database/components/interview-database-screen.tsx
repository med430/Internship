"use client";

import { useSearchParams } from "next/navigation";
import { InterviewCard } from "@/components/virtual-interviewer/interview-card";
import { InterviewNav } from "@/components/virtual-interviewer/interview-nav";
import { useInterviewDatabaseController } from "../hooks/use-interview-database-controller";
import { generatePaginationItems } from "../lib/pagination";
import { InterviewCardSkeleton } from "./interview-card-skeleton";
import { InterviewEmptyState } from "./interview-empty-state";
import { InterviewPaginationControls } from "./interview-pagination-controls";

export function InterviewDatabaseScreen() {
  const searchParams = useSearchParams();
  const currentPage = Number(searchParams.get("page")) || 1;

  const { data, loading, error, handlePageChange } =
    useInterviewDatabaseController(currentPage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background px-6 py-10">
      <div className="container mx-auto max-w-7xl">
        <InterviewNav />

        <div className="mb-6">
          <h1 className="text-2xl font-medium tracking-tight text-foreground">
            Your Interview History
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            View and review all your completed interviews
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
              <InterviewCardSkeleton key={index} />
            ))}
          </div>
        ) : data && data.interviews.length === 0 ? (
          <InterviewEmptyState />
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
              {data?.interviews.map((interview) => (
                <InterviewCard key={interview.id} interview={interview} />
              ))}
            </div>

            {data && data.totalPages > 1 && (
              <InterviewPaginationControls
                currentPage={currentPage}
                totalPages={data.totalPages}
                items={generatePaginationItems(data)}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
