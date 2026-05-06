import type { RefObject } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { ChatMessage, InterviewState } from "../types";

interface InterviewChatProps {
  state: InterviewState;
  messages: ChatMessage[];
  messagesEndRef: RefObject<HTMLDivElement | null>;
}

export function InterviewChat({
  state,
  messages,
  messagesEndRef,
}: InterviewChatProps) {
  return (
    <ScrollArea className="h-96 bg-muted/20">
      <div className="p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm text-muted-foreground">
              {state === "connecting"
                ? "Connecting..."
                : "Waiting for the interview to begin..."}
            </p>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`
                    max-w-[80%] rounded-2xl px-4 py-3 text-sm
                    ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-card border border-border/60"
                    }
                  `}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
    </ScrollArea>
  );
}
