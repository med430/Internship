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
  // Fetch both rewriter-generated CVs and uploaded CVs, then merge
  const [rewriterResp, uploadedResp] = await Promise.all([
    fetchWithAuth(`${apiUrl}/onboard/cvs?page=${page}&pageSize=${pageSize}`, { method: "GET" }).catch(() => null),
    fetchWithAuth(`${apiUrl}/cvs`, { method: "GET" }).catch(() => null),
  ])

  const rewriterPayload = rewriterResp && rewriterResp.ok ? (await rewriterResp.json()) as CVWithPagination : { cvs: [] as CV[], total: 0, page, pageSize, totalPages: 1 }
  const uploadedPayload = uploadedResp && uploadedResp.ok ? (await uploadedResp.json()) as CVWithPagination : { cvs: [] as CV[], total: 0, page: 1, pageSize: 0, totalPages: 1 }

  // Merge by id, prefer rewriter entries if duplicated
  const mergedById = new Map<string, CV>()
  for (const cv of uploadedPayload.cvs ?? []) mergedById.set(cv.id, cv)
  for (const cv of rewriterPayload.cvs ?? []) mergedById.set(cv.id, cv)

  const merged = Array.from(mergedById.values()).sort((a, b) => {
    const aTime = new Date(a.created_at).getTime()
    const bTime = new Date(b.created_at).getTime()
    return bTime - aTime
  })

  return {
    cvs: merged,
    total: merged.length,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(merged.length / pageSize)),
  }
}

export async function fetchCVById(cvId: string): Promise<CV> {
  const apiUrl = getClientApiBaseUrl();
  // Try onboard first, then uploaded CV endpoint
  let response = await fetchWithAuth(`${apiUrl}/onboard/cvs/${cvId}`, { method: "GET" }).catch(() => null)
  if (!response || !response.ok) {
    response = await fetchWithAuth(`${apiUrl}/cvs/${cvId}`, { method: "GET" }).catch(() => null)
  }

  if (!response || !response.ok) {
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
  // Try onboard download route first, then uploaded CV download route
  const tryUrls = [`${apiUrl}/download_cv/${cvId}`, `${apiUrl}/cvs/${cvId}/download`]
  let lastError: any = null
  for (const url of tryUrls) {
    try {
      const response = await fetchWithAuth(url, { method: 'GET' })
      if (!response.ok) {
        lastError = await getApiErrorMessage(response, ERROR_MESSAGES.FILE_PROCESSING_FAILED)
        continue
      }
      return await response.blob()
    } catch (err) {
      lastError = err
    }
  }

  throw new Error(typeof lastError === 'string' ? lastError : 'Failed to download CV')
}
