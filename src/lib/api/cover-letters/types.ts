export interface CoverLetter {
  id: string;
  student_id: string;
  file_url: string;
  created_at: string;
  updated_at: string;
}

export interface CoverLetterWithPagination {
  letters: CoverLetter[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
