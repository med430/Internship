"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  fetchConversations,
  fetchMessages,
  createConversation,
  fetchChatUsers,
  type Conversation,
  type Message,
} from "@/lib/api/chat";
import { useChatSocket } from "@/hooks/use-chat-socket";

export function useChatController(openWithUserId?: string) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [userMap, setUserMap] = useState<Map<string, string>>(new Map());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [typingName, setTypingName] = useState<string | null>(null);
  const [newConvOpen, setNewConvOpen] = useState(false);
  const [newConvError, setNewConvError] = useState("");
  const [creating, setCreating] = useState(false);

  const currentUserId = useRef<string>("");
  const currentUserName = useRef<string>("");
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevSelectedId = useRef<string | null>(null);

  // Resolve current user once
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      currentUserId.current = user.id;
      currentUserName.current =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split("@")[0] ||
        "Me";
    });
  }, []);

  // Load conversation list + user directory in parallel
  useEffect(() => {
    setLoadingConvs(true);
    Promise.allSettled([fetchConversations(), fetchChatUsers()]).then(
      ([convsResult, usersResult]) => {
        if (convsResult.status === "fulfilled") setConversations(convsResult.value);
        if (usersResult.status === "fulfilled") {
          const map = new Map<string, string>();
          for (const u of usersResult.value) map.set(u.id, u.name);
          setUserMap(map);
        }
        setLoadingConvs(false);
      },
    );
  }, []);

  // Socket callbacks
  const handleNewMessage = useCallback((msg: Message) => {
    // Append to thread if it belongs to the open conversation
    setMessages((prev) => {
      if (prev.length > 0 && prev[0].conversationId !== msg.conversationId) return prev;
      // Deduplicate (HTTP send + WS broadcast can both arrive)
      if (prev.some((m) => m.id === msg.id)) return prev;
      return [...prev, msg];
    });
    // Update conversation preview
    setConversations((prev) =>
      prev.map((c) =>
        c.id === msg.conversationId
          ? { ...c, lastMessagePreview: msg.content, lastMessageAt: msg.createdAt }
          : c,
      ),
    );
  }, []);

  const handleUserTyping = useCallback(
    (senderId: string, senderName: string) => {
      if (senderId === currentUserId.current) return;
      setTypingName(senderName);
      if (typingTimer.current) clearTimeout(typingTimer.current);
      typingTimer.current = setTimeout(() => setTypingName(null), 2500);
    },
    [],
  );

  const { joinConversation, leaveConversation, sendMessage, emitTyping, markRead } =
    useChatSocket({
      onNewMessage: handleNewMessage,
      onUserTyping: handleUserTyping,
    });

  // Switch conversation
  useEffect(() => {
    if (prevSelectedId.current) leaveConversation(prevSelectedId.current);
    prevSelectedId.current = selectedId;

    if (!selectedId) {
      setMessages([]);
      return;
    }

    joinConversation(selectedId);
    setLoadingMsgs(true);
    fetchMessages(selectedId)
      .then(setMessages)
      .catch(console.error)
      .finally(() => setLoadingMsgs(false));

    if (currentUserId.current) markRead(selectedId, currentUserId.current);
  }, [selectedId, joinConversation, leaveConversation, markRead]);

  // Send message via WebSocket
  const handleSend = useCallback(() => {
    const text = draft.trim();
    if (!text || !selectedId) return;
    sendMessage(selectedId, text, currentUserId.current, currentUserName.current);
    setDraft("");
  }, [draft, selectedId, sendMessage]);

  // Typing indicator emit
  const handleDraftChange = useCallback(
    (value: string) => {
      setDraft(value);
      if (selectedId)
        emitTyping(selectedId, currentUserId.current, currentUserName.current);
    },
    [selectedId, emitTyping],
  );

  // Auto-open or create a conversation when openWithUserId is provided
  useEffect(() => {
    if (!openWithUserId || loadingConvs) return;

    // Check if a 1-to-1 conversation already exists with that user
    const existing = conversations.find(
      (c) =>
        c.participantIds.length === 2 &&
        c.participantIds.includes(openWithUserId),
    );

    if (existing) {
      setSelectedId(existing.id);
    } else {
      // Create it automatically
      createConversation([openWithUserId])
        .then((conv) => {
          setConversations((prev) => [conv, ...prev.filter((c) => c.id !== conv.id)]);
          setSelectedId(conv.id);
        })
        .catch(console.error);
    }
  // Only run once after conversations finish loading
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingConvs]);

  // Create new conversation from the user-picker dialog
  const handleCreateConversationWithIds = useCallback(async (ids: string[]) => {
    if (!ids.length) {
      setNewConvError("Select at least one person");
      return;
    }
    setCreating(true);
    setNewConvError("");
    try {
      const conv = await createConversation(ids);
      setConversations((prev) => [conv, ...prev.filter((c) => c.id !== conv.id)]);
      setSelectedId(conv.id);
      setNewConvOpen(false);
    } catch (e) {
      setNewConvError(e instanceof Error ? e.message : "Failed to create conversation");
    } finally {
      setCreating(false);
    }
  }, []);

  return {
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
    currentUserId: currentUserId.current,
    newConvOpen,
    setNewConvOpen,
    newConvError,
    creating,
    handleCreateConversationWithIds,
  };
}
