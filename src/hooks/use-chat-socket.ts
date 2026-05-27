"use client";

import { useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import type { Message } from "@/lib/api/chat/types";

interface UseChatSocketOptions {
  onNewMessage?: (message: Message) => void;
  onUserTyping?: (senderId: string, senderName: string) => void;
  onMessagesRead?: (conversationId: string, userId: string) => void;
}

export function useChatSocket(options: UseChatSocketOptions = {}) {
  const socketRef = useRef<Socket | null>(null);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL ?? "http://localhost:3000";
    const socket = io(`${wsUrl}/chat`, { transports: ["websocket"] });
    socketRef.current = socket;

    socket.on("new-message", (message: Message) => {
      optionsRef.current.onNewMessage?.(message);
    });

    socket.on("user-typing", ({ senderId, senderName }: { senderId: string; senderName: string }) => {
      optionsRef.current.onUserTyping?.(senderId, senderName);
    });

    socket.on("messages-read", ({ conversationId, userId }: { conversationId: string; userId: string }) => {
      optionsRef.current.onMessagesRead?.(conversationId, userId);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const joinConversation = useCallback((conversationId: string) => {
    socketRef.current?.emit("join-conversation", { conversationId });
  }, []);

  const leaveConversation = useCallback((conversationId: string) => {
    socketRef.current?.emit("leave-conversation", { conversationId });
  }, []);

  const sendMessage = useCallback(
    (conversationId: string, content: string, senderId: string, senderName: string) => {
      socketRef.current?.emit("send-message", {
        conversationId,
        content,
        senderId,
        senderName,
      });
    },
    [],
  );

  const emitTyping = useCallback(
    (conversationId: string, senderId: string, senderName: string) => {
      socketRef.current?.emit("typing", { conversationId, senderId, senderName });
    },
    [],
  );

  const markRead = useCallback((conversationId: string, userId: string) => {
    socketRef.current?.emit("mark-read", { conversationId, userId });
  }, []);

  return { joinConversation, leaveConversation, sendMessage, emitTyping, markRead };
}
