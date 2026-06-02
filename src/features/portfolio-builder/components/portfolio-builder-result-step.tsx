import { ArrowLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AsyncJobLoadingStage } from "@/components/shared/async-job-loading-stage";

interface PortfolioBuilderResultStepProps {
  isGenerating: boolean;
  generatedHtml: string | null;
  onBack: () => void;
  onOpenInNewTab: () => void;
}

export function PortfolioBuilderResultStep({
  isGenerating,
  generatedHtml,
  onBack,
  onOpenInNewTab,
}: PortfolioBuilderResultStepProps) {
  return (
    <div className="max-w-[1800px] mx-auto space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 sm:gap-4 min-w-0">
          <Button
            variant="outline"
            onClick={onBack}
            className="bg-card/60 backdrop-blur-xl border-border flex-shrink-0"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold tracking-tight text-foreground">
              {isGenerating ? "Building Your Portfolio" : "Your Portfolio"}
            </h1>
            <p className="text-sm text-muted-foreground truncate">
              {isGenerating
                ? "Creating your professional portfolio..."
                : "Preview your generated portfolio"}
            </p>
          </div>
        </div>
        <Button
          onClick={onOpenInNewTab}
          disabled={isGenerating}
          className="shadow-lg shadow-primary/25 disabled:opacity-50 cursor-pointer flex-shrink-0"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Open in New Tab
        </Button>
      </div>

      {isGenerating ? (
        <AsyncJobLoadingStage
          feature="portfolio-builder"
          operation="generate"
          title="Building your portfolio"
          subtitle="Live updates appear here while the page is generated."
          variant="preview"
        />
      ) : (
        <Card className="bg-card/60 backdrop-blur-xl border-border shadow-lg shadow-primary/5 p-4 sm:p-6 h-[calc(100vh-16rem)]">
          <div className="h-full border-2 border-border rounded-lg overflow-hidden relative">
            <iframe
              srcDoc={generatedHtml ?? ""}
              className="w-full h-full"
              title="Portfolio Preview"
              sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
            />
          </div>
        </Card>
      )}
    </div>
  );
}
