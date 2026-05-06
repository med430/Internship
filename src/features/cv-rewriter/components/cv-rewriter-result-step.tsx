import { lazy, Suspense } from "react";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AsyncJobLoadingStage } from "@/components/shared/async-job-loading-stage";
import { AISummary } from "@/components/cv-rewriter/ai-summary";
import type { CVReviewSummary } from "@/lib/api/cv-rewriter";

const PDFViewer = lazy(() =>
  import("@/components/cv-rewriter/pdf-viewer").then((module) => ({
    default: module.PDFViewer,
  })),
);

interface CVRewriterResultStepProps {
  isGeneratingCV: boolean;
  pdfUrl: string | null;
  pdfFilename: string | null;
  reviewSummary: CVReviewSummary | null;
  onRestart: () => void;
}

export function CVRewriterResultStep({
  isGeneratingCV,
  pdfUrl,
  pdfFilename,
  reviewSummary,
  onRestart,
}: CVRewriterResultStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary mb-4">
          <CheckCircle className="h-6 w-6 text-primary-foreground" />
        </div>
        <h2 className="text-2xl font-semibold mb-2 text-neutral-900 dark:text-neutral-50">
          {isGeneratingCV ? "Enhancing Your CV" : "Your Enhanced CV is Ready"}
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400 text-sm font-light">
          {isGeneratingCV
            ? "Please wait while we enhance your CV"
            : "Review your enhanced CV and see what has been improved"}
        </p>
      </div>

      {!isGeneratingCV && pdfUrl && reviewSummary && (
        <div className="flex justify-center">
          <Button
            onClick={onRestart}
            variant="outline"
            size="lg"
            className="px-5 py-2.5 text-sm font-medium rounded-lg border border-border hover:bg-accent transition-all duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Create Another CV
          </Button>
        </div>
      )}

      {isGeneratingCV ? (
        <AsyncJobLoadingStage
          feature="cv-rewriter"
          operation="rewrite"
          title="Enhancing your CV"
          subtitle="We are rewriting and formatting your CV based on your answers."
          variant="document"
        />
      ) : (
        <Card className="rounded-2xl border border-border bg-card/80 p-8 shadow-lg shadow-primary/5 backdrop-blur-xl">
          {pdfUrl && reviewSummary ? (
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-0">
            <div className="flex-1 lg:flex-[3] lg:pr-12 min-w-0">
              <Suspense
                fallback={
                  <div className="flex items-center justify-center min-h-[600px] rounded-xl bg-muted/30 backdrop-blur-lg border border-border">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-3"></div>
                      <p className="text-muted-foreground text-sm">
                        Loading PDF viewer...
                      </p>
                    </div>
                  </div>
                }
              >
                <PDFViewer
                  pdfUrl={pdfUrl}
                  filename={pdfFilename || "enhanced_cv.pdf"}
                />
              </Suspense>
            </div>

            <div className="hidden lg:block w-px bg-gradient-to-b from-transparent via-neutral-200 dark:via-neutral-800 to-transparent flex-shrink-0"></div>
            <div className="lg:hidden h-px w-full bg-gradient-to-r from-transparent via-neutral-200 dark:via-neutral-800 to-transparent"></div>

            <div className="flex-1 lg:flex-[2] lg:pl-12 min-w-0">
              <AISummary improvements={reviewSummary.improvements} />
            </div>
          </div>
          ) : null}
        </Card>
      )}
    </div>
  );
}
