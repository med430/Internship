"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  deleteInterview,
  downloadInterviewPDF,
  fetchInterviewById,
  Interview,
} from "@/lib/api/interviews";

export function useInterviewDetailController(interviewId: string) {
  const router = useRouter();

  const [interview, setInterview] = useState<Interview | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadInterview() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchInterviewById(interviewId);
        setInterview(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load interview",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadInterview();
  }, [interviewId]);

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await deleteInterview(interviewId);
      toast.success("Interview deleted successfully");
      router.push("/services/virtual-interviewer/database");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to delete interview",
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleDownload = async () => {
    if (!interview?.pdf_url) {
      return;
    }

    try {
      setDownloading(true);
      await downloadInterviewPDF(interview.pdf_url, interviewId);
      toast.success("PDF downloaded successfully");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to download PDF",
      );
    } finally {
      setDownloading(false);
    }
  };

  const backToHistory = () => {
    router.push("/services/virtual-interviewer/database");
  };

  return {
    interview,
    loading,
    deleting,
    downloading,
    error,
    handleDelete,
    handleDownload,
    backToHistory,
  };
}
