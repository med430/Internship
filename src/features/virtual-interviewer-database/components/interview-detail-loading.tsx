import { Skeleton } from "@/components/ui/skeleton";
import { InterviewNav } from "@/components/virtual-interviewer/interview-nav";

export function InterviewDetailLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background px-6 py-10">
      <div className="container mx-auto max-w-5xl">
        <InterviewNav />
        <div className="space-y-6">
          <Skeleton className="h-12 w-3/4 bg-muted" />
          <Skeleton className="h-64 w-full bg-muted" />
          <Skeleton className="h-48 w-full bg-muted" />
        </div>
      </div>
    </div>
  );
}
