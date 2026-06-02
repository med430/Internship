import { buildAuthHeaders, fetchWithAuth } from "@/lib/api/auth";
import { getClientApiBaseUrl } from "@/lib/api/client-utils";
import { getApiErrorMessage } from "@/lib/api/error-utils";
import { ERROR_MESSAGES } from "@/lib/errors/messages";

export type AsyncJobStatus =
  | "PENDING"
  | "PROCESSING"
  | "COMPLETED"
  | "FAILED"
  | "EXPIRED";

export type AsyncJobFeature =
  | "cv-rewriter"
  | "career-guide"
  | "portfolio-builder";

export type AsyncJobOperation = "questions" | "rewrite" | "generate";

export interface JobAcceptedResponse {
  job_id: string;
  status: AsyncJobStatus;
  feature: AsyncJobFeature;
  operation: AsyncJobOperation;
  created_at: string;
  existing: boolean;
  resource_id?: string;
  resource_type?: string;
  message?: string;
  progress?: number;
  phase?: string;
}

export interface AsyncJobSnapshot {
  job_id: string;
  feature: AsyncJobFeature;
  operation: AsyncJobOperation;
  status: AsyncJobStatus;
  phase: string;
  progress: number;
  message: string;
  resource_type?: string | null;
  resource_id?: string | null;
  error_code?: string | null;
  error_message?: string | null;
  created_at: string;
  updated_at: string;
}

export interface CVQuestionSessionReadResponse {
  id: string;
  question_job_id: string;
  rewrite_job_id?: string | null;
  status: string;
  questions_json: Record<string, string>;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  expires_at?: string | null;
}

export interface CVQuestionSessionListItem
  extends CVQuestionSessionReadResponse {}

export function createIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function isActiveJobStatus(status: AsyncJobStatus): boolean {
  return status === "PENDING" || status === "PROCESSING";
}

export function isTerminalJobStatus(status: AsyncJobStatus): boolean {
  return status === "COMPLETED" || status === "FAILED" || status === "EXPIRED";
}

export async function buildAsyncStreamUrl(): Promise<string> {
  return `${getClientApiBaseUrl()}/health`;
}

export async function buildIdempotentAuthHeaders(): Promise<Record<string, string>> {
  const headers = await buildAuthHeaders();
  return {
    ...headers,
    "Idempotency-Key": createIdempotencyKey(),
  };
}

export async function fetchActiveAsyncJobs(): Promise<AsyncJobSnapshot[]> {
  return [];
}

export async function fetchAsyncJob(jobId: string): Promise<AsyncJobSnapshot> {
  return {
    job_id: jobId,
    feature: "cv-rewriter",
    operation: "questions",
    status: "COMPLETED",
    phase: "COMPLETED",
    progress: 100,
    message: "Completed",
    resource_type: null,
    resource_id: null,
    error_code: null,
    error_message: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export async function fetchCVQuestionSession(
  questionSessionId: string,
): Promise<CVQuestionSessionReadResponse> {
  const apiBaseUrl = getClientApiBaseUrl();
  const url = `${apiBaseUrl}/cv-rewriter/questions/${questionSessionId}`;

  const response = await fetchWithAuth(url, { method: "GET" });
  if (!response.ok) {
    const msg = await getApiErrorMessage(response, ERROR_MESSAGES.NOT_FOUND);
    throw new Error(typeof msg === "string" ? msg : ERROR_MESSAGES.NOT_FOUND);
  }
  return response.json() as Promise<CVQuestionSessionReadResponse>;
}

export async function fetchOpenCVQuestionSessions(
  limit: number = 50,
): Promise<CVQuestionSessionListItem[]> {
  const apiBaseUrl = getClientApiBaseUrl();
  const url = `${apiBaseUrl}/cv-rewriter/questions?limit=${limit}`;

  const response = await fetchWithAuth(url, { method: "GET" });
  if (!response.ok) {
    const msg = await getApiErrorMessage(response, ERROR_MESSAGES.SERVICE_UNAVAILABLE);
    throw new Error(typeof msg === "string" ? msg : ERROR_MESSAGES.SERVICE_UNAVAILABLE);
  }
  return response.json() as Promise<CVQuestionSessionListItem[]>;
}