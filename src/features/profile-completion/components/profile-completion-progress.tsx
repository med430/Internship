import { Progress } from "@/components/ui/progress";

interface ProfileCompletionProgressProps {
  currentStep: number;
  progress: number;
  steps: {
    id: number;
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    description: string;
  }[];
}

export function ProfileCompletionProgress({
  currentStep,
  progress,
  steps,
}: ProfileCompletionProgressProps) {
  return (
    <>
      <div className="space-y-2">
        <div className="flex justify-between text-sm font-medium">
          <span className="text-muted-foreground">
            Step {currentStep} of {steps.length}
          </span>
          <span className="text-primary">{Math.round(progress)}% complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <div className="flex justify-between">
        {steps.map((step) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;

          return (
            <div key={step.id} className="flex flex-col items-center flex-1">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                  isActive
                    ? "border-primary bg-primary text-primary-foreground shadow-lg scale-110"
                    : isCompleted
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-muted bg-background text-muted-foreground"
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <p
                className={`mt-2 text-xs font-medium text-center ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {step.title}
              </p>
            </div>
          );
        })}
      </div>
    </>
  );
}
