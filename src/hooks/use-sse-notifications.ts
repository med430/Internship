"use client";

import { useEffect } from "react";
import { getAccessToken } from "@/lib/api/auth";
import { getClientApiBaseUrl } from "@/lib/api/client-utils";
import { useNotificationStore } from "@/lib/stores/notification-store";
import type { NotificationRecord } from "@/lib/api/notifications";

export function useSseNotifications() {
  const { addNotification, fetchNotifications } = useNotificationStore();

  // Load persisted history once on mount
  useEffect(() => {
    void fetchNotifications();
  }, [fetchNotifications]);

  // Open SSE stream for real-time delivery
  useEffect(() => {
    let es: EventSource | null = null;
    let cancelled = false;

    async function connect() {
      try {
        const token = await getAccessToken();
        if (cancelled) return;

        const url = `${getClientApiBaseUrl()}/notifications/stream?token=${encodeURIComponent(token)}`;
        es = new EventSource(url);

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
          es?.close();
          es = null;
        };
      } catch {
        // user not authenticated, skip connection
      }
    }

    void connect();

    return () => {
      cancelled = true;
      es?.close();
    };
  }, [addNotification]);
}
