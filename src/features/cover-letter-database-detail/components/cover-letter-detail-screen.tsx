"use client";

import { lazy, Suspense } from "react";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useCoverLetterDetailController } from "../hooks/use-cover-letter-detail-controller";
import { CoverLetterDetailHeader } from "./cover-letter-detail-header";

const PDFViewer = lazy(() =>
  import("@/components/cv-rewriter/pdf-viewer").then((mod) => ({
    default: mod.PDFViewer,
  })),
);

interface CoverLetterDetailScreenProps {
  letterId: string;
}

export function CoverLetterDetailScreen({ letterId }: CoverLetterDetailScreenProps) {
  const {
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
  } = useCoverLetterDetailController(letterId);

  if (loading) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="flex min-h-[600px] items-center justify-center">
          <div className="text-center">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-neutral-400" />
            <p className="mt-4 text-sm text-neutral-600 dark:text-neutral-400">Loading cover letter...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !letter) {
    return (
      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-8 text-center dark:border-red-800 dark:bg-red-900/20">
          <p className="text-red-800 dark:text-red-200">{error || "Cover letter not found"}</p>
          <Button onClick={backToHistory} variant="outline" className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to history
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background px-6 py-10">
      <div className="container mx-auto max-w-6xl">
        <CoverLetterDetailHeader
          letter={letter}
          deleting={deleting}
          downloading={downloading}
          formattedDate={formattedDate}
          onBack={backToHistory}
          onDelete={handleDelete}
          onDownload={handleDownload}
        />
        <Card className="p-6 rounded-xl bg-card/80 backdrop-blur-xl border border-border shadow-xl shadow-primary/5">
          <Suspense
            fallback={
              <div className="flex h-[600px] items-center justify-center rounded-lg border border-border bg-muted/30 backdrop-blur">
                <div className="text-center">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
                  <p className="mt-3 text-xs text-muted-foreground">Loading PDF viewer...</p>
                </div>
              </div>
            }
          >
            <PDFViewer pdfUrl={pdfBlobUrl} filename="cover_letter.pdf" />
          </Suspense>
        </Card>
      </div>
    </div>
  );
}