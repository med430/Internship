import type { CVReviewSummary } from "@/lib/api/cv-rewriter";

export type CVRewriterStep = "upload" | "questions" | "result";

export interface CVRewriterResult {
  pdfUrl: string | null;
  pdfFilename: string | null;
  reviewSummary: CVReviewSummary | null;
}
