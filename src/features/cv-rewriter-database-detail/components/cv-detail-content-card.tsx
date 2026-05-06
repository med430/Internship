import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";

const PDFViewer = lazy(() =>
  import("@/components/cv-rewriter/pdf-viewer").then((mod) => ({
    default: mod.PDFViewer,
  })),
);

interface CvDetailContentCardProps {
  pdfBlobUrl: string | null;
  pdfFilename: string | null;
}

export function CvDetailContentCard({
  pdfBlobUrl,
  pdfFilename,
}: CvDetailContentCardProps) {
  return (
    <Card className="p-6 rounded-xl bg-card/80 backdrop-blur-xl border border-border shadow-xl shadow-primary/5">
      <Suspense
        fallback={
          <div className="flex h-[600px] items-center justify-center rounded-lg border border-border bg-muted/30 backdrop-blur">
            <div className="text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
              <p className="mt-3 text-xs text-muted-foreground">
                Loading PDF viewer...
              </p>
            </div>
          </div>
        }
      >
        <PDFViewer
          pdfUrl={pdfBlobUrl}
          filename={pdfFilename || "enhanced_cv.pdf"}
        />
      </Suspense>
    </Card>
  );
}
