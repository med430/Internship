import { ERROR_MESSAGES } from "@/lib/errors/messages";
import { fetchWithAuth } from "@/lib/api/auth";
import { getApiErrorMessage } from "@/lib/api/error-utils";
import { getClientApiBaseUrl } from "@/lib/api/client-utils";
import {
  buildIdempotentAuthHeaders,
  JobAcceptedResponse,
} from "@/lib/api/async-jobs";

export interface PortfolioGenerationRequest {
  wireframe: string;
  theme: string;
  cv?: File;
  cvText?: string;
  personalInfo?: Record<string, unknown>;
  photoUrl?: string;
}

export interface PortfolioGenerationRecord {
  id: string;
  user_id: string;
  job_id: string;
  wireframe: string;
  theme: string;
  html: string;
  created_at: string;
}

export interface PortfolioGenerationWithPagination {
  generations: PortfolioGenerationRecord[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PortfolioOptionsResponse {
  wireframes: string[];
  themes: {
    predefined: string[];
    descriptions: Record<string, string>;
    custom_allowed: boolean;
  };
}

export async function getPortfolioOptions(): Promise<PortfolioOptionsResponse> {
  const apiBaseUrl = getClientApiBaseUrl();
  const response = await fetchWithAuth(`${apiBaseUrl}/portfolio/options`, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, ERROR_MESSAGES.SERVICE_UNAVAILABLE),
    );
  }

  return (await response.json()) as PortfolioOptionsResponse;
}

export async function generatePortfolio(
  request: PortfolioGenerationRequest,
): Promise<JobAcceptedResponse> {
  const apiBaseUrl = getClientApiBaseUrl();
  const headers = await buildIdempotentAuthHeaders();

  const formData = new FormData();
  formData.append("wireframe", request.wireframe);
  formData.append("theme", request.theme);

  if (request.cv) {
    formData.append("cv", request.cv);
  }

  if (request.cvText) {
    formData.append("cv_text", request.cvText);
  }

  if (request.personalInfo) {
    formData.append("personal_info", JSON.stringify(request.personalInfo));
  }

  if (request.photoUrl) {
    formData.append("photo_url", request.photoUrl);
  }

  const response = await fetchWithAuth(`${apiBaseUrl}/portfolio/build`, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, ERROR_MESSAGES.GENERATION_FAILED),
    );
  }

  return (await response.json()) as JobAcceptedResponse;
}

export async function fetchPortfolioGenerationById(
  generationId: string,
): Promise<PortfolioGenerationRecord> {
  const apiBaseUrl = getClientApiBaseUrl();
  const response = await fetchWithAuth(
    `${apiBaseUrl}/onboard/portfolio-generations/${generationId}`,
    {
      method: "GET",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to load generated portfolio");
  }

  return (await response.json()) as PortfolioGenerationRecord;
}

export async function fetchUserPortfolioGenerations(
  page: number = 1,
  pageSize: number = 10,
): Promise<PortfolioGenerationWithPagination> {
  const apiBaseUrl = getClientApiBaseUrl();
  const response = await fetchWithAuth(
    `${apiBaseUrl}/onboard/portfolio-generations?page=${page}&pageSize=${pageSize}`,
    {
      method: "GET",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to load portfolio history");
  }

  return (await response.json()) as PortfolioGenerationWithPagination;
}
