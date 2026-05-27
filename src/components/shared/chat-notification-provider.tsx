"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { toast } from "sonner";
import { MessageSquare } from "lucide-react";
import { io, Socket } from "socket.io-client";
import { createClient } from "@/utils/supabase/client";
import { useNotificationStore } from "@/lib/stores/notification-store";
import type { Message } from "@/lib/api/chat/types";

/**
 * Mounts once in the services layout.
 * Connects to the /chat Socket.IO namespace, registers the current user's ID
 * so the backend can push messages to them via their personal user room,
 * and shows a toast + bell notification whenever a message arrives from
 * someone else (unless the user is already on the chat page).
 */
export function ChatNotificationProvider() {
  const pathname = usePathname();
  const addNotification = useNotificationStore((s) => s.addNotification);
  const currentUserIdRef = useRef<string>("");
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;

  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL ?? "http://localhost:3000";
    const socket: Socket = io(`${wsUrl}/chat`, { transports: ["websocket"] });

    // Resolve the current user and register with the gateway so it can
    // route messages to this socket via the user:<id> room.
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      currentUserIdRef.current = user.id;
      socket.emit("register-user", { userId: user.id });
    });

    socket.on("new-message", (message: Message) => {
      // Ignore own messages
      if (message.senderId === currentUserIdRef.current) return;

      // Suppress visual noise if the user is already on the chat page
      const onChatPage = pathnameRef.current.startsWith("/services/chat");

      const preview =
        message.content.length > 60
          ? message.content.slice(0, 60) + "…"
          : message.content;

      if (!onChatPage) {
        toast(message.senderName, {
          description: preview,
          icon: <MessageSquare className="h-4 w-4 text-primary" />,
          action: {
            label: "Open",
            onClick: () => {
              window.location.href = "/services/chat";
            },
          },
          duration: 5000,
        });
      }

      // Always add to the notification bell
      addNotification({
        id: crypto.randomUUID(),
        title: `New message from ${message.senderName}`,
        message: preview,
        type: "chat",
        link: "/services/chat",
        is_read: false,
        created_at: new Date().toISOString(),
      });
    });

    return () => {
      socket.disconnect();
    };
  }, [addNotification]);

  return null;
}
