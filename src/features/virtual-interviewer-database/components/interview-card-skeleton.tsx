import { Skeleton } from "@/components/ui/skeleton";

export function InterviewCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card/60 backdrop-blur-md">
      <div className="p-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-3/4 bg-muted" />
            <Skeleton className="h-4 w-1/2 bg-muted" />
            <Skeleton className="h-5 w-24 bg-muted" />
          </div>
          <Skeleton className="h-16 w-16 rounded-full bg-muted" />
        </div>
      </div>
    </div>
  );
}
