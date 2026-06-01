import { fetchWithAuth } from "@/lib/api/auth";
import { getClientApiBaseUrl } from "@/lib/api/client-utils";
import type { CoverLetter, CoverLetterWithPagination } from "@/lib/api/cover-letters/types";

export type { CoverLetter, CoverLetterWithPagination } from "@/lib/api/cover-letters/types";

export async function fetchUserCoverLetters(
  page: number = 1,
  pageSize: number = 10,
): Promise<CoverLetterWithPagination> {
  const apiUrl = getClientApiBaseUrl();
  const response = await fetchWithAuth(
    `${apiUrl}/cover-letters?page=${page}&pageSize=${pageSize}`,
    { method: "GET" },
  ).catch(() => null);

  if (!response || !response.ok) {
    return { letters: [], total: 0, page, pageSize, totalPages: 1 };
  }

  return (await response.json()) as CoverLetterWithPagination;
}

export async function fetchCoverLetterById(id: string): Promise<CoverLetter> {
  const apiUrl = getClientApiBaseUrl();
  const response = await fetchWithAuth(`${apiUrl}/cover-letters/${id}`, {
    method: "GET",
  }).catch(() => null);

  if (!response || !response.ok) {
    throw new Error("Failed to load cover letter");
  }

  return (await response.json()) as CoverLetter;
}

export async function uploadCoverLetter(file: File): Promise<CoverLetter> {
  const apiUrl = getClientApiBaseUrl();
  const formData = new FormData();
  formData.append("letter", file);

  const response = await fetchWithAuth(`${apiUrl}/cover-letters`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to upload cover letter");
  }

  return (await response.json()) as CoverLetter;
}

export async function deleteCoverLetterById(id: string): Promise<void> {
  const apiUrl = getClientApiBaseUrl();
  const response = await fetchWithAuth(`${apiUrl}/cover-letters/${id}/delete`, {
    method: "PATCH",
  });

  if (!response.ok) {
    throw new Error("Failed to delete cover letter");
  }
}
