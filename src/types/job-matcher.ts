export interface JobDocument {
  job_id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  work_model?: string;
  employment_type?: string;
  seniority_level?: string;
  job_function?: string;
  industries?: string;
  salary?: string;
  company_logo_url?: string;
  source: string;
  source_url: string;
  posted_date: string;
  match_score?: number;
  // M5 — recommendation-pipeline extensions
  is_paid?: boolean;
  application_deadline?: string | null;
  positions_count?: number;
  bookmarked?: boolean;
  score_breakdown?: Record<string, number | undefined>;
}

export interface OfferSkill {
  id: string;
  name: string;
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT" | string;
  mandatory: boolean;
}

export interface OfferDetailDocument {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  domain: string;
  work_model: string;
  employment_type: string;
  is_paid: boolean;
  stipend_min: number | null;
  stipend_max: number | null;
  salary: string;
  languages_required: string[];
  positions_count: number;
  start_date: string | null;
  end_date: string | null;
  application_deadline: string | null;
  posted_date: string;
  skills: OfferSkill[];
  bookmarked: boolean;
  match_score: number | null;
  score_breakdown: Record<string, number | undefined> | null;
}

export interface JobSearchFilters {
  job_functions?: string[];
  excluded_titles?: string[];
  job_types?: string[];
  work_models?: string[];
  locations?: string[];
  required_skills?: string[];
  experience_levels?: string[];
  salary_min?: number;
  salary_max?: number;
  posted_within_days?: number;
}

export interface JobFilterRequest {
  job_functions?: string[];
  job_types?: string[];
  work_models?: string[];
  experience_levels?: string[];
  locations?: string[];
  required_skills?: string[];
  posted_within_days?: number;
  resume_content?: string;
  limit?: number;
  // Opaque base64 cursor from the previous response's `next_cursor`. Omit to fetch the first page.
  cursor?: string;
  // Ask the authenticated recommendation feed for active bookmarks only.
  savedOnly?: boolean;
  // Ask for the Offers explore feed instead of personalised matcher ranking.
  explore?: boolean;
  exploreSeed?: number;
}

export interface JobFilterResponse {
  success: boolean;
  jobs: JobDocument[];
  total_found: number;
  next_cursor?: string | null;
  source?: "recommendation" | "newest-fallback" | "explore";
  filter_stats?: {
    jobs_found: number;
    used_resume_matching: boolean;
    filters_applied: Record<string, unknown>;
  };
  message: string;
}

export interface MatchJobsRequest {
  resume_content: string;
  github_data?: Record<string, unknown>;
  preferences?: Record<string, unknown>;
  limit?: number;
}

export interface MatchJobsResponse {
  success: boolean;
  matches: JobDocument[];
  total_found: number;
  message: string;
  profile_summary: {
    primary_titles?: string[];
    key_skills?: string[];
    experience_level?: string;
    [key: string]: unknown;
  };
}

export interface JobCardProps {
  jobId: string;
  title: string;
  company: string;
  companyLogo?: string;
  location: string;
  type?: string;
  employmentType?: string;
  seniorityLevel?: string;
  jobFunction?: string;
  industries?: string;
  salary?: string;
  techstack: string[];
  postedAt: Date;
  matchScore: number;
  matchReasons: {
    skills: number;
    experience: number;
    culture: number;
  };
  description: string;
  applicants?: number;
  platforms: string[];
  sourceUrl: string;
  isLiked?: boolean;
  isSaved?: boolean;
  isPaid?: boolean;
  applicationDeadline?: Date | null;
  workModel?: string;
  detailSource?: "matcher" | "offers";
  showMatchScore?: boolean;
  position?: number;
  onLike?: (jobId: string) => void;
  onSave?: (jobId: string) => void;
  onView?: (jobId: string, position?: number) => void;
  onTailorCV?: (jobId: string, description: string) => void;
}
