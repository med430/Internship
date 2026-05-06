import { CheckCircle, FileText, MessageSquare } from "lucide-react";
import type { CVRewriterStep } from "../types";

interface CVRewriterStepIndicatorProps {
  currentStep: CVRewriterStep;
}

const STEPS: Array<{
  id: CVRewriterStep;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: "upload", label: "Upload", icon: FileText },
  { id: "questions", label: "Q&A", icon: MessageSquare },
  { id: "result", label: "Result", icon: CheckCircle },
];

export function CVRewriterStepIndicator({
  currentStep,
}: CVRewriterStepIndicatorProps) {
  const currentIndex = STEPS.findIndex((step) => step.id === currentStep);

  return (
    <div className="flex items-center justify-center gap-1 sm:gap-2 mb-12">
      {STEPS.map((step, index) => {
        const Icon = step.icon;
        const isActive = currentStep === step.id;
        const isCompleted = index < currentIndex;

        return (
          <div key={step.id} className="flex items-center">
            <div
              className={`flex flex-col items-center gap-1 sm:gap-2 transition-all duration-200 ${
                isActive ? "scale-105" : "scale-100"
              }`}
            >
              <div
                className={`flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-full transition-all duration-200 ${
                  isCompleted
                    ? "bg-primary"
                    : isActive
                      ? "bg-primary ring-2 ring-primary/20 ring-offset-2 ring-offset-background"
                      : "bg-muted"
                }`}
              >
                <Icon
                  className={`h-4 w-4 sm:h-5 sm:w-5 ${
                    isCompleted || isActive
                      ? "text-primary-foreground"
                      : "text-muted-foreground"
                  }`}
                />
              </div>
              <span
                className={`text-[10px] sm:text-xs font-medium transition-all duration-200 ${
                  isActive
                    ? "text-foreground"
                    : isCompleted
                      ? "text-foreground/80"
                      : "text-muted-foreground"
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={`mx-1.5 sm:mx-3 h-0.5 w-6 sm:w-16 transition-all duration-200 ${
                  index < currentIndex ? "bg-primary" : "bg-muted"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
