import { format } from "date-fns";
import { ArrowLeft, Download, Loader2, Trash2 } from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { Interview } from "@/lib/api/interviews";

interface InterviewDetailHeaderProps {
  interview: Interview;
  deleting: boolean;
  downloading: boolean;
  onBack: () => void;
  onDelete: () => Promise<void>;
  onDownload: () => Promise<void>;
}

export function InterviewDetailHeader({
  interview,
  deleting,
  downloading,
  onBack,
  onDelete,
  onDownload,
}: InterviewDetailHeaderProps) {
  return (
    <div className="mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div className="min-w-0">
        <Button variant="ghost" size="sm" onClick={onBack} className="mb-3">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to history
        </Button>
        <h1 className="text-2xl font-semibold text-foreground">
          Interview with {interview.interviewer_name}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {format(new Date(interview.created_at), "MMMM dd, yyyy 'at' h:mm a")}
        </p>
      </div>
      <div className="flex gap-2 flex-wrap items-start md:items-center justify-start md:justify-end w-full md:w-auto">
        <Button
          variant="outline"
          size="sm"
          onClick={onDownload}
          disabled={downloading || !interview.pdf_url}
          className="w-full sm:w-auto flex-1 sm:flex-none"
        >
          {downloading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Download className="mr-2 h-4 w-4" />
          )}
          Download PDF
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="destructive"
              size="sm"
              disabled={deleting}
              className="w-full sm:w-auto flex-1 sm:flex-none"
            >
              {deleting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Trash2 className="mr-2 h-4 w-4" />
              )}
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Interview</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this interview? This action
                cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={onDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
