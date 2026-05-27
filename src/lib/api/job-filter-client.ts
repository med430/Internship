import { JobFilterRequest, JobFilterResponse } from "@/types/job-matcher";
import { API_BASE_URL } from "@/lib/constants";
import { fetchWithAuth } from "@/lib/api/auth";
import { ERROR_MESSAGES } from "@/lib/errors/messages";
import { getApiErrorMessage } from "@/lib/api/error-utils";

export const jobFilterAPI = {
  async filterJobs(
    request: JobFilterRequest,
    options?: { signal?: AbortSignal },
  ): Promise<JobFilterResponse> {
    const response = await fetchWithAuth(`${API_BASE_URL}/jobs/filter`, {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
      signal: options?.signal,
    });

    if (!response.ok) {
      throw new Error(
        await getApiErrorMessage(
          response,
          ERROR_MESSAGES.EXTERNAL_SERVICE_ERROR,
        ),
      );
    }

    return response.json();
  },
};
