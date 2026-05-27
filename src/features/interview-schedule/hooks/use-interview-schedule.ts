"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  fetchMyInterviewSlots,
  respondToInterviewSlot,
  type InterviewSlot,
} from "@/lib/api/interview-slots";

export function useInterviewSchedule() {
  const [slots, setSlots] = useState<InterviewSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Resolve current user id once
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUserId(user?.id ?? null);
    });
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMyInterviewSlots();
      // Already sorted asc by the backend, but sort defensively
      setSlots(
        data.sort(
          (a, b) =>
            new Date(a.startAt).getTime() - new Date(b.startAt).getTime(),
        ),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load interviews");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const respond = useCallback(
    async (
      slotId: string,
      action: "accept" | "decline" | "counter",
      counterPayload?: {
        counterStartAt: string;
        counterEndAt: string;
        counterNotes?: string;
      },
    ) => {
      setRespondingId(slotId);
      try {
        await respondToInterviewSlot(slotId, { action, ...counterPayload });
        await load();
      } finally {
        setRespondingId(null);
      }
    },
    [load],
  );

  return { slots, loading, error, respondingId, currentUserId, respond, refresh: load };
}
