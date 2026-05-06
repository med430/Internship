import { ArrowLeft, Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { CV } from "@/lib/api/cvs";

interface CvDetailHeaderProps {
  cv: CV;
  deleting: boolean;
  scoreImprovement: number;
  formattedDate: string;
  onBack: () => void;
  onDelete: () => Promise<void>;
}

export function CvDetailHeader({
  cv,
  deleting,
  scoreImprovement,
  formattedDate,
  onBack,
  onDelete,
}: CvDetailHeaderProps) {
  return (
    <div className="mb-6">
      <Button
        onClick={onBack}
        variant="ghost"
        size="sm"
        className="mb-4 -ml-2 text-muted-foreground hover:text-foreground hover:bg-accent"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to history
      </Button>
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl md:text-2xl font-medium tracking-tight text-foreground break-words">
            {cv.job_title}
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">{formattedDate}</p>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm sm:text-base md:text-lg font-medium tracking-tight text-[#05e34f] hover:text-[#04c945] transition-colors whitespace-nowrap">
            +{scoreImprovement}% Boost
          </span>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-red-500 dark:hover:text-red-400 transition-colors"
                disabled={deleting}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="border-border bg-popover/95 backdrop-blur-xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-foreground">
                  Delete CV
                </AlertDialogTitle>
                <AlertDialogDescription className="text-muted-foreground">
                  Are you sure you want to delete this CV? This action cannot be
                  undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-border">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={onDelete}
                  className="bg-red-500/90 hover:bg-red-600/90 text-white"
                >
                  {deleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}
