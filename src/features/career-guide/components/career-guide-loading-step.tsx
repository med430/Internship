import { AsyncJobLoadingStage } from "@/components/shared/async-job-loading-stage";

export function CareerGuideLoadingStep() {
  return (
    <AsyncJobLoadingStage
      feature="career-guide"
      operation="generate"
      title="Building your career guide"
      subtitle="Live updates appear here while we analyze your profile and goals."
      variant="cards"
    />
  );
}
