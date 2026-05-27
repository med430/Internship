"use server";

import { createClient } from "@/utils/supabase/server";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

async function getServerToken(): Promise<string> {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error("Not authenticated");
  }
  return session.access_token;
}

export async function createOffer(body: Record<string, unknown>): Promise<void> {
  const token = await getServerToken();
  const resp = await fetch(`${API_BASE}/offers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new Error(text || "Failed to create offer");
  }
}

export async function updateOffer(offerId: string, body: Record<string, unknown>): Promise<void> {
  const token = await getServerToken();
  const resp = await fetch(`${API_BASE}/offers/${offerId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });
  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new Error(text || "Failed to update offer");
  }
}

export async function deleteOffer(offerId: string): Promise<void> {
  const token = await getServerToken();
  const resp = await fetch(`${API_BASE}/offers/${offerId}/delete`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!resp.ok) {
    throw new Error("Failed to delete offer");
  }
}
