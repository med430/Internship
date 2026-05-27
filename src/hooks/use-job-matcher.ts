import { useCallback, useEffect, useState } from "react";
import { fetchOffers, type Offer } from "@/lib/api/offers";
import type {
  JobDocument,
  JobSearchFilters,
  MatchJobsRequest,
} from "@/types/job-matcher";

const JOBS_PER_PAGE = 6;

function offerToJobDocument(offer: Offer): JobDocument {
  return {
    job_id: offer.id,
    title: offer.title,
    company: offer.company,
    location: offer.location,
    description: offer.description,
    work_model: offer.workMode,
    employment_type: offer.type,
    job_function: offer.domain,
    source: "Internal",
    source_url: `/services/offers/${offer.id}`,
    posted_date: offer.startDate ?? new Date().toISOString(),
  };
}

// Filter UI emits lowercase values; Neon stores uppercase enums.
const WORK_MODEL_MAP: Record<string, string> = {
  remote: "REMOTE",
  hybrid: "HYBRID",
  onsite: "ONSITE",
};

const JOB_TYPE_MAP: Record<string, string> = {
  internship: "INTERNSHIP",
  alternance: "ALTERNANCE",
  full_time: "FULL_TIME",
  part_time: "PART_TIME",
  contract: "CONTRACT",
};

function applyFilters(
  jobs: JobDocument[],
  filters: JobSearchFilters,
  resumeContent?: string,
): JobDocument[] {
  let result = jobs;

  if (filters.work_models?.length) {
    const mapped = filters.work_models.map(
      (v) => WORK_MODEL_MAP[v] ?? v.toUpperCase(),
    );
    result = result.filter(
      (j) => j.work_model && mapped.includes(j.work_model.toUpperCase()),
    );
  }

  if (filters.job_types?.length) {
    const mapped = filters.job_types.map(
      (v) => JOB_TYPE_MAP[v] ?? v.toUpperCase(),
    );
    result = result.filter(
      (j) =>
        j.employment_type && mapped.includes(j.employment_type.toUpperCase()),
    );
  }

  if (filters.locations?.length) {
    result = result.filter((j) =>
      filters.locations!.some((l) =>
        j.location.toLowerCase().includes(l.toLowerCase()),
      ),
    );
  }

  if (filters.job_functions?.length) {
    result = result.filter(
      (j) =>
        j.job_function &&
        filters.job_functions!.some((f) =>
          j.job_function!.toLowerCase().includes(f.toLowerCase()),
        ),
    );
  }

  if (filters.required_skills?.length) {
    result = result.filter((j) =>
      filters.required_skills!.some(
        (s) =>
          j.description.toLowerCase().includes(s.toLowerCase()) ||
          (j.job_function ?? "").toLowerCase().includes(s.toLowerCase()),
      ),
    );
  }

  if (resumeContent?.trim()) {
    const keywords = Array.from(
      new Set(
        resumeContent
          .toLowerCase()
          .split(/\W+/)
          .filter((w) => w.length > 3),
      ),
    ).slice(0, 30);

    result = result
      .map((j) => {
        const text =
          `${j.title} ${j.description} ${j.job_function ?? ""}`.toLowerCase();
        const hits = keywords.filter((kw) => text.includes(kw)).length;
        const score =
          keywords.length > 0 ? Math.round((hits / keywords.length) * 100) : 0;
        return { ...j, match_score: score };
      })
      .sort((a, b) => (b.match_score ?? 0) - (a.match_score ?? 0));
  }

  return result;
}

export function useJobMatcher() {
  const [sourceJobs, setSourceJobs] = useState<JobDocument[]>([]);
  const [allJobs, setAllJobs] = useState<JobDocument[]>([]);
  const [page, setPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [backendMessage, setBackendMessage] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    fetchOffers(1, 200)
      .then((offers: Offer[]) => {
        const docs = offers.map(offerToJobDocument);
        setSourceJobs(docs);
        setAllJobs(docs);
      })
      .catch((err: unknown) =>
        setError(
          err instanceof Error ? err.message : "Failed to load offers",
        ),
      )
      .finally(() => setIsLoading(false));
  }, []);

  const filterJobs = useCallback(
    async (filters: JobSearchFilters, resumeContent?: string) => {
      setIsLoading(true);
      try {
        const filtered = applyFilters(sourceJobs, filters, resumeContent);
        setAllJobs(filtered);
        setBackendMessage(
          filtered.length === 0 ? "No offers match your filters." : null,
        );
        return { jobs: filtered, request: filters, message: "" };
      } finally {
        setIsLoading(false);
      }
    },
    [sourceJobs],
  );

  const matchJobs = useCallback(
    async (request: MatchJobsRequest) => {
      if (!request.resume_content.trim()) return;
      setIsLoading(true);
      try {
        const matched = applyFilters(sourceJobs, {}, request.resume_content);
        setAllJobs(matched);
        setBackendMessage(matched.length === 0 ? "No matches found." : null);
      } finally {
        setIsLoading(false);
      }
    },
    [sourceJobs],
  );

  const totalPages = Math.max(1, Math.ceil(allJobs.length / JOBS_PER_PAGE));
  const hasPrevPage = page > 1;
  const displayedJobs = allJobs.slice(
    (page - 1) * JOBS_PER_PAGE,
    page * JOBS_PER_PAGE,
  );

  return {
    jobs: displayedJobs,
    allJobs,
    allJobsCount: allJobs.length,
    isLoading,
    error,
    backendMessage,
    matchJobs,
    filterJobs,
    refetchJobs: async () => {},
    clearCache: () => {},
    page,
    setPage,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage,
    isFetchingNextPage: false,
  };
}
