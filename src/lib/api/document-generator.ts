import { fetchWithAuth } from "@/lib/api/auth";
import { getClientApiBaseUrl } from "@/lib/api/client-utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export type GeneratedDocumentProfile = {
  name?: string;
  email?: string;
  phone?: string;
  location?: string;
  targetedRole?: string;
  organization?: string;
  summary?: string;
  githubUrl?: string;
  linkedinUrl?: string;
  websiteUrl?: string;
  skills?: string[];
  languages?: string[];
  certifications?: string[];
  experiences?: Array<{
    role?: string;
    company?: string;
    location?: string;
    period?: string;
    highlights?: string[];
  }>;
  education?: Array<{
    school?: string;
    degree?: string;
    period?: string;
    details?: string[];
  }>;
};

export type GeneratedJobOffer = {
  title?: string;
  company?: string;
  location?: string;
  domain?: string;
  type?: string;
  workMode?: string;
  description?: string;
  requirements?: string[];
  benefits?: string[];
  compensation?: string[];
  recruiterName?: string;
};

/**
 * The shape of what the backend actually returns from UploadCVCommand /
 * UploadCoverLetterCommand. Update this if the command resolves to a
 * different shape — having both `fileUrl` and `file_url` was masking a
 * mismatch between the backend response and the consumer.
 */
export type UploadedDocument = {
  id: string;
  fileUrl: string;
};

export type GeneratedDocumentResult = {
  success: boolean;
  cv: UploadedDocument;
  coverLetter: UploadedDocument;
};

// ─── API calls ────────────────────────────────────────────────────────────────

export async function generateStudentDocuments(input: {
  profile: GeneratedDocumentProfile;
  offer: GeneratedJobOffer;
}): Promise<GeneratedDocumentResult> {
  const apiUrl = getClientApiBaseUrl();
  const response = await fetchWithAuth(`${apiUrl}/documents/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || "Failed to generate documents");
  }

  return (await response.json()) as GeneratedDocumentResult;
}

/**
 * Fetches the authenticated PDF blob and opens it in a new tab only after
 * the download is complete. This avoids the race condition where browsers
 * block a pre-opened tab redirect that doesn't originate from a direct
 * user-gesture frame.
 *
 * The caller should show a loading indicator while this promise is pending.
 */
export async function openGeneratedCv(cvId: string): Promise<void> {
  await openAuthenticatedPdf(`${getClientApiBaseUrl()}/cvs/${cvId}/download`);
}

export async function openGeneratedCoverLetter(coverLetterId: string): Promise<void> {
  await openAuthenticatedPdf(
    `${getClientApiBaseUrl()}/cover-letters/${coverLetterId}/download`,
  );
}

async function openAuthenticatedPdf(url: string): Promise<void> {
  const response = await fetchWithAuth(url, { method: "GET" });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || "Failed to open document");
  }

  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);

  // Open only after the blob is ready — no pre-opened blank tab required.
  const tab = window.open(objectUrl, "_blank", "noopener,noreferrer");
  if (!tab) {
    // Fallback: trigger a download if the popup was blocked.
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = "document.pdf";
    a.click();
  }

  // Clean up after giving the browser time to start rendering.
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 30_000);
}