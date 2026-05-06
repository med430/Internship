import { Interview } from "@/lib/api/interviews";
import { getScoreColor, PERFORMANCE_METRICS } from "../lib/display";

interface InterviewPerformanceCardProps {
  interview: Interview;
}

export function InterviewPerformanceCard({
  interview,
}: InterviewPerformanceCardProps) {
  return (
    <div className="mb-6 rounded-xl border border-border/60 bg-card/80 p-6 backdrop-blur-md">
      <h2 className="text-lg font-semibold text-foreground mb-4">
        Performance Breakdown
      </h2>
      <div className="space-y-4">
        {PERFORMANCE_METRICS.map((metric) => {
          const value = metric.selector(interview);
          return (
            <div key={metric.label}>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-foreground">{metric.label}</span>
                <span
                  className={`text-sm font-semibold ${getScoreColor(value)}`}
                >
                  {Math.round(value)}/100
                </span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${value}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
