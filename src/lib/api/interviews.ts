import { fetchWithAuth } from "@/lib/api/auth";
import { getClientApiBaseUrl } from "@/lib/api/client-utils";
import type {
  AnswerInterviewInput,
  Interview,
  InterviewAnswerResponse,
  InterviewStartResponse,
  InterviewWithPagination,
  StartInterviewInput,
} from "@/lib/api/interviews/types";

export type {
  AnswerInterviewInput,
  Interview,
  InterviewAnswerResponse,
  InterviewStartResponse,
  InterviewWithPagination,
  StartInterviewInput,
} from "@/lib/api/interviews/types";

export async function startInterview(
  input: StartInterviewInput,
): Promise<InterviewStartResponse> {
  const apiBaseUrl = getClientApiBaseUrl();
  const response = await fetchWithAuth(`${apiBaseUrl}/onboard/interviews/start`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error("Failed to start interview");
  }

  return (await response.json()) as InterviewStartResponse;
}

export async function answerInterview(
  interviewId: string,
  input: AnswerInterviewInput,
): Promise<InterviewAnswerResponse> {
  const apiBaseUrl = getClientApiBaseUrl();

  let response: Response;
  if (input.audio) {
    const formData = new FormData();
    formData.append(
      "audio",
      input.audio,
      input.audioFilename || "response.webm",
    );
    if (input.text) {
      formData.append("text", input.text);
    }

    response = await fetchWithAuth(
      `${apiBaseUrl}/onboard/interviews/${interviewId}/answer`,
      {
        method: "POST",
        body: formData,
      },
    );
  } else {
    response = await fetchWithAuth(
      `${apiBaseUrl}/onboard/interviews/${interviewId}/answer`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: input.text ?? "",
        }),
      },
    );
  }

  if (!response.ok) {
    throw new Error("Failed to submit interview response");
  }

  return (await response.json()) as InterviewAnswerResponse;
}

export async function fetchUserInterviews(
  page: number = 1,
  pageSize: number = 10,
): Promise<InterviewWithPagination> {
  const apiBaseUrl = getClientApiBaseUrl();
  const response = await fetchWithAuth(
    `${apiBaseUrl}/onboard/interviews?page=${page}&pageSize=${pageSize}`,
    {
      method: "GET",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to load interviews");
  }

  return (await response.json()) as InterviewWithPagination;
}

export async function fetchInterviewById(
  interviewId: string,
): Promise<Interview> {
  const apiBaseUrl = getClientApiBaseUrl();
  const response = await fetchWithAuth(
    `${apiBaseUrl}/onboard/interviews/${interviewId}`,
    {
      method: "GET",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to load interview");
  }

  return (await response.json()) as Interview;
}

export async function deleteInterview(interviewId: string): Promise<void> {
  const apiBaseUrl = getClientApiBaseUrl();
  const response = await fetchWithAuth(
    `${apiBaseUrl}/onboard/interviews/${interviewId}`,
    {
      method: "DELETE",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to delete interview");
  }
}

export async function downloadInterviewPDF(
  pdfUrl: string,
  interviewId: string,
): Promise<void> {
  const response = await fetchWithAuth(pdfUrl, {
    method: "GET",
  });
  if (!response.ok) {
    throw new Error("Failed to download PDF");
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `interview-report-${interviewId}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
