import { RefObject } from "react";
import { AlertCircle, Briefcase, Loader2, User } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import JobCard from "@/components/job-matcher/job-card";
import type { CVSource } from "@/components/shared/cv-selector";
import type { JobDocument } from "@/types/job-matcher";
import { convertJobToCardProps } from "../lib/utils";
import { JobMatcherPagination } from "./job-matcher-pagination";

interface JobMatcherResultsProps {
  error: string | null;
  isLoading: boolean;
  isExtractingCV: boolean;
  paginatedJobs: JobDocument[];
  selectedCVSource: CVSource | null;
  backendMessage: string | null;
  resumeContent: string;
  page: number;
  filteredTotalPages: number;
  filteredAllJobsLength: number;
  hasPrevPage: boolean;
  savedJobs: Set<string>;
  topOfResultsRef: RefObject<HTMLDivElement | null>;
  onSave: (jobId: string) => void;
  onRefresh: () => Promise<void>;
  onOpenCVSelector: () => void;
  onPageChange: (page: number) => void;
  onStartMatching: () => Promise<void>;
}

export function JobMatcherResults({
  error,
  isLoading,
  isExtractingCV,
  paginatedJobs,
  selectedCVSource,
  backendMessage,
  resumeContent,
  page,
  filteredTotalPages,
  filteredAllJobsLength,
  hasPrevPage,
  savedJobs,
  topOfResultsRef,
  onSave,
  onRefresh,
  onOpenCVSelector,
  onPageChange,
  onStartMatching,
}: JobMatcherResultsProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {(isLoading || isExtractingCV) && paginatedJobs.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">
            {isExtractingCV
              ? "Extracting CV content..."
              : selectedCVSource
                ? "Analyzing your CV and finding the best matches..."
                : "Finding job opportunities..."}
          </span>
        </div>
      ) : paginatedJobs.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedJobs.map((job) => {
              const cardProps = convertJobToCardProps(job);
              return (
                <JobCard
                  key={job.job_id}
                  {...cardProps}
                  isSaved={savedJobs.has(job.job_id)}
                  onSave={onSave}
                />
              );
            })}
          </div>

          <div ref={topOfResultsRef} />

          <JobMatcherPagination
            page={page}
            totalPages={filteredTotalPages}
            totalResults={filteredAllJobsLength}
            hasPrevPage={hasPrevPage}
            onPageChange={onPageChange}
          />
        </>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
            <Briefcase className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground mb-2">
            {backendMessage || "No jobs found matching your criteria."}
          </p>
          {backendMessage?.includes("No jobs available") ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground mb-4">
                {selectedCVSource
                  ? "Click below to start fetching jobs based on your CV"
                  : "Upload your CV to start finding personalized job matches"}
              </p>
              {selectedCVSource ? (
                <Button
                  onClick={onStartMatching}
                  className="gap-2"
                  disabled={!resumeContent.trim()}
                >
                  <Briefcase className="w-4 h-4" />
                  Find Jobs for Me
                </Button>
              ) : (
                <Button onClick={onOpenCVSelector} className="gap-2">
                  <User className="w-4 h-4" />
                  Select CV to Start
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground mb-4">
                Try adjusting your search or filters
              </p>
              <Button onClick={onRefresh}>Refresh Matches</Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
