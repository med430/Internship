import { fetchWithAuth } from "@/lib/api/auth";
import { ERROR_MESSAGES } from "@/lib/errors/messages";
import { getApiErrorMessage } from "@/lib/api/error-utils";
import { getClientApiBaseUrl } from "@/lib/api/client-utils";
import type { CV, CVWithPagination } from "@/lib/api/cvs/types";

export type { CV, CVWithPagination } from "@/lib/api/cvs/types";

export async function fetchUserCVs(
  page: number = 1,
  pageSize: number = 10,
): Promise<CVWithPagination> {
  const apiUrl = getClientApiBaseUrl();
  const response = await fetchWithAuth(
    `${apiUrl}/onboard/cvs?page=${page}&pageSize=${pageSize}`,
    {
      method: "GET",
    },
  );

  if (!response.ok) {
    throw new Error("Failed to load CVs");
  }

  return (await response.json()) as CVWithPagination;
}

export async function fetchCVById(cvId: string): Promise<CV> {
  const apiUrl = getClientApiBaseUrl();
  const response = await fetchWithAuth(`${apiUrl}/onboard/cvs/${cvId}`, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error("Failed to load CV");
  }

  return (await response.json()) as CV;
}

export async function deleteCVById(cvId: string): Promise<void> {
  const apiUrl = getClientApiBaseUrl();
  const response = await fetchWithAuth(`${apiUrl}/onboard/cvs/${cvId}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete CV");
  }
}

export async function getUserName(): Promise<string> {
  const apiUrl = getClientApiBaseUrl();
  const response = await fetchWithAuth(`${apiUrl}/onboard/user-name`, {
    method: "GET",
  });

  if (!response.ok) {
    return "candidate";
  }

  const payload = (await response.json()) as { name?: string };
  return payload.name || "candidate";
}

export async function downloadCVPDF(cvId: string): Promise<Blob> {
  const apiUrl = getClientApiBaseUrl();
  const response = await fetchWithAuth(`${apiUrl}/download_cv/${cvId}`, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error(
      await getApiErrorMessage(response, ERROR_MESSAGES.FILE_PROCESSING_FAILED),
    );
  }

  return await response.blob();
}
