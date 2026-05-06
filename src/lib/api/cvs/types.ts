export interface CV {
  id: string;
  user_id: string;
  pdf_url: string;
  original_score: number;
  final_score: number;
  job_title: string;
  jobs_summary: string;
  review_improvements: string[];
  anonymized_cv_text: string | null;
  created_at: string;
}

export interface CVWithPagination {
  cvs: CV[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
