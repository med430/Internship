import { format } from "date-fns";
import { FileText } from "lucide-react";
import { CoverLetter } from "@/lib/api/cover-letters";

interface CoverLetterCardProps {
  letter: CoverLetter;
  onClick: () => void;
}

export function CoverLetterCard({ letter, onClick }: CoverLetterCardProps) {
  const formattedDate = format(new Date(letter.created_at), "MMM dd, yyyy");

  return (
    <div
      onClick={onClick}
      className="group cursor-pointer overflow-hidden rounded-xl border border-border/60 bg-card/80 hover:bg-card hover:shadow-lg hover:shadow-primary/10 hover:border-primary/30 transition-all duration-200"
    >
      <div className="p-6 space-y-4">
        <div className="flex items-start gap-3">
          <div className="rounded-full bg-primary/10 p-2 flex-shrink-0">
            <FileText className="h-4 w-4 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors truncate">
              Cover Letter
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">{formattedDate}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
