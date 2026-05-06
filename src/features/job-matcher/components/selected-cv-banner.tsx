import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Loader2, X } from "lucide-react";
import type { CVSource } from "@/components/shared/cv-selector";

interface SelectedCVBannerProps {
  selectedCVSource: CVSource;
  isExtractingCV: boolean;
  onRemove: () => void;
}

export function SelectedCVBanner({
  selectedCVSource,
  isExtractingCV,
  onRemove,
}: SelectedCVBannerProps) {
  return (
    <div className="mb-4 rounded-lg border border-border/60 bg-card/80 backdrop-blur-md p-3">
      <div className="flex items-center gap-3">
        <div className="w-6 h-6 rounded bg-green-500/10 flex items-center justify-center">
          <FileText className="w-3 h-3 text-green-600" />
        </div>
        <span className="text-sm font-medium text-foreground">
          Using:{" "}
          {selectedCVSource.type === "file"
            ? selectedCVSource.file.name
            : selectedCVSource.cv.job_title}
        </span>
        <Badge variant="secondary" className="text-xs">
          {selectedCVSource.type === "file" ? "Uploaded" : "From Database"}
        </Badge>
        {isExtractingCV && (
          <Badge variant="outline" className="text-xs">
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            Extracting...
          </Badge>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="ml-auto h-8 w-8 p-0 hover:bg-destructive/10"
          onClick={onRemove}
          title="Remove CV"
          disabled={isExtractingCV}
        >
          <X className="w-4 h-4 text-muted-foreground hover:text-destructive" />
        </Button>
      </div>
    </div>
  );
}
