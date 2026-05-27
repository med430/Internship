import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import type { Database } from "@/types/database.types";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

async function getAccessToken() {
  const supabase = await createClient();
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (!error && session?.access_token) {
    return session.access_token;
  }

  // Fall back to backend-issued JWT stored in cookie (server-side). cookies() is async in Next 15.
  try {
    const cookieStore = await cookies();
    const interviewToken = cookieStore.get("interview_token")?.value;
    if (interviewToken) return interviewToken;
  } catch {
    // ignore
  }

  return null;
}

async function readResponseError(response: Response) {
  try {
    const payload = (await response.json()) as {
      message?: string | string[];
      error?: string;
    };

    if (Array.isArray(payload.message)) {
      return payload.message.join(", ");
    }

    return payload.message || payload.error || "Request failed";
  } catch {
    return "Request failed";
  }
}

export async function getProfileWithAccessToken(
  accessToken: string,
): Promise<Profile | null> {
  const response = await fetch(`${API_BASE_URL}/onboard/profile`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  return (await response.json()) as Profile;
}

export async function getServerProfile(): Promise<Profile | null> {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    return null;
  }

  return getProfileWithAccessToken(accessToken);
}

export async function patchServerProfile(
  updates: ProfileUpdate,
): Promise<{ success: boolean; error?: string; profile?: Profile }> {
  const accessToken = await getAccessToken();

  if (!accessToken) {
    return { success: false, error: "User not authenticated" };
  }

  const response = await fetch(`${API_BASE_URL}/onboard/profile`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
    cache: "no-store",
  });

  if (!response.ok) {
    return {
      success: false,
      error: await readResponseError(response),
    };
  }

  return {
    success: true,
    profile: (await response.json()) as Profile,
  };
}
