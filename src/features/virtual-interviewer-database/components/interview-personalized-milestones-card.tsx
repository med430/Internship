import { Badge } from "@/components/ui/badge";
import type { Interview } from "@/lib/api/interviews";
import { getScoreColor } from "../lib/display";

interface InterviewPersonalizedMilestonesCardProps {
  interview: Interview;
}

export function InterviewPersonalizedMilestonesCard({
  interview,
}: InterviewPersonalizedMilestonesCardProps) {
  const milestones = interview.milestones ?? [];
  const voiceMetrics = interview.voice_metrics ?? [];

  if (!interview.personalized_mode && !milestones.length && !voiceMetrics.length) {
    return null;
  }

  const averageFluency = voiceMetrics.length
    ? Math.round(
        voiceMetrics.reduce((sum, metric) => sum + metric.fluencyScore, 0) /
          voiceMetrics.length,
      )
    : null;
  const validatedCount = milestones.filter(
    (milestone) => milestone.status === "VALIDATED",
  ).length;

  return (
    <div className="mb-6 rounded-xl border border-border/60 bg-card/80 p-6 backdrop-blur-md">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Personalized Milestones
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Offer and CV based interview checkpoints with follow-up tracking.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 text-right">
          <div className="rounded-lg border border-border/70 px-3 py-2">
            <p className="text-xs text-muted-foreground">Validated</p>
            <p className="text-lg font-bold text-foreground">
              {validatedCount}/{milestones.length || "--"}
            </p>
          </div>
          <div className="rounded-lg border border-border/70 px-3 py-2">
            <p className="text-xs text-muted-foreground">Voice</p>
            <p className="text-lg font-bold text-foreground">
              {averageFluency === null ? "--" : `${averageFluency}/10`}
            </p>
          </div>
        </div>
      </div>

      {milestones.length ? (
        <div className="grid gap-3">
          {milestones.map((milestone) => (
            <div
              key={milestone.id}
              className="rounded-lg border border-border/60 bg-muted/30 p-4"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline">#{milestone.id}</Badge>
                    <Badge variant="secondary">
                      {milestone.type.replace(/_/g, " ")}
                    </Badge>
                    <Badge
                      variant={
                        milestone.status === "VALIDATED"
                          ? "default"
                          : "outline"
                      }
                    >
                      {milestone.status ?? "PENDING"}
                    </Badge>
                  </div>
                  <p className="mt-3 text-sm font-medium text-foreground">
                    {milestone.question}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    {milestone.feedback ?? milestone.objective}
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <p
                    className={`text-sm font-bold ${
                      typeof milestone.lastScore === "number"
                        ? getScoreColor(milestone.lastScore)
                        : "text-muted-foreground"
                    }`}
                  >
                    {typeof milestone.lastScore === "number"
                      ? `${milestone.lastScore}/100`
                      : "--"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {milestone.followUpCount ?? 0} follow-ups
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
