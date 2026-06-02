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
  const [rewriterResp, uploadedResp] = await Promise.all([
    fetchWithAuth(`${apiUrl}/onboard/cvs?page=${page}&pageSize=${pageSize}`, { method: "GET" }).catch(() => null),
    fetchWithAuth(`${apiUrl}/cvs`, { method: "GET" }).catch(() => null),
  ]);

  const rewriterPayload = rewriterResp?.ok
    ? (await rewriterResp.json()) as CVWithPagination
    : { cvs: [] as CV[], total: 0, page, pageSize, totalPages: 1 };

  const uploadedPayload = uploadedResp?.ok
    ? (await uploadedResp.json()) as CVWithPagination
    : { cvs: [] as CV[], total: 0, page: 1, pageSize: 0, totalPages: 1 };

  const mergedById = new Map<string, CV>();
  for (const cv of uploadedPayload.cvs ?? []) mergedById.set(cv.id, cv);
  for (const cv of rewriterPayload.cvs ?? []) mergedById.set(cv.id, cv);

  const merged = Array.from(mergedById.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  return {
    cvs: merged,
    total: merged.length,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(merged.length / pageSize)),
  };
}

export async function fetchCVById(cvId: string): Promise<CV> {
  const apiUrl = getClientApiBaseUrl();
  let response = await fetchWithAuth(`${apiUrl}/onboard/cvs/${cvId}`, { method: "GET" }).catch(() => null);
  if (!response?.ok) {
    response = await fetchWithAuth(`${apiUrl}/cvs/${cvId}`, { method: "GET" }).catch(() => null);
  }
  if (!response?.ok) throw new Error("Failed to load CV");
  return (await response.json()) as CV;
}

export async function deleteCVById(cvId: string): Promise<void> {
  const apiUrl = getClientApiBaseUrl();
  const response = await fetchWithAuth(`${apiUrl}/onboard/cvs/${cvId}`, { method: "DELETE" });
  if (!response.ok) throw new Error("Failed to delete CV");
}

export async function getUserName(): Promise<string> {
  const apiUrl = getClientApiBaseUrl();
  const response = await fetchWithAuth(`${apiUrl}/onboard/user-name`, { method: "GET" });
  if (!response.ok) return "candidate";
  const payload = (await response.json()) as { name?: string };
  return payload.name || "candidate";
}

export async function downloadCVPDF(cvId: string): Promise<Blob> {
  const apiUrl = getClientApiBaseUrl();

  const response = await fetchWithAuth(`${apiUrl}/download_cv/${cvId}`, { method: "GET" });
  if (!response.ok) throw new Error("Failed to load CV for PDF download");

  const payload = (await response.json()) as { filename?: string; url?: string; base64?: string };
  console.log("📦 download_cv payload keys:", Object.keys(payload));
  console.log("📦 base64 present:", !!payload.base64);
  console.log("📦 url preview:", payload.url?.slice(0, 30));

  const base64 = payload.base64 ?? payload.url?.split(",")[1];

  if (base64) {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    console.log("🔍 PDF first 5 bytes:", Array.from(bytes.slice(0, 5)).map(b => String.fromCharCode(b)).join(""));
    console.log("🔍 blob size:", bytes.length);
    return new Blob([bytes], { type: "application/pdf" });
  }

  throw new Error("No PDF data in response");
}