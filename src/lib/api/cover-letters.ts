import { fetchWithAuth } from "@/lib/api/auth";
import { getClientApiBaseUrl } from "@/lib/api/client-utils";
import type { CoverLetter, CoverLetterWithPagination } from "@/lib/api/cover-letters/types";

export type { CoverLetter, CoverLetterWithPagination } from "@/lib/api/cover-letters/types";

export async function fetchUserCoverLetters(
  page: number = 1,
  pageSize: number = 10,
): Promise<CoverLetterWithPagination> {
  const apiUrl = getClientApiBaseUrl();
  // Fetch both onboard-generated and uploaded cover letters, then merge
  const [onboardResp, uploadedResp] = await Promise.all([
    fetchWithAuth(`${apiUrl}/onboard/cover-letters?page=${page}&pageSize=${pageSize}`, { method: "GET" }).catch(() => null),
    fetchWithAuth(`${apiUrl}/cover-letters?page=${page}&pageSize=${pageSize}`, { method: "GET" }).catch(() => null),
  ])

  const onboardPayload = onboardResp && onboardResp.ok ? (await onboardResp.json()) as CoverLetterWithPagination : { letters: [] as CoverLetter[], total: 0, page, pageSize, totalPages: 1 }
  const uploadedPayload = uploadedResp && uploadedResp.ok ? (await uploadedResp.json()) as CoverLetterWithPagination : { letters: [] as CoverLetter[], total: 0, page: 1, pageSize: 0, totalPages: 1 }

  // Merge by id, prefer onboard entries if duplicated
  const mergedById = new Map<string, CoverLetter>()
  for (const l of uploadedPayload.letters ?? []) mergedById.set(l.id, l)
  for (const l of onboardPayload.letters ?? []) mergedById.set(l.id, l)

  const merged = Array.from(mergedById.values()).sort((a, b) => {
    const aTime = new Date(a.updated_at || a.created_at).getTime()
    const bTime = new Date(b.updated_at || b.created_at).getTime()
    return bTime - aTime
  })

  return {
    letters: merged,
    total: merged.length,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(merged.length / pageSize)),
  }
}

export async function fetchCoverLetterById(id: string): Promise<CoverLetter> {
  const apiUrl = getClientApiBaseUrl();
  // Try onboard endpoint first, then uploaded cover-letters
  let response = await fetchWithAuth(`${apiUrl}/onboard/cover-letters/${id}`, { method: "GET" }).catch(() => null)
  if (!response || !response.ok) {
    response = await fetchWithAuth(`${apiUrl}/cover-letters/${id}`, { method: "GET" }).catch(() => null)
  }

  if (!response || !response.ok) {
    throw new Error("Failed to load cover letter");
  }

  return (await response.json()) as CoverLetter;
}

export async function uploadCoverLetter(file: File): Promise<CoverLetter> {
  const apiUrl = getClientApiBaseUrl();
  const formData = new FormData();
  formData.append("letter", file);

  const response = await fetchWithAuth(`${apiUrl}/onboard/cover-letters`, {
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
  const response = await fetchWithAuth(`${apiUrl}/onboard/cover-letters/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete cover letter");
  }
}