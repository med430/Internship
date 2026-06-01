import { format } from "date-fns";
import { FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CoverLetter } from "@/lib/api/cover-letters";
import { fetchWithAuth } from "@/lib/api/auth";
import { getClientApiBaseUrl } from "@/lib/api/client-utils";

interface SelectedDatabaseCoverLetterProps {
  letter: CoverLetter;
  onRemove: () => void;
}

export function SelectedDatabaseCoverLetter({ letter, onRemove }: SelectedDatabaseCoverLetterProps) {
  const formattedDate = format(new Date(letter.created_at), "MMM dd, yyyy");

  return (
    <div className="flex items-start gap-3 sm:items-center sm:gap-4 p-4 sm:p-5 rounded-xl bg-card/60 backdrop-blur-md border border-border shadow-sm hover:bg-card hover:shadow-md hover:border-primary/30 transition-all duration-200">
      <div className="flex-shrink-0 rounded-lg bg-primary/10 p-2">
        <FileText className="h-4 w-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm sm:text-base font-medium text-foreground">Cover Letter</p>
        <p className="text-xs text-muted-foreground mt-0.5">{formattedDate}</p>
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={onRemove}
        className="flex-shrink-0 hover:bg-red-100 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-500 transition-all duration-200"
      >
        <X className="h-4 w-4" />
      </Button>
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={async () => {
            try {
              const apiUrl = getClientApiBaseUrl();
              // Prefer onboard download, then uploaded route
              const tryUrls = [`${apiUrl}/cover-letters/${letter.id}/download`, letter.file_url];
              let blob: Blob | null = null;
              for (const url of tryUrls) {
                if (!url) continue;
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
              alert('Failed to open cover letter preview');
            }
          }}
        >
          Preview
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={async () => {
            try {
              const apiUrl = getClientApiBaseUrl();
              const tryUrls = [`${apiUrl}/cover-letters/${letter.id}/download`, letter.file_url];
              let blob: Blob | null = null;
              for (const url of tryUrls) {
                if (!url) continue;
                try {
                  const res = await fetchWithAuth(url, { method: 'GET' });
                  if (!res.ok) continue;
                  blob = await res.blob();
                  break;
                } catch {
                  // try next
                }
              }
              if (!blob) throw new Error('Failed to download');
              const blobUrl = window.URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = blobUrl;
              a.download = `cover_letter_${letter.id}.pdf`;
              document.body.appendChild(a);
              a.click();
              a.remove();
              window.URL.revokeObjectURL(blobUrl);
            } catch (err) {
              console.error(err);
              alert('Failed to download cover letter');
            }
          }}
        >
          Download
        </Button>
      </div>
    </div>
  );
}