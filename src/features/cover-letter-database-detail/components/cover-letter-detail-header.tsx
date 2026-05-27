import { ArrowLeft, Download, Loader2, Trash2 } from "lucide-react";
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
import type { CoverLetter } from "@/lib/api/cover-letters";

interface CoverLetterDetailHeaderProps {
  letter: CoverLetter;
  deleting: boolean;
  downloading: boolean;
  formattedDate: string;
  onBack: () => void;
  onDelete: () => Promise<void>;
  onDownload: () => Promise<void>;
}

export function CoverLetterDetailHeader({
  deleting,
  downloading,
  formattedDate,
  onBack,
  onDelete,
  onDownload,
}: CoverLetterDetailHeaderProps) {
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
          <h1 className="text-lg sm:text-xl md:text-2xl font-medium tracking-tight text-foreground">
            Cover Letter
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">{formattedDate}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onDownload}
            disabled={downloading}
            className="border-border"
          >
            {downloading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Download
          </Button>
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
                <AlertDialogTitle className="text-foreground">Delete Cover Letter</AlertDialogTitle>
                <AlertDialogDescription className="text-muted-foreground">
                  Are you sure you want to delete this cover letter? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-border">Cancel</AlertDialogCancel>
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