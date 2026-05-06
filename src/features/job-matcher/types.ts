import type { JobSearchFilters } from "@/types/job-matcher";

export interface ActiveFilterTag {
  type: keyof JobSearchFilters;
  value: string;
  label: string;
}
