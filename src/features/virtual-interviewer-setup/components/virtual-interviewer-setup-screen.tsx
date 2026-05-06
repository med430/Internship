"use client";

import { InterviewNav } from "@/components/virtual-interviewer/interview-nav";
import { useVirtualInterviewerSetup } from "../hooks/use-virtual-interviewer-setup";
import { SetupCard } from "./setup-card";
import { SetupHero } from "./setup-hero";

export function VirtualInterviewerSetupScreen() {
  const { isStarting, handleStartInterview } = useVirtualInterviewerSetup();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background px-6 py-10">
      <div className="container mx-auto max-w-5xl">
        <InterviewNav />
        <SetupHero />
        <SetupCard
          isStarting={isStarting}
          onStartInterview={handleStartInterview}
        />
      </div>
    </div>
  );
}
