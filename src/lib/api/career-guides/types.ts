export interface CareerGuide {
  id: string;
  user_id: string;
  current_strengths: string[];
  readiness_score: number;
  skills_to_learn: string[];
  projects_to_work_on: string[];
  soft_skills_to_develop: string[];
  career_roadmap: string[];
  domain: string;
  current_job: string;
  target_job: string | null;
  created_at: string;
  updated_at: string;
}

export interface CareerGuideWithPagination {
  guides: CareerGuide[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
