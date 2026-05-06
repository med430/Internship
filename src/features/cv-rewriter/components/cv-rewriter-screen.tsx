"use client";

import { CVRewriterNav } from "@/components/cv-rewriter/cv-rewriter-nav";
import { useCVRewriterController } from "../hooks/use-cv-rewriter-controller";
import { CVRewriterHero } from "./cv-rewriter-hero";
import { CVRewriterStepIndicator } from "./cv-rewriter-step-indicator";
import { CVRewriterUploadStep } from "./cv-rewriter-upload-step";
import { CVRewriterQuestionsStep } from "./cv-rewriter-questions-step";
import { CVRewriterResultStep } from "./cv-rewriter-result-step";

export function CVRewriterScreen() {
  const {
    currentStep,
    cvFile,
    questions,
    pdfUrl,
    pdfFilename,
    reviewSummary,
    isGeneratingQueries,
    isGeneratingCV,
    setCvFile,
    setJobDescriptions,
    handleGenerateQueries,
    handleSubmitAnswers,
    handleRestart,
  } = useCVRewriterController();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background px-6 py-10">
      <div
        className={`container mx-auto ${
          currentStep === "result" ? "max-w-6xl" : "max-w-5xl"
        }`}
      >
        {currentStep === "upload" && <CVRewriterNav />}

        {currentStep === "upload" && <CVRewriterHero />}

        {currentStep !== "upload" && (
          <div className="text-center mb-8">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground mb-2">
              CV Booster
            </h1>
          </div>
        )}

        <CVRewriterStepIndicator currentStep={currentStep} />

        <div className="space-y-8">
          {currentStep === "upload" && (
            <CVRewriterUploadStep
              cvFile={cvFile}
              isGeneratingQueries={isGeneratingQueries}
              onCVFileChange={setCvFile}
              onJobDescriptionsChange={setJobDescriptions}
              onGenerateQueries={handleGenerateQueries}
            />
          )}

          {currentStep === "questions" && (
            <CVRewriterQuestionsStep
              isGeneratingQueries={isGeneratingQueries}
              isGeneratingCV={isGeneratingCV}
              questions={questions}
              onSubmitAnswers={handleSubmitAnswers}
              onRestart={handleRestart}
            />
          )}

          {currentStep === "result" && (
            <CVRewriterResultStep
              isGeneratingCV={isGeneratingCV}
              pdfUrl={pdfUrl}
              pdfFilename={pdfFilename}
              reviewSummary={reviewSummary}
              onRestart={handleRestart}
            />
          )}
        </div>
      </div>
    </div>
  );
}
