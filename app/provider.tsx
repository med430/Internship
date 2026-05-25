"use client";

import { ThemeProvider } from "@/components/theme-provider";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/query-client";
import { ReactNode, useEffect } from "react";
import { useAsyncJobsStore } from "@/lib/stores/async-jobs-store";
import { useSseNotifications } from "@/hooks/use-sse-notifications";

function NotificationsBootstrap() {
  useSseNotifications();
  return null;
}

function AsyncJobsBootstrap() {
  const startStream = useAsyncJobsStore((state) => state.startStream);
  const stopStream = useAsyncJobsStore((state) => state.stopStream);

  useEffect(() => {
    const resumeRealtimeSync = () => {
      void startStream();
    };

    const onVisibilityChange = () => {
      if (document.visibilityState !== "visible") {
        return;
      }
      resumeRealtimeSync();
    };

    void startStream();

    window.addEventListener("online", resumeRealtimeSync);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.removeEventListener("online", resumeRealtimeSync);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      stopStream();
    };
  }, [startStream, stopStream]);

  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AsyncJobsBootstrap />
      <NotificationsBootstrap />
      <ThemeProvider
        attribute="class"
        defaultTheme="system"
        enableSystem
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
}
