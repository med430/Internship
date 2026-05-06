"use client";

import { ThemeToggle } from "@/components/theme-toggle";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { ProfileCompletionWizardProps } from "../lib/profile-schema";
import { useProfileCompletionController } from "../hooks/use-profile-completion-controller";
import { ProfileCompletionIntro } from "./profile-completion-intro";
import { ProfileCompletionNavigation } from "./profile-completion-navigation";
import { ProfileCompletionProgress } from "./profile-completion-progress";
import { ProfileCompletionStepFields } from "./profile-completion-step-fields";

export function ProfileCompletionWizardScreen({
  initialData,
  userEmail,
}: ProfileCompletionWizardProps) {
  void userEmail;

  const {
    form,
    currentStep,
    isSubmitting,
    progress,
    onSubmit,
    handleNext,
    handlePrevious,
    handleKeyDown,
    handleSkip,
    currentStepMeta,
    steps,
  } = useProfileCompletionController(initialData);

  const CurrentIcon = currentStepMeta.icon;

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-br from-background via-background to-muted/20">
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-3xl space-y-6">
        <ProfileCompletionIntro />

        <ProfileCompletionProgress
          currentStep={currentStep}
          progress={progress}
          steps={steps.map((step) => ({ ...step }))}
        />

        <Card className="border-2 shadow-xl backdrop-blur-sm bg-card/95">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <CurrentIcon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="text-2xl">
                  {currentStepMeta.title}
                </CardTitle>
                <CardDescription className="text-base">
                  {currentStepMeta.description}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                onKeyDown={handleKeyDown}
                className="space-y-6"
              >
                <ProfileCompletionStepFields
                  currentStep={currentStep}
                  form={form}
                />

                <ProfileCompletionNavigation
                  currentStep={currentStep}
                  stepsCount={steps.length}
                  isSubmitting={isSubmitting}
                  onPrevious={handlePrevious}
                  onSkip={handleSkip}
                  onNext={handleNext}
                  onSubmit={() => {
                    form.handleSubmit(onSubmit)();
                  }}
                />
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
