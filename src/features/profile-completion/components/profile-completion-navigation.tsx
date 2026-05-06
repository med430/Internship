import { Button } from "@/components/ui/button";

interface ProfileCompletionNavigationProps {
  currentStep: number;
  stepsCount: number;
  isSubmitting: boolean;
  onPrevious: () => void;
  onSkip: () => Promise<void>;
  onNext: () => Promise<void>;
  onSubmit: () => void;
}

export function ProfileCompletionNavigation({
  currentStep,
  stepsCount,
  isSubmitting,
  onPrevious,
  onSkip,
  onNext,
  onSubmit,
}: ProfileCompletionNavigationProps) {
  return (
    <div className="flex items-center justify-between pt-6 border-t">
      <div className="flex gap-2">
        {currentStep > 1 && (
          <Button type="button" variant="outline" onClick={onPrevious}>
            Previous
          </Button>
        )}
        {currentStep < stepsCount && (
          <Button type="button" variant="ghost" onClick={onSkip}>
            Skip this step
          </Button>
        )}
      </div>
      {currentStep < stepsCount ? (
        <Button type="button" onClick={onNext}>
          Next
        </Button>
      ) : (
        <Button type="button" disabled={isSubmitting} onClick={onSubmit}>
          {isSubmitting ? "Completing..." : "Complete Profile"}
        </Button>
      )}
    </div>
  );
}
