import { ERROR_MESSAGES } from "@/lib/errors/messages";
import { fetchWithAuth } from "@/lib/api/auth";
import { getApiErrorMessage } from "@/lib/api/error-utils";
import {
  checkApiHealth,
  getClientApiBaseUrl,
  textToFile,
} from "@/lib/api/client-utils";
import {
  buildIdempotentAuthHeaders,
  JobAcceptedResponse,
} from "@/lib/api/async-jobs";

export interface QuestionAnswer {
  question: string;
  answer: string;
}

export interface JobDescriptionInput {
  id: string;
  type: "file" | "text";
  file?: File;
  text?: string;
}

type ProfileData = Record<string, unknown>;
export async function generateQueries(
  cvFile: File,
  jobDescriptions: Array<{ type: "file" | "text"; file?: File; text?: string }>,
): Promise<JobAcceptedResponse> {
  try {
    const API_BASE_URL = getClientApiBaseUrl();
    const headers = await buildIdempotentAuthHeaders();

    const isHealthy = await checkApiHealth(API_BASE_URL);
    if (!isHealthy) {
      throw new Error(
        "Service is currently unavailable. Please try again later.",
      );
    }

    const formData = new FormData();
    formData.append("cv", cvFile);

    jobDescriptions.forEach((job, index) => {
      if (job.type === "file" && job.file) {
        formData.append("job_descriptions", job.file);
      } else if (job.type === "text" && job.text && job.text.trim()) {
        const textFile = textToFile(
          job.text,
          `job_description_${index + 1}.txt`,
        );
        formData.append("job_descriptions", textFile);
      }
    });

    const response = await fetchWithAuth(`${API_BASE_URL}/generate_queries`, {
      method: "POST",
      mode: "cors",
      headers,
      body: formData,
    });

    if (!response.ok) {
      throw new Error(
        await getApiErrorMessage(response, ERROR_MESSAGES.GENERATION_FAILED),
      );
    }

    return (await response.json()) as JobAcceptedResponse;
  } catch (error: unknown) {
    if (error instanceof TypeError) {
      throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
    }
    throw error;
  }
}

export interface CVReviewSummary {
  improvements: string[];
}

export interface RewriteCVResponse {
  pdf: string;
  review: CVReviewSummary;
  metadata: {
    iterations: number;
    final_similarity: number;
    original_score: number;
  };
}

export async function rewriteCV(
  questionSessionId: string,
  qaPairs: QuestionAnswer[],
  profileData?: ProfileData,
): Promise<JobAcceptedResponse> {
  try {
    const API_BASE_URL = getClientApiBaseUrl();
    const headers = await buildIdempotentAuthHeaders();

    const formData = new FormData();
    formData.append("question_session_id", questionSessionId);
    formData.append("answers", JSON.stringify(qaPairs));

    if (profileData) {
      formData.append("profile_data", JSON.stringify(profileData));
    }

    const response = await fetchWithAuth(`${API_BASE_URL}/rewrite_cv`, {
      method: "POST",
      mode: "cors",
      headers,
      body: formData,
    });

    if (!response.ok) {
      throw new Error(
        await getApiErrorMessage(response, ERROR_MESSAGES.GENERATION_FAILED),
      );
    }

    return (await response.json()) as JobAcceptedResponse;
  } catch (error: unknown) {
    if (error instanceof TypeError) {
      throw new Error(ERROR_MESSAGES.NETWORK_ERROR);
    }
    throw error;
  }
}
