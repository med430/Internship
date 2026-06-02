"use client";

import { InterviewNav } from "@/components/virtual-interviewer/interview-nav";
import { useInterviewDetailController } from "../hooks/use-interview-detail-controller";
import { InterviewDetailError } from "./interview-detail-error";
import { InterviewDetailHeader } from "./interview-detail-header";
import { InterviewDetailLoading } from "./interview-detail-loading";
import { InterviewFacialExpressionCard } from "./interview-facial-expression-card";
import { InterviewListCard } from "./interview-list-card";
import { InterviewMetadataCard } from "./interview-metadata-card";
import { InterviewPerformanceCard } from "./interview-performance-card";
import { InterviewPersonalizedMilestonesCard } from "./interview-personalized-milestones-card";

interface InterviewDetailScreenProps {
  interviewId: string;
}

export function InterviewDetailScreen({
  interviewId,
}: InterviewDetailScreenProps) {
  const {
    interview,
    loading,
    deleting,
    downloading,
    error,
    handleDelete,
    handleDownload,
    backToHistory,
  } = useInterviewDetailController(interviewId);

  if (loading) {
    return <InterviewDetailLoading />;
  }

  if (error || !interview) {
    return (
      <InterviewDetailError
        error={error || "Interview not found"}
        onBack={backToHistory}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background px-6 py-10">
      <div className="container mx-auto max-w-5xl">
        <InterviewNav />

        <InterviewDetailHeader
          interview={interview}
          deleting={deleting}
          downloading={downloading}
          onBack={backToHistory}
          onDelete={handleDelete}
          onDownload={handleDownload}
        />

        <InterviewMetadataCard interview={interview} />
        <InterviewPerformanceCard interview={interview} />
        <InterviewPersonalizedMilestonesCard interview={interview} />
        <InterviewFacialExpressionCard interview={interview} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InterviewListCard
            title="Key Strengths"
            items={interview.key_strengths}
            bulletClassName="text-[#05e34f] dark:text-[#04c945]"
          />
          <InterviewListCard
            title="Areas for Improvement"
            items={interview.areas_for_improvement}
            bulletClassName="text-orange-500 dark:text-orange-400"
          />
          <InterviewListCard
            title="Recommendations"
            items={interview.recommendations}
            bulletClassName="text-primary"
          />
          <InterviewListCard
            title="Next Steps"
            items={interview.next_steps}
            bulletClassName="text-accent"
          />
        </div>
      </div>
    </div>
  );
}
