import { Interview } from "@/lib/api/interviews";
import type { FacialExpressionMetrics } from "@/lib/api/interviews/types";
import { getScoreColor } from "../lib/display";

interface InterviewFacialExpressionCardProps {
  interview: Interview;
}

const METRICS: Array<{
  label: string;
  selector: (metrics: FacialExpressionMetrics) => number;
}> = [
  {
    label: "Face Present",
    selector: (metrics) => metrics.facePresentRate,
  },
  {
    label: "Attention",
    selector: (metrics) => metrics.attentionRate,
  },
  {
    label: "Positive Cues",
    selector: (metrics) => metrics.positiveExpressionRate,
  },
  {
    label: "Expression Stability",
    selector: (metrics) => metrics.expressionStability,
  },
];

export function InterviewFacialExpressionCard({
  interview,
}: InterviewFacialExpressionCardProps) {
  const metrics = interview.facial_metrics;
  const score = interview.facial_expression_score;

  if (!metrics && !interview.facial_summary) {
    return null;
  }

  return (
    <div className="mb-6 rounded-xl border border-border/60 bg-card/80 p-6 backdrop-blur-md">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Facial Expression Coaching
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {interview.facial_summary ??
              "Camera-based communication cues are available for this interview."}
          </p>
        </div>

        <div className="rounded-lg border border-border/70 px-3 py-2 text-right">
          <p className="text-xs text-muted-foreground">Cue score</p>
          <p
            className={`text-lg font-bold ${
              score === null || score === undefined
                ? "text-muted-foreground"
                : getScoreColor(score)
            }`}
          >
            {score === null || score === undefined ? "--" : `${score}/100`}
          </p>
        </div>
      </div>

      {metrics ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {METRICS.map((metric) => {
            const value = metric.selector(metrics);
            return (
              <div key={metric.label} className="rounded-lg bg-muted/50 p-3">
                <p className="text-xs text-muted-foreground">{metric.label}</p>
                <p className="mt-1 text-sm font-semibold text-foreground">
                  {Math.round(value)}%
                </p>
              </div>
            );
          })}
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground">Samples</p>
            <p className="mt-1 text-sm font-semibold text-foreground">
              {metrics.sampleCount}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
