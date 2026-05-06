import { ArrowLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AsyncJobLoadingStage } from "@/components/shared/async-job-loading-stage";

interface PortfolioBuilderResultStepProps {
  isGenerating: boolean;
  generatedHtml: string | null;
  subdomainName: string;
  onBack: () => void;
  onOpenInNewTab: () => void;
}

export function PortfolioBuilderResultStep({
  isGenerating,
  generatedHtml,
  subdomainName,
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
              srcDoc={
                generatedHtml
                  ? `
                    <style>
                      a {
                        cursor: pointer !important;
                      }
                    </style>
                    <script>
                      document.addEventListener('click', function(e) {
                        const target = e.target.closest('a');
                        if (target && target.tagName === 'A') {
                          e.preventDefault();
                          e.stopPropagation();
                          return false;
                        }
                      }, true);
                    </script>
                    ${generatedHtml}
                  `
                  : ""
              }
              className="w-full h-full"
              title="Portfolio Preview"
              sandbox="allow-scripts"
            />
          </div>
        </Card>
      )}

      {!isGenerating && (
        <Card className="relative overflow-hidden border-0 shadow-lg group cursor-pointer bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 dark:from-neutral-50 dark:via-neutral-100 dark:to-neutral-50">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-purple-500/30 to-blue-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="relative p-8 text-center space-y-4">
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-white dark:text-neutral-900">
                Host Your Portfolio Online
              </h3>
              <p className="text-sm text-neutral-300 dark:text-neutral-600 max-w-md mx-auto">
                Upgrade to a higher plan to receive premium hosting with your
                own custom subdomain
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-2">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 dark:bg-neutral-900/5 backdrop-blur-sm border border-white/10 dark:border-neutral-900/10">
                <span className="text-sm font-mono font-semibold text-white dark:text-neutral-900">
                  {subdomainName}.talentya.me
                </span>
              </div>

              <Button
                variant="outline"
                className="bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-50 border-white/20 dark:border-neutral-900/20"
              >
                Upgrade Now
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
