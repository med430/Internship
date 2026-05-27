"use server";

import type { ActionResult, ProfileUpdate } from "./types";
import { getAuthenticatedContext } from "./auth";
import { patchServerProfile } from "@/lib/profile/backend";

export async function updateProfile(
  updates: ProfileUpdate,
  markAsCompleted = false,
): Promise<ActionResult> {
  const { user } = await getAuthenticatedContext();

  if (!user) {
    return { success: false, error: "User not authenticated" };
  }

  const result = await patchServerProfile({
    email: user.email,
    ...updates,
    ...(markAsCompleted ? { profile_completed: true } : {}),
  });

  if (!result.success) {
    return { success: false, error: result.error };
  }

  return { success: true, message: "Profile updated successfully" };
}
