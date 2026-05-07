"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { startInterview } from "@/lib/api/interviews";

export function useVirtualInterviewerSetup() {
  const router = useRouter();
  const [isStarting, setIsStarting] = useState(false);

  const handleStartInterview = async () => {
    setIsStarting(true);
    const selectedPersona =
      localStorage.getItem("selectedPersona") || "alex_chen";

    try {
      const interview = await startInterview({
        personaKey: selectedPersona,
      });

      if (interview.audioBase64 && interview.audioMime) {
        sessionStorage.setItem(
          `interview-audio:${interview.interviewId}`,
          JSON.stringify({
            audioBase64: interview.audioBase64,
            audioMime: interview.audioMime,
          }),
        );
      }

      router.push(
        `/services/virtual-interviewer/room?persona=${selectedPersona}&interviewId=${encodeURIComponent(interview.interviewId)}&question=${encodeURIComponent(interview.questionText)}`,
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to start interview. Please try again.",
      );
      setIsStarting(false);
    }
  };

  return {
    isStarting,
    handleStartInterview,
  };
}
