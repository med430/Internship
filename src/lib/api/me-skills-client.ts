// Per-row skill CRUD for the current student. Backed by /me/skills, dispatches the same handlers the legacy controller uses.

import { fetchWithAuth } from "@/lib/api/auth";
import type { MyProfileSkill } from "./me-profile-client";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export async function addMySkill(input: {
  skillId: number;
  level: MyProfileSkill["level"];
}): Promise<void> {
  const response = await fetchWithAuth(`${API_BASE_URL}/me/skills`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || "Failed to add skill");
  }
}

export async function updateMySkill(
  assignmentId: string,
  level: MyProfileSkill["level"],
): Promise<void> {
  const response = await fetchWithAuth(
    `${API_BASE_URL}/me/skills/${assignmentId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ level }),
    },
  );
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || "Failed to update skill");
  }
}

export async function removeMySkill(assignmentId: string): Promise<void> {
  const response = await fetchWithAuth(
    `${API_BASE_URL}/me/skills/${assignmentId}`,
    { method: "DELETE" },
  );
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || "Failed to remove skill");
  }
}
