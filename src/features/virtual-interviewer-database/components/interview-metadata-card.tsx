import { Badge } from "@/components/ui/badge";
import { Interview } from "@/lib/api/interviews";
import { getDifficultyColor, getScoreColor } from "../lib/display";

interface InterviewMetadataCardProps {
  interview: Interview;
}

export function InterviewMetadataCard({
  interview,
}: InterviewMetadataCardProps) {
  return (
    <div className="mb-6 rounded-xl border border-border/60 bg-card/80 p-6 backdrop-blur-md">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <span className="text-xs text-muted-foreground">
            Interviewer Role
          </span>
          <p className="text-sm font-medium text-foreground mt-1">
            {interview.interviewer_role}
          </p>
        </div>
        <div>
          <span className="text-xs text-muted-foreground">Interview Style</span>
          <p className="text-sm font-medium text-foreground mt-1">
            {interview.interview_style}
          </p>
        </div>
        <div>
          <span className="text-xs text-muted-foreground">Difficulty</span>
          <div className="mt-1">
            <Badge
              variant="outline"
              className={getDifficultyColor(interview.difficulty_level)}
            >
              {interview.difficulty_level}
            </Badge>
          </div>
        </div>
        <div>
          <span className="text-xs text-muted-foreground">Total Exchanges</span>
          <p className="text-sm font-medium text-foreground mt-1">
            {interview.total_exchanges}
          </p>
        </div>
        <div>
          <span className="text-xs text-muted-foreground">Overall Score</span>
          <p
            className={`text-sm font-bold mt-1 ${getScoreColor(interview.overall_score)}`}
          >
            {Math.round(interview.overall_score)}/100
          </p>
        </div>
        <div>
          <span className="text-xs text-muted-foreground">
            Acceptance Probability
          </span>
          <p
            className={`text-sm font-bold mt-1 ${getScoreColor(interview.acceptance_probability)}`}
          >
            {Math.round(interview.acceptance_probability)}%
          </p>
        </div>
      </div>
    </div>
  );
}
