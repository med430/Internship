import { API_BASE_URL } from "@/lib/constants";
import { fetchWithAuth } from "@/lib/api/auth";
import { ERROR_MESSAGES } from "@/lib/errors/messages";
import { getApiErrorMessage } from "@/lib/api/error-utils";

export interface TextExtractionResponse {
  text: string;
}

export const textExtractorAPI = {
  async extractText(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetchWithAuth(`${API_BASE_URL}/api/extract-text`, {
      method: "POST",
      mode: "cors",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(
        await getApiErrorMessage(
          response,
          ERROR_MESSAGES.FILE_PROCESSING_FAILED,
        ),
      );
    }

    const data: TextExtractionResponse = await response.json();
    return data.text;
  },
};
