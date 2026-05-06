import { format } from "date-fns";
import { FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  const scoreImprovement = Math.round(
    ((cv.final_score - cv.original_score) / cv.original_score) * 100 + 10,
  );
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
              <span className="text-xs font-semibold text-[#05e34f] dark:text-[#04c945]">
                +{scoreImprovement}% Boost
              </span>
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
