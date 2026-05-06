import type {
  JobCardProps,
  JobDocument,
  JobSearchFilters,
} from "@/types/job-matcher";
import type { ActiveFilterTag } from "../types";

function capitalizeWords(text: string): string {
  return text
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function convertJobToCardProps(job: JobDocument): JobCardProps {
  const matchScore = job.match_score || 0;

  return {
    jobId: job.job_id,
    title: capitalizeWords(job.title),
    company: capitalizeWords(job.company),
    location: capitalizeWords(job.location),
    description: job.description || "",
    employmentType: job.employment_type,
    seniorityLevel: job.seniority_level,
    jobFunction: job.job_function,
    industries: job.industries,
    postedAt: new Date(job.posted_date),
    matchScore,
    matchReasons: {
      skills: matchScore,
      experience: matchScore,
      culture: matchScore,
    },
    techstack: [],
    platforms: [job.source],
    sourceUrl: job.source_url,
  };
}

export function formatFilterLabel(type: string, value: string): string {
  const formatMap: Record<string, Record<string, string>> = {
    job_types: {
      full_time: "Full-time",
      part_time: "Part-time",
      internship: "Internship",
      contract: "Contract",
    },
    work_models: {
      remote: "Remote",
      hybrid: "Hybrid",
      onsite: "On-site",
    },
    experience_levels: {
      entry: "Entry Level",
      mid: "Mid Level",
      senior: "Senior Level",
    },
  };

  return formatMap[type]?.[value] || value;
}

export function buildActiveFilterTags(
  filters: JobSearchFilters,
): ActiveFilterTag[] {
  const tags: ActiveFilterTag[] = [];

  Object.entries(filters).forEach(([key, values]) => {
    if (!Array.isArray(values)) {
      return;
    }

    values.forEach((value) => {
      tags.push({
        type: key as keyof JobSearchFilters,
        value,
        label: formatFilterLabel(key, value),
      });
    });
  });

  return tags;
}

export function getPaginationItems(
  currentPage: number,
  totalPages: number,
): Array<number | "ellipsis"> {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  const pages: Array<number | "ellipsis"> = [1];

  if (currentPage > 3) {
    pages.push("ellipsis");
  }

  const start = Math.max(2, currentPage - 1);
  const end = Math.min(totalPages - 1, currentPage + 1);

  for (let page = start; page <= end; page += 1) {
    pages.push(page);
  }

  if (currentPage < totalPages - 2) {
    pages.push("ellipsis");
  }

  pages.push(totalPages);

  return pages;
}
