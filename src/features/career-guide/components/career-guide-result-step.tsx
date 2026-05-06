import { Button } from "@/components/ui/button";
import { StrengthsSection } from "@/components/career-guide/strengths-section";
import { ImprovementSection } from "@/components/career-guide/improvement-section";
import { RoadmapSection } from "@/components/career-guide/roadmap-section";
import type { CareerGuideResponse } from "@/lib/api/career-guide";

interface CareerGuideResultStepProps {
  careerGuide: CareerGuideResponse;
  onRestart: () => void;
}

export function CareerGuideResultStep({
  careerGuide,
  onRestart,
}: CareerGuideResultStepProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-50">
          Your Career Guide
        </h2>
        <Button
          variant="outline"
          size="sm"
          onClick={onRestart}
          className="border-neutral-200 dark:border-neutral-700"
        >
          Start Over
        </Button>
      </div>

      <StrengthsSection
        strengths={careerGuide.current_strengths}
        readinessScore={careerGuide.readiness_score}
      />

      <ImprovementSection
        skills={careerGuide.skills_to_learn}
        projects={careerGuide.projects_to_work_on}
        softSkills={careerGuide.soft_skills_to_develop}
      />

      <RoadmapSection roadmap={careerGuide.career_roadmap} />
    </div>
  );
}
