import { Card } from "@/components/ui/card";
import { AsyncJobLoadingStage } from "@/components/shared/async-job-loading-stage";
import {
  QuestionsForm,
  type QuestionAnswer,
} from "@/components/cv-rewriter/questions-form";

interface CVRewriterQuestionsStepProps {
  isGeneratingQueries: boolean;
  isGeneratingCV: boolean;
  questions: Record<string, string> | null;
  onSubmitAnswers: (answers: QuestionAnswer[]) => Promise<void>;
  onRestart: () => void;
}

export function CVRewriterQuestionsStep({
  isGeneratingQueries,
  isGeneratingCV,
  questions,
  onSubmitAnswers,
  onRestart,
}: CVRewriterQuestionsStepProps) {
  if (isGeneratingQueries) {
    return (
      <AsyncJobLoadingStage
        feature="cv-rewriter"
        operation="questions"
        title="Preparing your follow-up questions"
        subtitle="We are extracting context from your CV and job descriptions."
        variant="form"
      />
    );
  }

  return (
    <Card className="rounded-2xl border border-border bg-card/80 p-8 shadow-lg shadow-primary/5 backdrop-blur-xl">
      {questions ? (
        <QuestionsForm
          questions={questions}
          onSubmit={onSubmitAnswers}
          onBackToStart={onRestart}
          isSubmitting={isGeneratingCV}
        />
      ) : null}
    </Card>
  );
}
