"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, Check, Loader2, Users } from "lucide-react";
import { useChatController } from "../hooks/use-chat-controller";
import { ConversationList } from "./conversation-list";
import { MessageThread } from "./message-thread";
import { fetchChatUsers, type ChatUser } from "@/lib/api/chat";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

// ── User picker dialog ──────────────────────────────────────────────────────

interface UserPickerDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onConfirm: (ids: string[]) => void;
  creating: boolean;
  error: string;
}

function UserPickerDialog({ open, onOpenChange, onConfirm, creating, error }: UserPickerDialogProps) {
  const [users, setUsers] = useState<ChatUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!open) return;
    setSearch("");
    setSelected(new Set());
    setLoading(true);
    fetchChatUsers()
      .then(setUsers)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [open]);

  const toggle = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }, []);

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">New Conversation</DialogTitle>
          <DialogDescription className="font-body text-sm">
            Select the people you want to message.
          </DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or email…"
            className="pl-9 font-body"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* User list */}
        <ScrollArea className="h-64 rounded-xl border border-border">
          {loading ? (
            <div className="flex items-center justify-center h-full py-10 gap-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm font-body">Loading users…</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-10 gap-2 text-muted-foreground">
              <Users className="h-8 w-8 opacity-30" />
              <span className="text-sm font-body">No users found</span>
            </div>
          ) : (
            <div className="p-1.5 space-y-0.5">
              {filtered.map((u) => {
                const isSelected = selected.has(u.id);
                return (
                  <button
                    key={u.id}
                    onClick={() => toggle(u.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-100",
                      isSelected
                        ? "bg-primary/10"
                        : "hover:bg-muted/70",
                    )}
                  >
                    {/* Avatar */}
                    <div
                      className={cn(
                        "h-9 w-9 rounded-full flex items-center justify-center shrink-0 text-sm font-semibold",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground",
                      )}
                    >
                      {u.name.charAt(0).toUpperCase()}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium font-heading truncate">{u.name}</p>
                      <p className="text-xs text-muted-foreground font-body truncate">{u.email}</p>
                    </div>

                    {/* Checkmark */}
                    <div
                      className={cn(
                        "h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                        isSelected
                          ? "border-primary bg-primary"
                          : "border-muted-foreground/30",
                      )}
                    >
                      {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>

        {/* Selected count */}
        {selected.size > 0 && (
          <p className="text-xs text-muted-foreground font-body -mt-1">
            {selected.size} {selected.size === 1 ? "person" : "people"} selected
          </p>
        )}

        {error && <p className="text-xs text-destructive font-body">{error}</p>}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="font-label">
            Cancel
          </Button>
          <Button
            onClick={() => onConfirm(Array.from(selected))}
            disabled={creating || selected.size === 0}
            className="font-label"
          >
            {creating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Start Chat
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Root ────────────────────────────────────────────────────────────────────

export function ChatScreen() {
  const {
    conversations,
    userMap,
    selectedId,
    setSelectedId,
    messages,
    draft,
    handleDraftChange,
    handleSend,
    loadingConvs,
    loadingMsgs,
    typingName,
    currentUserId,
    newConvOpen,
    setNewConvOpen,
    newConvError,
    creating,
    handleCreateConversationWithIds,
  } = useChatController();

  const selectedConversation = conversations.find((c) => c.id === selectedId) ?? null;

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      {/* Sidebar */}
      <div className="w-72 shrink-0 flex flex-col">
        <ConversationList
          conversations={conversations}
          selectedId={selectedId}
          currentUserId={currentUserId}
          userMap={userMap}
          loading={loadingConvs}
          onSelect={setSelectedId}
          onNewChat={() => setNewConvOpen(true)}
        />
      </div>

      {/* Thread */}
      <MessageThread
        conversation={selectedConversation}
        messages={messages}
        currentUserId={currentUserId}
        userMap={userMap}
        draft={draft}
        typingName={typingName}
        loading={loadingMsgs}
        onDraftChange={handleDraftChange}
        onSend={handleSend}
      />

      <UserPickerDialog
        open={newConvOpen}
        onOpenChange={setNewConvOpen}
        onConfirm={handleCreateConversationWithIds}
        creating={creating}
        error={newConvError}
      />
    </div>
  );
}
