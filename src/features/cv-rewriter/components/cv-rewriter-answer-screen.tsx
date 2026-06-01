"use client";

import Link from "next/link";
import { format } from "date-fns";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CVRewriterNav } from "@/components/cv-rewriter/cv-rewriter-nav";
import { QuestionsForm } from "@/components/cv-rewriter/questions-form";
import { PDFViewer } from "@/components/cv-rewriter/pdf-viewer";
import { useCVRewriterAnswerController } from "../hooks/use-cv-rewriter-answer-controller";
import {
  ArrowLeft,
  ExternalLink,
  Download,
  Sparkles,
  CheckCircle2,
  FileText,
  Clock,
  ChevronRight,
  TrendingUp,
} from "lucide-react";

function SessionListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="p-4 rounded-xl border border-border bg-card/50 animate-pulse">
          <Skeleton className="h-4 w-2/3 mb-2" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      ))}
    </div>
  );
}

function EmptySessionsState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
        <FileText className="w-8 h-8 text-primary/60" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">No open sessions</h3>
      <p className="text-sm text-muted-foreground max-w-xs">
        Generate a new CV question set from the Generate tab to get started.
      </p>
    </div>
  );
}

function ImprovementCard({ text, index }: { text: string; index: number }) {
  const colors = [
    "from-violet-500/10 to-purple-500/5 border-violet-200/30",
    "from-blue-500/10 to-cyan-500/5 border-blue-200/30",
    "from-emerald-500/10 to-teal-500/5 border-emerald-200/30",
    "from-amber-500/10 to-orange-500/5 border-amber-200/30",
    "from-rose-500/10 to-pink-500/5 border-rose-200/30",
  ];
  const iconColors = [
    "text-violet-500",
    "text-blue-500",
    "text-emerald-500",
    "text-amber-500",
    "text-rose-500",
  ];
  const color = colors[index % colors.length];
  const iconColor = iconColors[index % iconColors.length];

  return (
    <div
      className={`flex gap-3 p-4 rounded-xl border bg-gradient-to-br ${color} transition-all duration-200 hover:scale-[1.01]`}
    >
      <CheckCircle2 className={`w-4 h-4 mt-0.5 shrink-0 ${iconColor}`} />
      <p className="text-sm text-foreground/90 leading-relaxed">{text}</p>
    </div>
  );
}

function ScoreBadge({ score, label }: { score: number; label: string }) {
  const color =
    score >= 85
      ? "text-emerald-600 bg-emerald-50 border-emerald-200/60"
      : score >= 70
      ? "text-blue-600 bg-blue-50 border-blue-200/60"
      : "text-amber-600 bg-amber-50 border-amber-200/60";

  return (
    <div className={`flex flex-col items-center px-4 py-3 rounded-xl border ${color}`}>
      <span className="text-2xl font-bold tabular-nums">{score}</span>
      <span className="text-xs font-medium opacity-80 mt-0.5">{label}</span>
    </div>
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
    result,
    loadSessions,
    handleSelectSession,
    handleSubmitAnswers,
    handleViewInDatabase,
    handleReset,
  } = useCVRewriterAnswerController();

  // ── Result screen ─────────────────────────────────────────────────────────
  if (result) {
    const handleDownload = () => {
      const a = document.createElement("a");
      a.href = result.pdfUrl;
      a.download = result.pdfFilename;
      a.click();
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
        <div className="container mx-auto max-w-7xl px-6 py-10 space-y-6">
          <CVRewriterNav />

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">
                  Your Enhanced CV is Ready
                </h1>
                <p className="text-xs text-muted-foreground mt-0.5">
                  AI-tailored based on your answers
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="text-xs gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Answer Another
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="text-xs gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                Download PDF
              </Button>
              <Button
                size="sm"
                onClick={handleViewInDatabase}
                className="text-xs gap-1.5"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                View in History
              </Button>
            </div>
          </div>

          {/* Main content */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* PDF viewer – wider */}
            <div className="lg:col-span-3">
              <PDFViewer pdfUrl={result.pdfUrl} filename={result.pdfFilename} />
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-2 flex flex-col gap-4">
              {/* Improvements */}
              <Card className="p-5 rounded-2xl bg-card/80 backdrop-blur-xl border border-border">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <h2 className="text-sm font-semibold text-foreground">
                    What Was Improved
                  </h2>
                  <span className="ml-auto text-xs text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full">
                    {result.improvements.length} changes
                  </span>
                </div>
                <div className="space-y-2">
                  {result.improvements.length > 0 ? (
                    result.improvements.map((item, i) => (
                      <ImprovementCard key={i} text={item} index={i} />
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No improvement notes available.
                    </p>
                  )}
                </div>
              </Card>

              {/* CTA */}
              <Card className="p-5 rounded-2xl bg-gradient-to-br from-primary/8 to-primary/3 border border-primary/15">
                <p className="text-sm font-medium text-foreground mb-1">
                  Keep improving
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  Generate a new session with a different job description to
                  keep refining your CV.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReset}
                  className="w-full text-xs gap-1.5"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                  Start Another Session
                </Button>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── In-progress screen ────────────────────────────────────────────────────
  if (isRewriteInProgress) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
            <Sparkles className="w-8 h-8 text-primary animate-pulse" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Rewriting your CV…</h2>
          <p className="text-sm text-muted-foreground">This takes a few seconds.</p>
        </div>
      </div>
    );
  }

  // ── Main answer screen ────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="container mx-auto max-w-7xl px-6 py-10">
        <CVRewriterNav />

        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Answer Your Questions
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Pick a session and submit your answers to generate your enhanced CV.
          </p>
        </div>

        {error && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200/50 bg-red-50/60 backdrop-blur p-4 text-sm text-red-600 dark:border-red-800/40 dark:bg-red-900/20 dark:text-red-400">
            <span className="shrink-0 mt-0.5">⚠</span>
            <span>{error}</span>
          </div>
        )}

        {isLoadingSessions ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <SessionListSkeleton />
            <div className="lg:col-span-2">
              <Skeleton className="h-96 rounded-2xl" />
            </div>
          </div>
        ) : sessions.length === 0 ? (
          <EmptySessionsState />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Session list */}
            <div className="lg:sticky lg:top-24 h-fit">
              <Card className="p-4 rounded-2xl bg-card/80 backdrop-blur-xl border border-border">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-semibold text-foreground">
                    Open Sessions
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => void loadSessions()}
                    disabled={isSubmitting}
                    className="text-xs h-7 px-2"
                  >
                    Refresh
                  </Button>
                </div>

                <div className="space-y-1.5 max-h-[520px] overflow-y-auto pr-0.5">
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
                        className={`w-full text-left rounded-xl border px-3 py-3 transition-all duration-150 ${
                          isSelected
                            ? "border-primary/40 bg-primary/8 shadow-sm"
                            : "border-border bg-card/40 hover:bg-accent/40 hover:border-border/80"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                              isSelected
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {questionCount}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-foreground truncate">
                              {questionCount} Question{questionCount === 1 ? "" : "s"}
                            </p>
                            <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Clock className="w-3 h-3" />
                              {format(
                                new Date(session.created_at),
                                "MMM dd, HH:mm",
                              )}
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </Card>
            </div>

            {/* Questions form */}
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
                <Card className="p-10 rounded-2xl bg-card/60 border border-dashed border-border text-center">
                  <FileText className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Select a session from the left to answer its questions.
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