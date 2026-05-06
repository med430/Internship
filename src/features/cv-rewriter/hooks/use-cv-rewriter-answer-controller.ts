"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  fetchOpenCVQuestionSessions,
  type CVQuestionSessionListItem,
} from "@/lib/api/async-jobs";
import { rewriteCV, type QuestionAnswer } from "@/lib/api/cv-rewriter";

export function useCVRewriterAnswerController() {
  const [sessions, setSessions] = useState<CVQuestionSessionListItem[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load your unanswered question sessions.",
      );
    } finally {
      setIsLoadingSessions(false);
    }
  }, []);

  useEffect(() => {
    void loadSessions();
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
        if (!acceptedJob.resource_id) {
          throw new Error("CV rewrite completed but the result was missing.");
        }

        toast.success("Your answers were submitted successfully.");
        await loadSessions();
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : "Failed to submit your answers. Please try again.";
        setError(message);
        toast.error(message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [loadSessions, selectedSession],
  );

  return {
    sessions,
    selectedSession,
    isLoadingSessions,
    isSubmitting,
    isRewriteInProgress: false,
    error,
    loadSessions,
    handleSelectSession,
    handleSubmitAnswers,
  };
}
