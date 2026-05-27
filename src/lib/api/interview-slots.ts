import { getClientApiBaseUrl } from "@/lib/api/client-utils";

export type InterviewSlotStatus = "PROPOSED" | "ACCEPTED" | "DECLINED" | "CONFIRMED";

export type InterviewSlot = {
  id: string;
  applicationId: string;
  proposedByUserId: string;
  startAt: string;
  endAt: string;
  status: InterviewSlotStatus;
  notes: string | null;
  parentSlotId: string | null;
  createdAt: string;
  updatedAt: string;
  // enriched by the include in the repo query:
  offerTitle?: string;
  company?: string;
  studentName?: string;
  studentEmail?: string;
};

async function getToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  try {
    const res = await fetch("/auth/session", { credentials: "include", cache: "no-store" });
    if (!res.ok) return null;
    const { accessToken } = (await res.json()) as { accessToken?: string };
    return accessToken ?? null;
  } catch {
    return null;
  }
}

async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = await getToken();
  if (!token) throw new Error("Not authenticated");
  return fetch(`${getClientApiBaseUrl()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });
}

export async function fetchMyInterviewSlots(): Promise<InterviewSlot[]> {
  const res = await apiFetch("/interview-slots/mine");
  if (!res.ok) throw new Error(await res.text().catch(() => "Failed to load slots"));
  return res.json() as Promise<InterviewSlot[]>;
}

export async function proposeInterviewSlot(payload: {
  applicationId: string;
  startAt: string;
  endAt: string;
  notes?: string;
  parentSlotId?: string;
}): Promise<InterviewSlot> {
  const res = await apiFetch("/interview-slots", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text().catch(() => "Failed to propose slot"));
  return res.json() as Promise<InterviewSlot>;
}

export async function respondToInterviewSlot(
  slotId: string,
  payload: {
    action: "accept" | "decline" | "counter";
    counterStartAt?: string;
    counterEndAt?: string;
    counterNotes?: string;
  }
): Promise<InterviewSlot> {
  const res = await apiFetch(`/interview-slots/${slotId}/respond`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(await res.text().catch(() => "Failed to respond to slot"));
  return res.json() as Promise<InterviewSlot>;
}
