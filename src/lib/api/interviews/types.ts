export interface Interview {
  id: string;
  user_id: string;
  interviewer_name: string;
  interviewer_role: string;
  interview_style: string;
  difficulty_level: string;
  total_exchanges: number;
  overall_score: number;
  technical_competency: number;
  communication_skills: number;
  problem_solving: number;
  cultural_fit: number;
  acceptance_probability: number;
  key_strengths: string[];
  areas_for_improvement: string[];
  recommendations: string[];
  next_steps: string[];
  pdf_url: string;
  created_at: string;
  updated_at: string;
}

export interface InterviewWithPagination {
  interviews: Interview[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface StartInterviewInput {
  personaKey?: string;
  questionCount?: number;
  company?: string;
  jobTitle?: string;
  jobDescription?: string;
}

export interface InterviewStartResponse {
  interviewId: string;
  questionText: string;
  questionIndex: number;
  interviewerName: string;
  personaKey: string;
}

export interface AnswerInterviewInput {
  text?: string;
  audio?: Blob;
  audioFilename?: string;
}

export interface InterviewAnswerResponse {
  done: boolean;
  transcript: string;
  feedback: string;
  questionText?: string;
  questionIndex?: number;
  summary?: string;
  score?: number;
  reportId?: string;
}
