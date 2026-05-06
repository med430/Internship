import type { AsyncJobFeature, AsyncJobOperation } from "@/lib/api/async-jobs";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { AsyncJobLiveStatus } from "@/components/shared/async-job-live-status";

type LoadingSkeletonVariant = "form" | "document" | "cards" | "preview";

interface AsyncJobLoadingStageProps {
  feature: AsyncJobFeature;
  operation?: AsyncJobOperation;
  title: string;
  subtitle: string;
  variant?: LoadingSkeletonVariant;
  className?: string;
}

function LoadingSkeleton({ variant }: { variant: LoadingSkeletonVariant }) {
  if (variant === "document") {
    return (
      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="space-y-3 lg:flex-[3]">
          <Skeleton className="h-10 w-2/3 rounded-xl" />
          <Skeleton className="h-[48vh] min-h-[320px] w-full rounded-xl" />
        </div>
        <div className="space-y-3 lg:flex-[2]">
          <Skeleton className="h-8 w-1/2 rounded-xl" />
          <Skeleton className="h-4 w-full rounded-xl" />
          <Skeleton className="h-4 w-11/12 rounded-xl" />
          <Skeleton className="h-4 w-4/5 rounded-xl" />
          <Skeleton className="h-4 w-full rounded-xl" />
          <Skeleton className="h-4 w-3/4 rounded-xl" />
        </div>
      </div>
    );
  }

  if (variant === "preview") {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-1/3 rounded-xl" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
        <Skeleton className="h-4 w-full rounded-xl" />
        <Skeleton className="h-4 w-10/12 rounded-xl" />
        <Skeleton className="h-4 w-4/5 rounded-xl" />
      </div>
    );
  }

  if (variant === "cards") {
    return (
      <div className="space-y-3">
        <Skeleton className="h-28 w-full rounded-xl" />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Skeleton className="h-24 rounded-xl" />
          <Skeleton className="h-24 rounded-xl" />
        </div>
        <Skeleton className="h-36 w-full rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Skeleton className="h-6 w-2/3 rounded-xl" />
      <Skeleton className="h-4 w-1/2 rounded-xl" />
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton className="h-4 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>
      ))}
    </div>
  );
}

export function AsyncJobLoadingStage({
  feature,
  operation,
  title,
  subtitle,
  variant = "cards",
  className,
}: AsyncJobLoadingStageProps) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border bg-card/80 p-4 shadow-lg shadow-primary/5 sm:p-6",
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_hsl(var(--primary)/0.12),_transparent_55%)]" />
      <div className="relative space-y-5">
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-foreground sm:text-lg">{title}</h3>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>

        <AsyncJobLiveStatus feature={feature} operation={operation} />

        <LoadingSkeleton variant={variant} />
      </div>
    </section>
  );
}
