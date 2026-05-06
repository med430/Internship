import type { CVReviewSummary } from "@/lib/api/cv-rewriter";

export function collectProfileData(
  profile: {
    name: string | null;
    skills: unknown;
    experiences: unknown;
    education: unknown;
    achievements: unknown;
  } | null,
): Record<string, unknown> {
  const profileData: Record<string, unknown> = {};

  if (!profile) {
    return profileData;
  }

  if (profile.skills) profileData.skills = profile.skills;
  if (profile.experiences) profileData.experiences = profile.experiences;
  if (profile.education) profileData.education = profile.education;
  if (profile.achievements) profileData.achievements = profile.achievements;

  return profileData;
}

export function decodePdfToBlobUrl(base64Pdf: string): string {
  const pdfData = atob(base64Pdf);
  const pdfArray = new Uint8Array(pdfData.length);

  for (let index = 0; index < pdfData.length; index += 1) {
    pdfArray[index] = pdfData.charCodeAt(index);
  }

  const pdfBlob = new Blob([pdfArray], { type: "application/pdf" });
  return URL.createObjectURL(pdfBlob);
}

export function buildPdfFilename(userName: string | null): string {
  const safeName = userName?.trim()
    ? userName.trim().replace(/\s+/g, "_")
    : "enhanced_cv";

  return `${safeName}_CV.pdf`;
}

export function toCompletedState(params: {
  pdfUrl: string;
  pdfFilename: string;
  reviewSummary: CVReviewSummary;
}) {
  return {
    phase: "completed",
    pdfUrl: params.pdfUrl,
    pdfFilename: params.pdfFilename,
    reviewSummary: params.reviewSummary,
  };
}
