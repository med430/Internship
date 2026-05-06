"use client";

import { CareerGuideNav } from "@/components/career-guide/career-guide-nav";
import { CareerGuideHero } from "./career-guide-hero";
import { CareerGuideInputStep } from "./career-guide-input-step";
import { CareerGuideLoadingStep } from "./career-guide-loading-step";
import { CareerGuideResultStep } from "./career-guide-result-step";
import { useCareerGuideController } from "../hooks/use-career-guide-controller";

export function CareerGuideScreen() {
  const {
    currentStep,
    cvSource,
    currentJob,
    targetJob,
    domain,
    useTargetJob,
    isGenerating,
    careerGuide,
    setCvSource,
    setCurrentJob,
    setTargetJob,
    setDomain,
    setUseTargetJob,
    handleGenerateGuide,
    handleRestart,
  } = useCareerGuideController();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background px-6 py-10">
      <div className="container mx-auto max-w-5xl">
        {(currentStep === "input" || currentStep === "result") && (
          <CareerGuideNav />
        )}

        {currentStep === "input" && <CareerGuideHero />}

        {currentStep !== "input" && (
          <div className="text-center mb-8">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground mb-2">
              Career Guide
            </h1>
          </div>
        )}

        {currentStep === "input" && (
          <CareerGuideInputStep
            cvSource={cvSource}
            currentJob={currentJob}
            targetJob={targetJob}
            domain={domain}
            useTargetJob={useTargetJob}
            isGenerating={isGenerating}
            onCvSourceChange={setCvSource}
            onCurrentJobChange={setCurrentJob}
            onTargetJobChange={setTargetJob}
            onDomainChange={setDomain}
            onUseTargetJobChange={setUseTargetJob}
            onGenerate={handleGenerateGuide}
          />
        )}

        {currentStep === "loading" && <CareerGuideLoadingStep />}

        {currentStep === "result" && careerGuide && (
          <CareerGuideResultStep
            careerGuide={careerGuide}
            onRestart={handleRestart}
          />
        )}
      </div>
    </div>
  );
}
