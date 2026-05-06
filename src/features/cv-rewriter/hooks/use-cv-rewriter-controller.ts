"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { fetchWithAuth } from "@/lib/api/auth";
import { getClientApiBaseUrl } from "@/lib/api/client-utils";
import {
  generateQueries,
  rewriteCV,
  type CVReviewSummary,
} from "@/lib/api/cv-rewriter";
import { fetchCVById, downloadCVPDF } from "@/lib/api/cvs";
import { fetchCVQuestionSession } from "@/lib/api/async-jobs";
import type { JobDescriptionInput } from "@/components/cv-rewriter/job-description-inputs";
import type { QuestionAnswer } from "@/components/cv-rewriter/questions-form";
import type { CVRewriterStep } from "../types";
import { buildPdfFilename, collectProfileData } from "../lib/helpers";

function toReviewSummary(
  improvements: string[] | null | undefined,
): CVReviewSummary {
  return {
    improvements: (improvements ?? [])
      .map((item) => item.trim())
      .filter((item) => item.length > 0),
  };
}

async function fetchProfile() {
  const response = await fetchWithAuth(`${getClientApiBaseUrl()}/onboard/profile`, {
    method: "GET",
  });

  if (!response.ok) {
    return null;
  }

  return (await response.json()) as {
    name?: string | null;
    skills?: unknown;
    experiences?: unknown;
    education?: unknown;
    achievements?: unknown;
  };
}

export function useCVRewriterController() {
  const [currentStep, setCurrentStep] = useState<CVRewriterStep>("upload");
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [jobDescriptions, setJobDescriptions] = useState<JobDescriptionInput[]>(
    [],
  );
  const [questionSessionId, setQuestionSessionId] = useState<string | null>(
    null,
  );
  const [questions, setQuestions] = useState<Record<string, string> | null>(
    null,
  );
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfFilename, setPdfFilename] = useState<string | null>(null);
  const [reviewSummary, setReviewSummary] = useState<CVReviewSummary | null>(
    null,
  );
  const [isGeneratingQueries, setIsGeneratingQueries] = useState(false);
  const [isGeneratingCV, setIsGeneratingCV] = useState(false);

  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  const validateUploads = useCallback((): string | null => {
    if (!cvFile) {
      return "Please upload your CV";
    }

    const validJobs = jobDescriptions.filter(
      (job) =>
        (job.type === "file" && job.file) ||
        (job.type === "text" && job.text && job.text.trim().length > 0),
    );

    if (validJobs.length === 0) {
      return "Please add at least one job description";
    }

    return null;
  }, [cvFile, jobDescriptions]);

  const handleGenerateQueries = useCallback(async () => {
    const validationError = validateUploads();
    if (validationError) {
      toast.error(validationError);
      return;
    }

    setIsGeneratingQueries(true);
    setCurrentStep("questions");

    try {
      const acceptedJob = await generateQueries(cvFile!, jobDescriptions);
      if (!acceptedJob.resource_id) {
        throw new Error("Questions were generated but no session was returned.");
      }

      const session = await fetchCVQuestionSession(acceptedJob.resource_id);
      if (Object.keys(session.questions_json).length === 0) {
        throw new Error("No questions generated. Please try again.");
      }

      setQuestionSessionId(session.id);
      setQuestions(session.questions_json);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to generate questions. Please try again.",
      );
      setCurrentStep("upload");
      setQuestionSessionId(null);
      setQuestions(null);
    } finally {
      setIsGeneratingQueries(false);
    }
  }, [cvFile, jobDescriptions, validateUploads]);

  const handleSubmitAnswers = useCallback(
    async (answers: QuestionAnswer[]) => {
      if (!questionSessionId) {
        toast.error("Question session expired. Please generate questions again.");
        setCurrentStep("upload");
        return;
      }

      setIsGeneratingCV(true);
      setCurrentStep("result");

      try {
        const profile = await fetchProfile();
        const profileData = collectProfileData(
          profile
            ? {
                name: profile.name ?? null,
                skills: profile.skills,
                experiences: profile.experiences,
                education: profile.education,
                achievements: profile.achievements,
              }
            : null,
        );

        const acceptedJob = await rewriteCV(
          questionSessionId,
          answers,
          Object.keys(profileData).length > 0 ? profileData : undefined,
        );

        if (!acceptedJob.resource_id) {
          throw new Error("Your CV was generated but could not be loaded.");
        }

        const generatedCv = await fetchCVById(acceptedJob.resource_id);
        const generatedPdf = await downloadCVPDF(acceptedJob.resource_id);

        if (pdfUrl) {
          URL.revokeObjectURL(pdfUrl);
        }

        const generatedPdfUrl = URL.createObjectURL(generatedPdf);
        const generatedFilename = buildPdfFilename(profile?.name ?? null);

        setPdfUrl(generatedPdfUrl);
        setPdfFilename(generatedFilename);
        setReviewSummary(toReviewSummary(generatedCv.review_improvements));
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to enhance your CV. Please try again.",
        );
        setCurrentStep("questions");
      } finally {
        setIsGeneratingCV(false);
      }
    },
    [pdfUrl, questionSessionId],
  );

  const handleRestart = useCallback(() => {
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
    }

    setCvFile(null);
    setJobDescriptions([]);
    setQuestionSessionId(null);
    setQuestions(null);
    setPdfUrl(null);
    setPdfFilename(null);
    setReviewSummary(null);
    setCurrentStep("upload");
    setIsGeneratingQueries(false);
    setIsGeneratingCV(false);
  }, [pdfUrl]);

  return {
    currentStep,
    cvFile,
    jobDescriptions,
    questions,
    pdfUrl,
    pdfFilename,
    reviewSummary,
    isGeneratingQueries,
    isGeneratingCV,
    setCvFile,
    setJobDescriptions,
    handleGenerateQueries,
    handleSubmitAnswers,
    handleRestart,
  };
}
