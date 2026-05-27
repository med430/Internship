"use client";

import { MessageSquare, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import type { Conversation } from "@/lib/api/chat/types";
import { cn } from "@/lib/utils";

interface ConversationListProps {
  conversations: Conversation[];
  selectedId: string | null;
  currentUserId: string;
  userMap: Map<string, string>;
  loading: boolean;
  onSelect: (id: string) => void;
  onNewChat: () => void;
}

function formatTime(iso: string | null): string {
  if (!iso) return "";
  const date = new Date(iso);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  if (isToday) return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

function getOtherParticipants(
  conv: Conversation,
  currentUserId: string,
  userMap: Map<string, string>,
): string {
  const others = conv.participantIds.filter((id) => id !== currentUserId);
  if (!others.length) return "Just you";
  return others.map((id) => userMap.get(id) ?? id.slice(0, 8) + "…").join(", ");
}

export function ConversationList({
  conversations,
  selectedId,
  currentUserId,
  userMap,
  loading,
  onSelect,
  onNewChat,
}: ConversationListProps) {
  return (
    <div className="flex flex-col h-full border-r border-border bg-card/50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <span className="font-semibold text-foreground font-heading">Messages</span>
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="h-8 w-8 p-0 rounded-full hover:bg-primary/10"
          onClick={onNewChat}
          title="New conversation"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        {loading ? (
          <div className="p-3 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-2 py-2">
                <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-36" />
                </div>
              </div>
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 px-4 text-center">
            <MessageSquare className="h-10 w-10 text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground font-body">No conversations yet</p>
            <Button variant="link" size="sm" className="mt-1 text-primary" onClick={onNewChat}>
              Start one
            </Button>
          </div>
        ) : (
          <div className="p-2 space-y-0.5">
            {conversations.map((conv) => {
              const isActive = conv.id === selectedId;
              const others = getOtherParticipants(conv, currentUserId, userMap);
              return (
                <button
                  key={conv.id}
                  onClick={() => onSelect(conv.id)}
                  className={cn(
                    "w-full flex items-start gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-150",
                    isActive
                      ? "bg-primary/10 text-foreground"
                      : "hover:bg-muted/60 text-foreground",
                  )}
                >
                  {/* Avatar placeholder */}
                  <div
                    className={cn(
                      "h-10 w-10 rounded-full flex items-center justify-center shrink-0 text-sm font-semibold",
                      isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
                    )}
                  >
                    {others.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-sm font-medium font-heading truncate">{others}</span>
                      <span className="text-[10px] text-muted-foreground shrink-0 font-label">
                        {formatTime(conv.lastMessageAt)}
                      </span>
                    </div>
                    {conv.lastMessagePreview && (
                      <p className="text-xs text-muted-foreground truncate font-body mt-0.5">
                        {conv.lastMessagePreview}
                      </p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  );
}
