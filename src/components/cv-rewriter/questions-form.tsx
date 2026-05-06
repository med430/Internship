"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { CheckCircle2, Edit3, Info, ArrowLeft } from "lucide-react";

export interface Question {
  id: string;
  question: string;
}

export interface QuestionAnswer {
  question: string;
  answer: string;
}

interface QuestionsFormProps {
  questions: Record<string, string>; // { "q1": "question text", ... }
  onSubmit: (answers: QuestionAnswer[]) => void;
  onBackToStart?: () => void;
  isSubmitting?: boolean;
}

export function QuestionsForm({
  questions,
  onSubmit,
  onBackToStart,
  isSubmitting = false,
}: QuestionsFormProps) {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(
    () => new Set(Object.keys(questions)),
  );

  const completedQuestions = useMemo(() => {
    const completed = new Set<string>();

    for (const [key, answer] of Object.entries(answers)) {
      if (selectedQuestions.has(key) && answer.trim().length > 0) {
        completed.add(key);
      }
    }

    return completed;
  }, [answers, selectedQuestions]);

  const handleAnswerChange = (questionKey: string, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionKey]: value,
    }));
  };

  const handleQuestionToggle = (questionKey: string) => {
    setSelectedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionKey)) {
        newSet.delete(questionKey);
      } else {
        newSet.add(questionKey);
      }
      return newSet;
    });
  };

  const handleSubmit = () => {
    // Convert to array of QuestionAnswer objects, only including selected questions
    const questionAnswerArray: QuestionAnswer[] = Object.entries(questions)
      .filter(([key]) => selectedQuestions.has(key))
      .map(([key, questionText]) => ({
        question: questionText,
        answer: answers[key] || "",
      }));
    onSubmit(questionAnswerArray);
  };

  const questionKeys = Object.keys(questions);
  const selectedCount = selectedQuestions.size;
  const answeredQuestions = completedQuestions.size;
  const progressPercentage =
    selectedCount > 0 ? (answeredQuestions / selectedCount) * 100 : 0;
  const allAnswered = answeredQuestions === selectedCount && selectedCount >= 2;
  const meetsMinimum = selectedCount >= 2;

  return (
    <div className="w-full space-y-6">
      {/* Header with progress */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-neutral-900 dark:text-neutral-50">
              Answer the Questions
            </h2>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-0.5 font-light">
              Help us tailor your CV perfectly by answering these questions
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100">
              {answeredQuestions}/{selectedCount}
            </div>
            <p className="text-xs text-neutral-500 dark:text-neutral-500">
              Completed
            </p>
          </div>
        </div>

        {/* Info message */}
        <div
          className={`flex items-start gap-2 p-3 rounded-lg border ${
            meetsMinimum
              ? "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800"
              : "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800"
          }`}
        >
          <Info
            className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
              meetsMinimum
                ? "text-blue-600 dark:text-blue-400"
                : "text-amber-600 dark:text-amber-400"
            }`}
          />
          <div className="text-xs">
            <p
              className={`font-medium ${
                meetsMinimum
                  ? "text-blue-900 dark:text-blue-100"
                  : "text-amber-900 dark:text-amber-100"
              }`}
            >
              {meetsMinimum
                ? `${selectedCount} questions selected`
                : "Minimum 2 questions required"}
            </p>
            <p
              className={`mt-0.5 ${
                meetsMinimum
                  ? "text-blue-700 dark:text-blue-300"
                  : "text-amber-700 dark:text-amber-300"
              }`}
            >
              {meetsMinimum
                ? "You can uncheck questions you prefer not to answer. Only checked questions will be used."
                : "Please select at least 2 questions to answer for better results."}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-800">
          <div
            className="h-full bg-neutral-900 dark:bg-neutral-100 transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-3">
        {questionKeys.map((key, index) => {
          const isCompleted = completedQuestions.has(key);
          const isSelected = selectedQuestions.has(key);
          return (
            <Card
              key={key}
              className={`p-5 rounded-xl backdrop-blur-md border transition-all duration-200 ${
                !isSelected
                  ? "bg-neutral-50/40 dark:bg-neutral-950/40 border-neutral-200/30 dark:border-neutral-800/30 opacity-60"
                  : isCompleted
                    ? "bg-neutral-100/60 dark:bg-neutral-800/60 border-neutral-300/50 dark:border-neutral-700/50"
                    : "bg-white/60 dark:bg-neutral-900/60 border-neutral-200/50 dark:border-neutral-800/50"
              }`}
            >
              <div className="space-y-3">
                {/* Question header */}
                <div className="flex flex-col gap-1.5 sm:flex-row sm:items-start sm:gap-3">
                  <div className="flex items-center gap-2 sm:flex-shrink-0 sm:flex-col sm:items-start sm:gap-1.5 sm:pt-0.5">
                    <Checkbox
                      id={`question-${key}`}
                      checked={isSelected}
                      onCheckedChange={() => handleQuestionToggle(key)}
                      className="cursor-pointer"
                    />
                    {isCompleted ? (
                      <div className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-neutral-900 dark:bg-neutral-100">
                        <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-neutral-50 dark:text-neutral-900" />
                      </div>
                    ) : (
                      <div className="flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full bg-neutral-200 dark:bg-neutral-800">
                        <span className="text-xs font-semibold text-neutral-700 dark:text-neutral-300">
                          {index + 1}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 sm:flex-1">
                    <label
                      htmlFor={`question-${key}`}
                      className={`text-sm font-medium leading-relaxed cursor-pointer ${
                        isSelected
                          ? "text-neutral-900 dark:text-neutral-100"
                          : "text-neutral-500 dark:text-neutral-500"
                      }`}
                    >
                      {questions[key]}
                    </label>
                  </div>
                </div>

                {/* Answer textarea */}
                <div className="pl-0 sm:pl-14">
                  <Textarea
                    placeholder={
                      isSelected
                        ? "Type your answer here..."
                        : "Check the box to answer this question"
                    }
                    value={answers[key] || ""}
                    onChange={(e) => handleAnswerChange(key, e.target.value)}
                    disabled={!isSelected}
                    className={`min-h-[110px] resize-y transition-all duration-200 text-sm ${
                      !isSelected
                        ? "bg-neutral-100/50 dark:bg-neutral-900/50 border-neutral-200/30 dark:border-neutral-800/30 cursor-not-allowed opacity-50"
                        : isCompleted
                          ? "bg-white/70 dark:bg-neutral-900/70 border-neutral-300/50 dark:border-neutral-700/50"
                          : "bg-white/60 dark:bg-neutral-900/60 border-neutral-200/50 dark:border-neutral-800/50"
                    } focus:border-neutral-400 dark:focus:border-neutral-600`}
                  />
                  {answers[key] && isSelected && (
                    <p className="mt-1.5 text-xs text-neutral-500 dark:text-neutral-500 flex items-center gap-1">
                      <Edit3 className="h-3 w-3" />
                      {answers[key].length} characters
                    </p>
                  )}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Action buttons */}
      <div className="flex flex-col-reverse sm:flex-row justify-between items-stretch sm:items-center gap-3 pt-4">
        {onBackToStart && (
          <Button
            onClick={onBackToStart}
            variant="ghost"
            size="lg"
            disabled={isSubmitting}
            className="px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Start
          </Button>
        )}
        <Button
          onClick={handleSubmit}
          disabled={!allAnswered || !meetsMinimum || isSubmitting}
          size="lg"
          className={`px-6 py-2.5 text-sm font-medium rounded-lg shadow-sm transition-all duration-200 cursor-pointer ${onBackToStart ? "" : "mx-auto"} ${
            allAnswered && meetsMinimum
              ? "bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-100 dark:hover:bg-neutral-200 text-neutral-50 dark:text-neutral-900"
              : "bg-neutral-300 dark:bg-neutral-700 text-neutral-500 dark:text-neutral-400 cursor-not-allowed"
          }`}
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
              Generating Your Enhanced CV...
            </>
          ) : allAnswered && meetsMinimum ? (
            "Generate Enhanced CV"
          ) : !meetsMinimum ? (
            `Select At Least 2 Questions (${selectedCount} selected)`
          ) : (
            `Answer Selected Questions (${answeredQuestions}/${selectedCount})`
          )}
        </Button>
      </div>
    </div>
  );
}
