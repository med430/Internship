"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { InterviewRoomScreen } from "@/features/interview-room/components/interview-room-screen";
import { Loader2 } from "lucide-react";

function InterviewRoomContent() {
  const params = useSearchParams();
  const slotId = params.get("slot") ?? "";

  if (!slotId) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <p className="text-sm text-muted-foreground font-body">
          No interview slot specified.
        </p>
      </div>
    );
  }

  return <InterviewRoomScreen slotId={slotId} />;
}

export default function RecruiterInterviewRoomPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <InterviewRoomContent />
    </Suspense>
  );
}
