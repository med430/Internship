"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { fetchOpenCVQuestionSessions, type CVQuestionSessionListItem } from "@/lib/api/async-jobs";
import { rewriteCV, type QuestionAnswer } from "@/lib/api/cv-rewriter";
import { fetchCVById, downloadCVPDF } from "@/lib/api/cvs";

export interface RewriteResult {
  pdfUrl: string;
  pdfFilename: string;
  improvements: string[];
  cvId: string;
}

export function useCVRewriterAnswerController() {
  const router = useRouter();

  const [sessions, setSessions] = useState<CVQuestionSessionListItem[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  // Fix: isSubmitting was always false — now properly tracked
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Fix: added actual result state so the UI can show the PDF
  const [result, setResult] = useState<RewriteResult | null>(null);

  const selectedSession = useMemo(
    () => sessions.find((session) => session.id === selectedSessionId) ?? null,
    [selectedSessionId, sessions],
  );

  const loadSessions = useCallback(async () => {
    try {
      setIsLoadingSessions(true);
      setError(null);
      const openSessions = await fetchOpenCVQuestionSessions(50);
      setSessions(openSessions);
      if (openSessions.length > 0) {
        setSelectedSessionId((previous) => {
          if (previous && openSessions.some((session) => session.id === previous)) {
            return previous;
          }
          return openSessions[0].id;
        });
      } else {
        setSelectedSessionId(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load your unanswered question sessions.");
    } finally {
      setIsLoadingSessions(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadSessions();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [loadSessions]);

  const handleSelectSession = useCallback((sessionId: string) => {
    setSelectedSessionId(sessionId);
  }, []);

  const handleSubmitAnswers = useCallback(
    async (answers: QuestionAnswer[]) => {
      if (!selectedSession) {
        toast.error("Please select a question session first.");
        return;
      }

      try {
        setIsSubmitting(true);
        setError(null);

        const acceptedJob = await rewriteCV(selectedSession.id, answers);
console.log("✅ rewriteCV response:", JSON.stringify(acceptedJob));

if (!acceptedJob.resource_id) {
  throw new Error("CV rewrite completed but the result was missing.");
}

        // Fix: actually fetch the CV and PDF — previously these were never fetched
        const [generatedCv, generatedPdfBlob] = await Promise.all([
          fetchCVById(acceptedJob.resource_id),
          downloadCVPDF(acceptedJob.resource_id),
        ]);

        console.log("✅ fetchCVById result:", JSON.stringify(generatedCv));
        console.log("✅ PDF blob size:", generatedPdfBlob.size);

        const pdfUrl = URL.createObjectURL(generatedPdfBlob);
        const pdfFilename = `enhanced_cv_${new Date().toISOString().slice(0, 10)}.pdf`;

        setResult({
          pdfUrl,
          pdfFilename,
          improvements: generatedCv.review_improvements ?? [],
          cvId: acceptedJob.resource_id,
        });

        toast.success("Your enhanced CV is ready!");

        // Reload sessions so the answered one disappears from the list
        await loadSessions();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to submit your answers. Please try again.";
        setError(message);
        toast.error(message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [loadSessions, selectedSession],
  );

  const handleViewInDatabase = useCallback(() => {
    if (result?.cvId) {
      router.push(`/services/cv-rewriter/database/${result.cvId}`);
    }
  }, [result, router]);

  const handleReset = useCallback(() => {
    if (result?.pdfUrl) {
      URL.revokeObjectURL(result.pdfUrl);
    }
    setResult(null);
    setError(null);
  }, [result]);

  return {
    sessions,
    selectedSession,
    isLoadingSessions,
    isSubmitting,
    // Fix: now reflects actual in-progress state instead of always false
    isRewriteInProgress: isSubmitting,
    error,
    result,
    loadSessions,
    handleSelectSession,
    handleSubmitAnswers,
    handleViewInDatabase,
    handleReset,
  };
}