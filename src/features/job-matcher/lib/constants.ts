import type { JobSearchFilters } from "@/types/job-matcher";

export const DEFAULT_FILTERS: JobSearchFilters = {
  job_types: ["full_time"],
  work_models: ["remote", "hybrid"],
  locations: ["Berlin", "Remote"],
  experience_levels: ["entry", "mid"],
};

export const STORAGE_KEYS = {
  ACTIVE_FILTERS: "jobMatcher_activeFilters",
  LIKED_JOBS: "likedJobs",
  SAVED_JOBS: "savedJobs",
  SELECTED_CV: "jobMatcher_selectedCV",
} as const;

export const ARRAY_FILTER_TYPES: Array<keyof JobSearchFilters> = [
  "job_functions",
  "job_types",
  "work_models",
  "experience_levels",
  "locations",
  "required_skills",
  "excluded_titles",
];

export const NUMBER_FILTER_TYPES: Array<keyof JobSearchFilters> = [
  "salary_min",
  "salary_max",
  "posted_within_days",
];

export const JOBS_PER_PAGE = 6;
