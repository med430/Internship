"use client";

import { useEffect, useRef } from "react";
import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import type { Message, Conversation } from "@/lib/api/chat/types";
import { cn } from "@/lib/utils";

interface MessageThreadProps {
  conversation: Conversation | null;
  messages: Message[];
  currentUserId: string;
  userMap: Map<string, string>;
  draft: string;
  typingName: string | null;
  loading: boolean;
  onDraftChange: (value: string) => void;
  onSend: () => void;
}

function formatMsgTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function groupMessages(messages: Message[]) {
  const groups: { date: string; messages: Message[] }[] = [];
  for (const msg of messages) {
    const dateLabel = new Date(msg.createdAt).toLocaleDateString([], {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
    const last = groups[groups.length - 1];
    if (last && last.date === dateLabel) {
      last.messages.push(msg);
    } else {
      groups.push({ date: dateLabel, messages: [msg] });
    }
  }
  return groups;
}

export function MessageThread({
  conversation,
  messages,
  currentUserId,
  userMap,
  draft,
  typingName,
  loading,
  onDraftChange,
  onSend,
}: MessageThreadProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingName]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  if (!conversation) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-background text-muted-foreground gap-3">
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
          <Send className="h-7 w-7 opacity-30" />
        </div>
        <p className="text-sm font-body">Select a conversation or start a new one</p>
      </div>
    );
  }

  const groups = groupMessages(messages);

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-background">
      {/* Thread header */}
      <div className="border-b border-border px-5 py-3 shrink-0 bg-card/50 flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
          {(
            userMap.get(
              conversation.participantIds.find((id) => id !== currentUserId) ?? "",
            ) ?? "?"
          ).charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="text-sm font-semibold font-heading text-foreground line-clamp-1">
            {conversation.participantIds
              .filter((id) => id !== currentUserId)
              .map((id) => userMap.get(id) ?? id.slice(0, 8) + "…")
              .join(", ")}
          </p>
          <p className="text-[10px] text-muted-foreground font-label">
            {conversation.participantIds.length} participants
          </p>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4 py-4">
        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className={cn("flex gap-2", i % 2 === 0 ? "justify-start" : "justify-end")}
              >
                <Skeleton
                  className={cn("h-10 rounded-2xl", i % 2 === 0 ? "w-48" : "w-36")}
                />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-sm text-muted-foreground font-body">
            No messages yet. Say hello!
          </div>
        ) : (
          <div className="space-y-6">
            {groups.map((group) => (
              <div key={group.date} className="space-y-2">
                {/* Date divider */}
                <div className="flex items-center gap-3 py-1">
                  <div className="flex-1 h-px bg-border" />
                  <span className="text-[10px] text-muted-foreground font-label shrink-0">
                    {group.date}
                  </span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                {group.messages.map((msg, i) => {
                  const isOwn = msg.senderId === currentUserId;
                  const showName =
                    !isOwn && (i === 0 || group.messages[i - 1]?.senderId !== msg.senderId);

                  return (
                    <div key={msg.id} className={cn("flex", isOwn ? "justify-end" : "justify-start")}>
                      <div className={cn("max-w-[70%]", isOwn ? "items-end" : "items-start")}>
                        {showName && (
                          <p className="text-[10px] text-muted-foreground font-label mb-1 ml-1">
                            {msg.senderName}
                          </p>
                        )}
                        <div
                          className={cn(
                            "px-3.5 py-2 rounded-2xl text-sm font-body break-words",
                            isOwn
                              ? "bg-primary text-primary-foreground rounded-br-sm"
                              : "bg-muted text-foreground rounded-bl-sm",
                          )}
                        >
                          {msg.content}
                        </div>
                        <p
                          className={cn(
                            "text-[10px] text-muted-foreground font-label mt-0.5",
                            isOwn ? "text-right mr-1" : "ml-1",
                          )}
                        >
                          {formatMsgTime(msg.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}

            {/* Typing indicator */}
            {typingName && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-2xl rounded-bl-sm px-4 py-2.5 flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground font-body">{typingName} is typing</span>
                  <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <div className="border-t border-border px-4 py-3 shrink-0 bg-card/30">
        <div className="flex items-end gap-2">
          <Textarea
            value={draft}
            onChange={(e) => onDraftChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message… (Enter to send)"
            className="min-h-[40px] max-h-[120px] resize-none text-sm font-body rounded-xl border-border bg-background"
            rows={1}
          />
          <Button
            size="icon"
            onClick={onSend}
            disabled={!draft.trim()}
            className="h-10 w-10 rounded-xl shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
