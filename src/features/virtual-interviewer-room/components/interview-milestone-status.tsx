"use client";

import type { InterviewMilestone, VoiceMetrics } from "@/lib/api/interviews/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface InterviewMilestoneStatusProps {
  milestone: InterviewMilestone | null;
  isPersonalized: boolean;
  voiceMetrics: VoiceMetrics | null;
  isFollowUp: boolean;
}

export function InterviewMilestoneStatus({
  milestone,
  isPersonalized,
  voiceMetrics,
  isFollowUp,
}: InterviewMilestoneStatusProps) {
  if (!isPersonalized && !milestone && !voiceMetrics) {
    return null;
  }

  return (
    <div className="border-y border-border/60 bg-background/70 px-5 py-4">
      <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">Personalized interview</Badge>
            {milestone ? (
              <>
                <Badge variant="secondary">Milestone {milestone.id}</Badge>
                <Badge
                  className={cn(
                    "capitalize",
                    milestone.status === "VALIDATED"
                      ? "bg-emerald-600 text-white hover:bg-emerald-600"
                      : "bg-amber-500 text-white hover:bg-amber-500",
                  )}
                >
                  {(milestone.status ?? "IN_PROGRESS").replace(/_/g, " ")}
                </Badge>
              </>
            ) : null}
            {isFollowUp ? <Badge variant="outline">Follow-up</Badge> : null}
          </div>
          {milestone ? (
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                {milestone.type.replace(/_/g, " ")}
              </p>
              <p className="line-clamp-2 text-sm text-muted-foreground">
                {milestone.objective}
              </p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Milestone context will appear after the next personalized question.
            </p>
          )}
        </div>

        {voiceMetrics ? (
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="rounded-lg border border-border/70 px-3 py-2">
              <p className="text-muted-foreground">Fluency</p>
              <p className="mt-1 font-semibold text-foreground">
                {voiceMetrics.fluencyScore}/10
              </p>
            </div>
            <div className="rounded-lg border border-border/70 px-3 py-2">
              <p className="text-muted-foreground">Words</p>
              <p className="mt-1 font-semibold text-foreground">
                {voiceMetrics.wordCount}
              </p>
            </div>
            <div className="rounded-lg border border-border/70 px-3 py-2">
              <p className="text-muted-foreground">Fillers</p>
              <p className="mt-1 font-semibold text-foreground">
                {voiceMetrics.fillerWordCount}
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
