import { format } from "date-fns";
import { FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchWithAuth } from "@/lib/api/auth";
import { getClientApiBaseUrl } from "@/lib/api/client-utils";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import type { CV } from "@/lib/api/cvs";

interface SelectedDatabaseCVProps {
  cv: CV;
  onRemove: () => void;
}

export function SelectedDatabaseCV({ cv, onRemove }: SelectedDatabaseCVProps) {
  const scoreImprovement =
    cv.original_score > 0
      ? Math.round(((cv.final_score - cv.original_score) / cv.original_score) * 100 + 10)
      : null;
  const formattedDate = format(new Date(cv.created_at), "MMM dd, yyyy");

  return (
    <HoverCard openDelay={200}>
      <HoverCardTrigger asChild>
        <div className="flex items-start gap-3 sm:items-center sm:gap-4 p-4 sm:p-5 rounded-xl bg-card/60 backdrop-blur-md border border-border shadow-sm hover:bg-card hover:shadow-md hover:border-primary/30 transition-all duration-200">
          <div className="flex-shrink-0 rounded-lg bg-primary/10 p-2">
            <FileText className="h-4 w-4 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm sm:text-base font-medium truncate text-foreground">
              {cv.job_title}
            </p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5">
              <p className="text-xs text-muted-foreground">{formattedDate}</p>
              {scoreImprovement !== null && Number.isFinite(scoreImprovement) && (
                <span className="text-xs font-semibold text-[#05e34f] dark:text-[#04c945]">
                  +{scoreImprovement}% Boost
                </span>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onRemove}
            className="flex-shrink-0 hover:bg-red-100 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-500 transition-all duration-200"
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="flex gap-2 ml-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={async () => {
                try {
                  const apiUrl = getClientApiBaseUrl();
                  const tryUrls = [`${apiUrl}/download_cv/${cv.id}`, `${apiUrl}/cvs/${cv.id}/download`];
                  let blob: Blob | null = null;
                  for (const url of tryUrls) {
                    try {
                      const res = await fetchWithAuth(url, { method: 'GET' });
                      if (!res.ok) continue;
                      blob = await res.blob();
                      break;
                    } catch {
                      // try next
                    }
                  }
                  if (!blob) throw new Error('Failed to load preview');
                  const blobUrl = window.URL.createObjectURL(blob);
                  window.open(blobUrl, '_blank');
                } catch (err) {
                  console.error(err);
                  alert('Failed to open CV preview');
                }
              }}
              className="flex-shrink-0"
            >
              Preview
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={async () => {
                try {
                  const apiUrl = getClientApiBaseUrl();
                  const tryUrls = [`${apiUrl}/download_cv/${cv.id}`, `${apiUrl}/cvs/${cv.id}/download`];
                  let blob: Blob | null = null;
                  for (const url of tryUrls) {
                    try {
                      const res = await fetchWithAuth(url, { method: 'GET' });
                      if (!res.ok) continue;
                      blob = await res.blob();
                      break;
                    } catch {
                      // try next
                    }
                  }
                  if (!blob) throw new Error('Failed to download CV');
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `cv_${cv.id}.pdf`;
                  document.body.appendChild(a);
                  a.click();
                  a.remove();
                  window.URL.revokeObjectURL(url);
                } catch (err) {
                  console.error(err);
                  alert('Failed to download CV');
                }
              }}
              className="flex-shrink-0"
            >
              Download
            </Button>
          </div>
        </div>
      </HoverCardTrigger>
      <HoverCardContent
        side="right"
        align="center"
        className="hidden md:block w-80 border-border/50 bg-popover/95 backdrop-blur-xl shadow-xl"
      >
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-foreground">
            Job Description Summary
          </h4>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {cv.jobs_summary}
          </p>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
