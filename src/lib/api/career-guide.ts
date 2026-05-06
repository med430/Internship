import { ERROR_MESSAGES } from "@/lib/errors/messages";
import { fetchWithAuth } from "@/lib/api/auth";
import { getApiErrorMessage } from "@/lib/api/error-utils";
import { getClientApiBaseUrl } from "@/lib/api/client-utils";
import {
  buildIdempotentAuthHeaders,
  JobAcceptedResponse,
} from "@/lib/api/async-jobs";

export interface CareerGuideResponse {
  current_strengths: string[];
  readiness_score: number;
  skills_to_learn: string[];
  projects_to_work_on: string[];
  soft_skills_to_develop: string[];
  career_roadmap: string[];
}

type ProfileData = Record<string, unknown>;
export async function generateCareerGuide(
  cvFile: File | null,
  cvText: string | null,
  currentJob: string,
  domain: string,
  targetJob: string | null,
  profileData: ProfileData | null,
): Promise<JobAcceptedResponse> {
  try {
    const API_BASE_URL = getClientApiBaseUrl();
    const headers = await buildIdempotentAuthHeaders();

    const formData = new FormData();

    if (cvFile) {
      formData.append("cv", cvFile);
    }

    if (cvText) {
      formData.append("cv_text", cvText);
    }

    formData.append("current_job", currentJob);
    formData.append("domain", domain);

    if (targetJob) {
      formData.append("target_job", targetJob);
    }

    if (profileData) {
      formData.append("profile_data", JSON.stringify(profileData));
    }

    const response = await fetchWithAuth(
      `${API_BASE_URL}/career-guide/generate`,
      {
        method: "POST",
        mode: "cors",
        headers,
        body: formData,
      },
    );

    if (!response.ok) {
      throw new Error(
        await getApiErrorMessage(response, ERROR_MESSAGES.GENERATION_FAILED),
      );
    }

    return (await response.json()) as JobAcceptedResponse;
  } catch (error) {
    throw error;
  }
}
