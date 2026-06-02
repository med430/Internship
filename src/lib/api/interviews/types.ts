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
  facial_expression_score?: number | null;
  facial_summary?: string | null;
  facial_metrics?: FacialExpressionMetrics | null;
  personalized_mode?: boolean;
  offer_context?: Record<string, unknown> | null;
  cv_context?: Record<string, unknown> | null;
  milestones?: InterviewMilestone[] | null;
  voice_metrics?: VoiceMetrics[];
  pdf_url: string;
  created_at: string;
  updated_at: string;
}

export interface FacialExpressionMetrics {
  sampleCount: number;
  facePresentRate: number;
  smileRate: number;
  positiveExpressionRate: number;
  attentionRate: number;
  expressionStability: number;
  averageSmile: number;
  averageEyeOpenness: number;
  averageBrowTension: number;
  averageMouthMovement: number;
  startedAt?: string;
  endedAt?: string;
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
  mode?: "standard" | "personalized";
  offerId?: string;
  cvId?: string;
  cvText?: string;
}

export interface InterviewMilestone {
  id: number;
  type: string;
  question: string;
  objective: string;
  difficulty: "easy" | "medium" | "hard" | string;
  status?: "PENDING" | "IN_PROGRESS" | "VALIDATED" | string;
  confidence?: "LOW" | "MEDIUM" | "HIGH" | string;
  followUpCount?: number;
  lastScore?: number;
  feedback?: string;
}

export interface VoiceMetrics {
  wordCount: number;
  fillerWords: Record<string, number>;
  fillerWordCount: number;
  paceLabel: string;
  fluencyScore: number;
  fluencySummary: string;
}

export interface InterviewStartResponse {
  interviewId: string;
  questionText: string;
  questionIndex: number;
  interviewerName: string;
  personaKey: string;
  audioBase64?: string;
  audioMime?: string;
  milestone?: InterviewMilestone | null;
  personalized?: boolean;
}

export interface AnswerInterviewInput {
  text?: string;
  audio?: Blob;
  audioFilename?: string;
  facialMetrics?: FacialExpressionMetrics;
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
  audioBase64?: string;
  audioMime?: string;
  milestone?: InterviewMilestone;
  followUp?: boolean;
  voiceMetrics?: VoiceMetrics;
}
