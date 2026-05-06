"use client";

import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import type { AsyncJobFeature, AsyncJobOperation } from "@/lib/api/async-jobs";
import { useAsyncJobsStore } from "@/lib/stores/async-jobs-store";

interface AsyncJobLiveStatusProps {
  feature: AsyncJobFeature;
  operation?: AsyncJobOperation;
  className?: string;
}

function toStateText(message: string | null | undefined, status: string): string {
  const normalizedMessage = (message || "").trim().replace(/[.\s]+$/, "");
  if (normalizedMessage.length > 0) {
    return `${normalizedMessage}...`;
  }

  const fallback = status.toLowerCase().replace(/_/g, " ");
  return `${fallback}...`;
}

function toVisualProgress(status: string, progress: number): number {
  const clamped = Math.max(0, Math.min(100, progress || 0));
  if (clamped > 0) {
    return clamped;
  }

  if (status === "PENDING") {
    return 8;
  }

  if (status === "PROCESSING") {
    return 42;
  }

  if (status === "COMPLETED") {
    return 100;
  }

  return 0;
}

export function AsyncJobLiveStatus({
  feature,
  operation,
  className,
}: AsyncJobLiveStatusProps) {
  const latestJob = useAsyncJobsStore((state) =>
    state.getLatestJobForFeature(feature, operation),
  );
  const streamStatus = useAsyncJobsStore((state) => state.streamStatus);
  const streamError = useAsyncJobsStore((state) => state.streamError);

  if (!latestJob) {
    return null;
  }

  const progressValue = toVisualProgress(latestJob.status, latestJob.progress || 0);
  const connectionText =
    streamStatus === "connected"
      ? null
      : streamError ||
        (streamStatus === "connecting"
          ? "Reconnecting live updates..."
          : "Connecting live updates...");

  return (
    <div
      className={cn(
        "space-y-2 rounded-xl border border-border/70 bg-background/70 p-3 sm:p-4",
        className,
      )}
    >
      <Progress value={progressValue} className="h-1.5" />

      <p className="text-sm text-foreground">
        {toStateText(latestJob.message, latestJob.status)}
      </p>

      {connectionText && (
        <p className="text-xs text-muted-foreground">{connectionText}</p>
      )}
    </div>
  );
}
