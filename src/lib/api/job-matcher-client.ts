import {
  JobDocument,
  MatchJobsRequest,
  MatchJobsResponse,
} from "@/types/job-matcher";
import { ERROR_MESSAGES } from "@/lib/errors/messages";
import { API_BASE_URL } from "@/lib/constants";
import { fetchWithAuth } from "@/lib/api/auth";
import { getApiErrorMessage } from "@/lib/api/error-utils";

class JobMatcherAPIClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  async matchJobs(request: MatchJobsRequest): Promise<MatchJobsResponse> {
    try {
      const response = await fetchWithAuth(`${this.baseURL}/jobs/match`, {
        method: "POST",
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(
          await getApiErrorMessage(
            response,
            ERROR_MESSAGES.EXTERNAL_SERVICE_ERROR,
          ),
        );
      }

      const data = await response.json();

      // Validate response structure
      if (typeof data.success !== "boolean") {
        throw new Error("Invalid response format: missing 'success' field");
      }

      if (!Array.isArray(data.matches)) {
        throw new Error("Invalid response format: 'matches' must be an array");
      }

      // Normalize match scores to percentage (0-100)
      // Backend returns similarity scores between 0-1
      const normalizedMatches = data.matches.map((job: JobDocument) => ({
        ...job,
        match_score: this.normalizeMatchScore(job.match_score),
      }));

      return {
        success: data.success,
        matches: normalizedMatches,
        total_found: data.total_found,
        message: data.message,
        profile_summary: data.profile_summary,
      };
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }

      throw new Error(ERROR_MESSAGES.UNKNOWN_ERROR);
    }
  }
  private normalizeMatchScore(score: number | undefined): number {
    if (score === undefined || score === null) {
      return 0;
    }

    // If already a percentage (>1), return as is
    if (score > 1) {
      return Math.min(Math.round(score), 100);
    }

    // Convert 0-1 range to 0-100
    return Math.min(Math.round(score * 100), 100);
  }
}

export const jobMatcherAPI = new JobMatcherAPIClient();
