import { format } from "date-fns";
import { FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CoverLetter } from "@/lib/api/cover-letters";

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
    </div>
  );
}