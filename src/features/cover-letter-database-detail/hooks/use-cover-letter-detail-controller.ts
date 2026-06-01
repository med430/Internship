"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  fetchCoverLetterById,
  deleteCoverLetterById,
  type CoverLetter,
} from "@/lib/api/cover-letters";
import { fetchWithAuth } from "@/lib/api/auth";
import { getClientApiBaseUrl } from "@/lib/api/client-utils";

export function useCoverLetterDetailController(letterId: string) {
  const router = useRouter();

  const [letter, setLetter] = useState<CoverLetter | null>(null);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    let isActive = true;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const result = await fetchCoverLetterById(letterId);
        if (!isActive) return;
        setLetter(result);

        try {
          const apiUrl = getClientApiBaseUrl();
          // Try onboard download first, then uploaded cover-letters download
          const tryUrls = [`${apiUrl}/cover-letters/${letterId}/download`]
          let gotBlob: Blob | null = null
          for (const url of tryUrls) {
            try {
              const response = await fetchWithAuth(url, { method: 'GET' })
              if (!response.ok) continue
              gotBlob = await response.blob()
              break
            } catch {
              // try next
            }
          }
          if (!isActive) return
          if (gotBlob) {
            const blobUrl = window.URL.createObjectURL(gotBlob)
            setPdfBlobUrl((prev) => {
              if (prev) window.URL.revokeObjectURL(prev)
              return blobUrl
            })
          }
        } catch {
          toast.error("Failed to load PDF preview")
        }
      } catch (fetchError) {
        if (!isActive) return;
        setError(fetchError instanceof Error ? fetchError.message : "Failed to load cover letter");
      } finally {
        if (isActive) setLoading(false);
      }
    }

    void load();

    return () => {
      isActive = false;
      setPdfBlobUrl((prev) => {
        if (prev) window.URL.revokeObjectURL(prev);
        return null;
      });
    };
  }, [letterId]);

  const formattedDate = letter
    ? format(new Date(letter.created_at), "MMMM dd, yyyy 'at' HH:mm")
    : "";

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const apiUrl = getClientApiBaseUrl();
      // Try both download endpoints
      const tryUrls = [`${apiUrl}/cover-letters/${letterId}/download`]
      let blob: Blob | null = null
      for (const url of tryUrls) {
        try {
          const response = await fetchWithAuth(url, { method: 'GET' })
          if (!response.ok) continue
          blob = await response.blob()
          break
        } catch {
          // try next
        }
      }
      if (!blob) throw new Error('Download failed')
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `cover_letter_${letterId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Cover letter downloaded successfully");
    } catch {
      toast.error("Failed to download cover letter. Please try again.");
    } finally {
      setDownloading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleting(true);
      await deleteCoverLetterById(letterId);
      toast.success("Cover letter deleted successfully");
      router.push("/services/cover-letters/database");
    } catch {
      toast.error("Failed to delete cover letter. Please try again.");
      setDeleting(false);
    }
  };

  const backToHistory = () => {
    router.push("/services/cover-letters/database");
  };

  return {
    letter,
    pdfBlobUrl,
    loading,
    error,
    deleting,
    downloading,
    formattedDate,
    handleDownload,
    handleDelete,
    backToHistory,
  };
}