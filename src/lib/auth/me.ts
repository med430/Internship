// Fetches the resolved user (id, email, role from NeonDB) so UI role-gating matches what the backend's RolesGuard enforces.

import "server-only";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export interface ResolvedMe {
  id: string;
  email: string;
  role: "STUDENT" | "RECRUITER" | "ADMIN" | string;
}

async function getAccessToken(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session?.access_token) return session.access_token;

  try {
    const cookieStore = await cookies();
    const interviewToken = cookieStore.get("interview_token")?.value;
    if (interviewToken) return interviewToken;
  } catch {
    // ignore
  }
  return null;
}

export async function getServerMe(): Promise<ResolvedMe | null> {
  const accessToken = await getAccessToken();
  if (!accessToken) return null;

  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    method: "GET",
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
  });
  if (!response.ok) return null;
  return (await response.json()) as ResolvedMe;
}
