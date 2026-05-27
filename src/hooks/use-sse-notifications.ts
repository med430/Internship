"use client";

import { useEffect, useRef } from "react";
import { getAccessToken } from "@/lib/api/auth";
import { getClientApiBaseUrl } from "@/lib/api/client-utils";
import { useNotificationStore } from "@/lib/stores/notification-store";
import type { NotificationRecord } from "@/lib/api/notifications";

const RECONNECT_DELAY_MS = 5_000;

export function useSseNotifications() {
  const { addNotification, fetchNotifications } = useNotificationStore();
  const cancelledRef = useRef(false);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const esRef = useRef<EventSource | null>(null);

  // Load persisted history once on mount
  useEffect(() => {
    void fetchNotifications();
  }, [fetchNotifications]);

  // Open SSE stream with automatic reconnect
  useEffect(() => {
    cancelledRef.current = false;

    function clearTimer() {
      if (reconnectTimerRef.current !== null) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
    }

    function scheduleReconnect() {
      clearTimer();
      if (cancelledRef.current) return;
      reconnectTimerRef.current = setTimeout(() => connect(), RECONNECT_DELAY_MS);
    }

    function connect() {
      if (cancelledRef.current) return;

      getAccessToken()
        .then((token) => {
          if (cancelledRef.current) return;

          const url = `${getClientApiBaseUrl()}/notifications/stream?token=${encodeURIComponent(token)}`;
          const es = new EventSource(url);
          esRef.current = es;

          es.onmessage = (event) => {
            try {
              const data = JSON.parse(event.data as string) as {
                id?: string;
                type?: string;
                title?: string;
                message?: string;
                link?: string;
              };

              const notification: NotificationRecord = {
                id: data.id ?? crypto.randomUUID(),
                userId: "",
                type: data.type ?? "info",
                title: data.title ?? "Notification",
                message: data.message ?? "",
                link: data.link ?? null,
                isRead: false,
                createdAt: new Date().toISOString(),
                deletedAt: null,
              };

              addNotification(notification);
            } catch {
              // ignore malformed events
            }
          };

          es.onerror = () => {
            es.close();
            esRef.current = null;
            scheduleReconnect();
          };
        })
        .catch(() => {
          // Not authenticated yet — retry after delay
          scheduleReconnect();
        });
    }

    connect();

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible" && !esRef.current) {
        clearTimer();
        connect();
      }
    };

    const onOnline = () => {
      if (!esRef.current) {
        clearTimer();
        connect();
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("online", onOnline);

    return () => {
      cancelledRef.current = true;
      clearTimer();
      esRef.current?.close();
      esRef.current = null;
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("online", onOnline);
    };
  }, [addNotification]);
}
