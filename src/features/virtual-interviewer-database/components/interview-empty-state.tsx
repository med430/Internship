import { MessageSquare } from "lucide-react";

export function InterviewEmptyState() {
  return (
    <div className="flex min-h-[500px] flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card/40 p-12 backdrop-blur">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <MessageSquare className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="mt-6 text-base font-medium text-foreground">
        No interviews found
      </h3>
      <p className="mt-1 text-center text-xs text-muted-foreground">
        You haven&apos;t completed any interviews yet. Start your first
        interview to get feedback!
      </p>
    </div>
  );
}
