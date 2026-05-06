import type { Interview } from "./types";

function normalizeNumber(value: unknown): number {
  if (value === null || value === undefined) {
    return 0;
  }

  if (typeof value === "number") {
    return value;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

export function normalizeInterview(interview: Record<string, unknown>): Interview {
  return {
    ...interview,
    overall_score: normalizeNumber(interview.overall_score),
    technical_competency: normalizeNumber(interview.technical_competency),
    communication_skills: normalizeNumber(interview.communication_skills),
    problem_solving: normalizeNumber(interview.problem_solving),
    cultural_fit: normalizeNumber(interview.cultural_fit),
    acceptance_probability: normalizeNumber(interview.acceptance_probability),
  } as Interview;
}
