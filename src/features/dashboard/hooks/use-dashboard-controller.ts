"use client";

import { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api/auth";
import { getClientApiBaseUrl } from "@/lib/api/client-utils";
import { fetchUserCoverLetters, type CoverLetter } from "@/lib/api/cover-letters";

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
  const [latestLetter, setLatestLetter] = useState<CoverLetter | null>(null);
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

        const [dashboardResponse, lettersResult] = await Promise.allSettled([
          fetchWithAuth(`${getClientApiBaseUrl()}/onboard/dashboard`, { method: "GET" }),
          fetchUserCoverLetters(1, 1),
        ]);

        if (dashboardResponse.status === "fulfilled" && dashboardResponse.value.ok) {
          const payload = (await dashboardResponse.value.json()) as {
            userName: string;
            latestCV: CV | null;
            latestGuide: CareerGuide | null;
          };
          setUserName(payload.userName || "there");
          setLatestCV(payload.latestCV);
          setLatestGuide(payload.latestGuide);
        }

        if (lettersResult.status === "fulfilled" && lettersResult.value.letters.length > 0) {
          setLatestLetter(lettersResult.value.letters[0]);
        }
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
    latestLetter,
    loading,
  };
}
