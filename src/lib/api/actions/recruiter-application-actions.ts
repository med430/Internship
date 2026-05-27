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

export async function acceptApplication(applicationId: string): Promise<void> {
  const token = await getServerToken();
  const resp = await fetch(`${API_BASE}/applications/${applicationId}/accept`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new Error(text || "Failed to accept application");
  }
}

export async function rejectApplication(applicationId: string): Promise<void> {
  const token = await getServerToken();
  const resp = await fetch(`${API_BASE}/applications/${applicationId}/reject`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!resp.ok) {
    const text = await resp.text().catch(() => "");
    throw new Error(text || "Failed to reject application");
  }
}