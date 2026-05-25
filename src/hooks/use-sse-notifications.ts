"use client";

import { useEffect } from "react";
import { getAccessToken } from "@/lib/api/auth";
import { getClientApiBaseUrl } from "@/lib/api/client-utils";
import { useNotificationStore } from "@/lib/stores/notification-store";

export function useSseNotifications() {
  const addNotification = useNotificationStore((state) => state.addNotification);

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
              type?: string;
              title?: string;
              message?: string;
              applicationId?: string;
            };
            addNotification({
              id: crypto.randomUUID(),
              title: data.title ?? "Notification",
              message: data.message ?? "",
              type: data.type ?? "info",
              link: data.applicationId ? "/services/dashboard" : undefined,
              is_read: false,
              created_at: new Date().toISOString(),
            });
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