"use server";

import { createClient } from "@/utils/supabase/server";
import { API_BASE_URL } from "@/lib/constants";

type Role = "STUDENT" | "RECRUITER" | "ADMIN";

export async function updateUserRole(
  userId: string,
  role: Role,
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    return { success: false, error: "Not authenticated" };
  }

  const res = await fetch(`${API_BASE_URL}/admin/users/${userId}/role`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ role }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.status.toString());
    return { success: false, error: text };
  }

  return { success: true };
}
