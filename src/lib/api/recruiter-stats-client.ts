import { getClientApiBaseUrl } from "@/lib/api/client-utils";

export interface RecruiterStats {
  activeOffers: number;
  totalApplications: number;
  applicationsThisWeek: number;
  responseRate: number;
  acceptedApplications: number;
  rejectedApplications: number;
  pendingApplications: number;
}

export interface OfferAnalyticsItem {
  offerId: string;
  title: string;
  type: string;
  viewCount: number;
  impressionCount: number;
  applicationCount: number;
  acceptedCount: number;
  rejectedCount: number;
  pendingCount: number;
  createdAt: string;
}

async function getToken(): Promise<string | null> {
  try {
    const res = await fetch("/auth/session", { credentials: "include", cache: "no-store" });
    if (!res.ok) return null;
    const { accessToken } = (await res.json()) as { accessToken?: string };
    return accessToken ?? null;
  } catch {
    return null;
  }
}

async function recruiterGet<T>(path: string): Promise<T> {
  const token = await getToken();
  if (!token) throw new Error("Not authenticated");
  const apiBase = getClientApiBaseUrl();
  const res = await fetch(`${apiBase}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Failed to fetch ${path}`);
  }
  return res.json() as Promise<T>;
}

export function fetchRecruiterStats(): Promise<RecruiterStats> {
  return recruiterGet<RecruiterStats>("/recruiter/stats");
}

export function fetchOfferAnalytics(): Promise<OfferAnalyticsItem[]> {
  return recruiterGet<OfferAnalyticsItem[]>("/recruiter/offer-analytics");
}
