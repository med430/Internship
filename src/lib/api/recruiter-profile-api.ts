import { getClientApiBaseUrl } from "@/lib/api/client-utils";

export type RecruiterProfileData = {
  id: string;
  company: string;
  companyDescription: string | null;
  website: string | null;
  user: {
    id: string;
    name: string;
    lastname: string;
    username: string;
    email: string;
    phone: string | null;
    avatarUrl: string | null;
  };
};

async function getSupabaseToken(): Promise<string | null> {
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

export async function updateRecruiterProfile(payload: {
  name?: string;
  lastname?: string;
  username?: string;
  phone?: string;
  avatarUrl?: string;
  company?: string;
  companyDescription?: string;
  website?: string;
}): Promise<void> {
  const token = await getSupabaseToken();
  if (!token) throw new Error("Not authenticated");
  const res = await fetch(`${getClientApiBaseUrl()}/me`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || "Failed to update profile");
  }
}

export async function deleteMyAccount(): Promise<void> {
  const token = await getSupabaseToken();
  if (!token) throw new Error("Not authenticated");
  const res = await fetch(`${getClientApiBaseUrl()}/me`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || "Failed to delete account");
  }
}