"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  CV,
  deleteCVById,
  downloadCVPDF,
  fetchCVById,
  getUserName,
} from "@/lib/api/cvs";

export function useCvDetailController(cvId: string) {
  const router = useRouter();

  const [cv, setCv] = useState<CV | null>(null);
  const [pdfFilename, setPdfFilename] = useState<string | null>(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    let isActive = true;

    async function loadCV() {
      try {
        setLoading(true);
        setError(null);

        const result = await fetchCVById(cvId);
        if (!isActive) {
          return;
        }
        setCv(result);

        try {
          const blob = await downloadCVPDF(cvId);
          if (!isActive) {
            return;
          }

          const blobUrl = window.URL.createObjectURL(blob);
          setPdfBlobUrl((previousUrl) => {
            if (previousUrl) {
              window.URL.revokeObjectURL(previousUrl);
            }
            return blobUrl;
          });
        } catch (downloadError) {
          console.error("Failed to load PDF for viewing:", downloadError);
          toast.error("Failed to load PDF preview");
        }
      } catch (fetchError) {
        if (!isActive) {
          return;
        }
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Failed to load CV",
        );
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    async function loadPdfFilename() {
      try {
        const name = await getUserName();
        if (isActive) {
          setPdfFilename(`${name.replace(/\s+/g, "_")}_CV.pdf`);
        }
      } catch {
        if (isActive) {
          setPdfFilename("enhanced_cv.pdf");
        }
      }
    }

    void loadCV();
    void loadPdfFilename();

    return () => {
      isActive = false;
      setPdfBlobUrl((previousUrl) => {
        if (previousUrl) {
          window.URL.revokeObjectURL(previousUrl);
        }
        return null;
      });
    };
  }, [cvId]);

  const handleDownload = async () => {
    if (!cv) {
      return;
    }

    try {
      setDownloading(true);
      const userName = await getUserName();
      const filename = `${userName}_CV.pdf`;
      const blob = await downloadCVPDF(cvId);

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("CV downloaded successfully");
    } catch (downloadError) {
      console.error("Download error:", downloadError);
      toast.error("Failed to download CV. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await deleteCVById(cvId);
      toast.success("CV deleted successfully");
      router.push("/services/cv-rewriter/database");
    } catch (deleteError) {
      console.error("Delete error:", deleteError);
      toast.error("Failed to delete CV. Please try again.");
      setDeleting(false);
    }
  };

  const backToHistory = () => {
    router.push("/services/cv-rewriter/database");
  };

  const scoreImprovement = useMemo(() => {
    if (!cv) {
      return 0;
    }

    return Math.round(
      ((cv.final_score - cv.original_score) / cv.original_score) * 100 + 10,
    );
  }, [cv]);

  const formattedDate = useMemo(() => {
    if (!cv) {
      return "";
    }

    return format(new Date(cv.created_at), "MMMM dd, yyyy 'at' HH:mm");
  }, [cv]);

  return {
    cv,
    pdfFilename,
    pdfBlobUrl,
    loading,
    error,
    deleting,
    downloading,
    scoreImprovement,
    formattedDate,
    handleDownload,
    handleDelete,
    backToHistory,
  };
}
