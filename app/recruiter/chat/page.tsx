"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ChatScreen } from "@/features/chat/components/chat-screen";
import { Loader2 } from "lucide-react";

function RecruiterChatContent() {
  const params = useSearchParams();
  const openWith = params.get("openWith") ?? undefined;
  return <ChatScreen openWithUserId={openWith} />;
}

export default function RecruiterChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <RecruiterChatContent />
    </Suspense>
  );
}
