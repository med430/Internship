"use client";

import { useCvDetailController } from "../hooks/use-cv-detail-controller";
import { CvDetailContentCard } from "./cv-detail-content-card";
import { CvDetailError } from "./cv-detail-error";
import { CvDetailHeader } from "./cv-detail-header";
import { CvDetailLoading } from "./cv-detail-loading";

interface CvDetailScreenProps {
  cvId: string;
}

export function CvDetailScreen({ cvId }: CvDetailScreenProps) {
  const {
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
  } = useCvDetailController(cvId);

  if (loading) {
    return <CvDetailLoading />;
  }

  if (error || !cv) {
    return (
      <CvDetailError error={error || "CV not found"} onBack={backToHistory} />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background px-6 py-10">
      <div className="container mx-auto max-w-6xl">
        <CvDetailHeader
          cv={cv}
          deleting={deleting}
          scoreImprovement={scoreImprovement}
          formattedDate={formattedDate}
          onBack={backToHistory}
          onDelete={handleDelete}
        />
        <div className="mb-6 space-y-2">
          <h2 className="text-base font-medium text-foreground">
            Jobs summary
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            AI-generated summary of all provided job descriptions
          </p>
          <p className="text-sm leading-relaxed text-foreground/90">
            {cv.jobs_summary}
          </p>
        </div>
        <CvDetailContentCard
          pdfBlobUrl={pdfBlobUrl}
          pdfFilename={pdfFilename}
        />
      </div>
    </div>
  );
}
