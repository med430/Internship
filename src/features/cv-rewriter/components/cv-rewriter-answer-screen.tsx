"use client";

import Link from "next/link";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CVRewriterNav } from "@/components/cv-rewriter/cv-rewriter-nav";
import { QuestionsForm } from "@/components/cv-rewriter/questions-form";
import { AsyncJobLoadingStage } from "@/components/shared/async-job-loading-stage";
import { useCVRewriterAnswerController } from "../hooks/use-cv-rewriter-answer-controller";

function SessionListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <Card key={index} className="p-4 bg-card/70 border-border">
          <Skeleton className="h-4 w-2/3 mb-2" />
          <Skeleton className="h-3 w-1/3" />
        </Card>
      ))}
    </div>
  );
}

function EmptySessionsState() {
  return (
    <Card className="p-8 rounded-2xl bg-card/80 backdrop-blur-xl border border-border text-center">
      <h3 className="text-lg font-semibold text-foreground mb-2">
        No Unanswered Sessions
      </h3>
      <p className="text-sm text-muted-foreground">
        You currently have no unfinished question sessions. Generate a new CV
        question set to continue.
      </p>
    </Card>
  );
}

export function CVRewriterAnswerScreen() {
  const {
    sessions,
    selectedSession,
    isLoadingSessions,
    isSubmitting,
    isRewriteInProgress,
    error,
    loadSessions,
    handleSelectSession,
    handleSubmitAnswers,
  } = useCVRewriterAnswerController();

  if (isRewriteInProgress) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background px-6 py-10">
        <div className="container mx-auto max-w-7xl space-y-6">
          <CVRewriterNav />

          <AsyncJobLoadingStage
            feature="cv-rewriter"
            operation="rewrite"
            title="A CV rewrite is already in progress"
            subtitle="Go to the Generate tab to follow live progress there."
            variant="document"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background px-6 py-10">
      <div className="container mx-auto max-w-7xl">
        <CVRewriterNav />

        <div className="mb-6">
          <h1 className="text-2xl font-medium tracking-tight text-foreground">
            Answer Unfinished Questions
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Resume previously generated question sessions and submit your answers.
          </p>
        </div>

        {error && (
          <div className="mb-4 rounded-lg border border-red-200/40 bg-red-50/50 backdrop-blur p-4 text-xs text-red-600 dark:border-red-800/40 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        {isLoadingSessions ? (
          <SessionListSkeleton />
        ) : sessions.length === 0 ? (
          <EmptySessionsState />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="p-4 rounded-2xl bg-card/80 backdrop-blur-xl border border-border h-fit lg:sticky lg:top-24">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold text-foreground">
                  Open Sessions
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => void loadSessions()}
                  disabled={isSubmitting}
                >
                  Refresh
                </Button>
              </div>

              <div className="space-y-2 max-h-[560px] overflow-y-auto pr-1">
                {sessions.map((session) => {
                  const questionCount =
                    Object.keys(session.questions_json || {}).length ||
                    Number(session.metadata?.question_count || 0);
                  const isSelected = selectedSession?.id === session.id;

                  return (
                    <button
                      key={session.id}
                      type="button"
                      onClick={() => handleSelectSession(session.id)}
                      className={`w-full text-left rounded-lg border p-3 transition-all ${
                        isSelected
                          ? "border-primary/40 bg-primary/10"
                          : "border-border bg-card/50 hover:bg-accent/50"
                      }`}
                    >
                      <p className="text-sm font-medium text-foreground line-clamp-2">
                        {questionCount} Question{questionCount === 1 ? "" : "s"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(session.created_at), "MMM dd, yyyy 'at' HH:mm")}
                      </p>
                    </button>
                  );
                })}
              </div>
            </Card>

            <div className="lg:col-span-2">
              {selectedSession ? (
                <Card className="p-8 rounded-2xl bg-card/80 backdrop-blur-xl border border-border shadow-lg shadow-primary/5">
                  <QuestionsForm
                    questions={selectedSession.questions_json}
                    onSubmit={handleSubmitAnswers}
                    isSubmitting={isSubmitting}
                  />
                </Card>
              ) : (
                <Card className="p-8 rounded-2xl bg-card/80 backdrop-blur-xl border border-border text-center">
                  <p className="text-sm text-muted-foreground">
                    Select a session to answer its questions.
                  </p>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
