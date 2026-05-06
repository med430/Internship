"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api/auth";
import { getClientApiBaseUrl } from "@/lib/api/client-utils";

interface CV {
  id: string;
  job_title: string;
  final_score: number;
  original_score: number;
  created_at: string;
}

interface CareerGuide {
  id: string;
  current_job: string;
  target_job: string | null;
  readiness_score: number;
  domain: string;
  created_at: string;
}

export function useDashboardController() {
  const [userName, setUserName] = useState("");
  const [latestCV, setLatestCV] = useState<CV | null>(null);
  const [latestGuide, setLatestGuide] = useState<CareerGuide | null>(null);
  const [loading, setLoading] = useState(true);

  const greeting = (() => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  })();

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const response = await fetchWithAuth(
          `${getClientApiBaseUrl()}/onboard/dashboard`,
          {
            method: "GET",
          },
        );

        if (!response.ok) {
          throw new Error("Failed to load dashboard");
        }

        const payload = (await response.json()) as {
          userName: string;
          latestCV: CV | null;
          latestGuide: CareerGuide | null;
        };

        setUserName(payload.userName || "there");
        setLatestCV(payload.latestCV);
        setLatestGuide(payload.latestGuide);
      } finally {
        setLoading(false);
      }
    }

    void loadData();
  }, []);

  return {
    userName,
    greeting,
    latestCV,
    latestGuide,
    loading,
  };
}
