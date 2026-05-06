import { Interview } from "@/lib/api/interviews";

export const PERFORMANCE_METRICS: Array<{
  label: string;
  selector: (interview: Interview) => number;
}> = [
  {
    label: "Technical Competency",
    selector: (interview) => interview.technical_competency,
  },
  {
    label: "Communication Skills",
    selector: (interview) => interview.communication_skills,
  },
  {
    label: "Problem Solving",
    selector: (interview) => interview.problem_solving,
  },
  {
    label: "Cultural Fit",
    selector: (interview) => interview.cultural_fit,
  },
];

export function getScoreColor(score: number) {
  if (score >= 80) {
    return "text-[#05e34f] dark:text-[#04c945]";
  }

  if (score >= 60) {
    return "text-yellow-500 dark:text-yellow-400";
  }

  if (score >= 40) {
    return "text-orange-500 dark:text-orange-400";
  }

  return "text-red-500 dark:text-red-400";
}

export function getDifficultyColor(difficulty: string) {
  switch (difficulty.toLowerCase()) {
    case "beginner":
      return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
    case "intermediate":
      return "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20";
    case "advanced":
      return "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20";
    case "expert":
      return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";
    default:
      return "bg-gray-500/10 text-gray-600 dark:text-gray-400 border-gray-500/20";
  }
}
