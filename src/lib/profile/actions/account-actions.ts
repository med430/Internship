"use server";

import type { ActionResult } from "./types";
import { getAuthenticatedContext } from "./auth";
import { getServerProfile, patchServerProfile } from "@/lib/profile/backend";

export async function deactivateAccount(
  confirmationText: string,
): Promise<ActionResult> {
  const { supabase, user } = await getAuthenticatedContext();

  if (!user) {
    return { success: false, error: "User not authenticated" };
  }

  if (confirmationText !== "DELETE MY ACCOUNT") {
    return { success: false, error: "Confirmation text does not match" };
  }

  const result = await patchServerProfile({
      is_deactivated: true,
      deactivated_at: new Date().toISOString(),
    });

  if (!result.success) {
    return { success: false, error: result.error };
  }

  await supabase.auth.signOut();

  return {
    success: true,
    message:
      "Account deactivated. You have 30 days to log back in and reactivate before permanent deletion.",
  };
}

export async function reactivateAccount(): Promise<ActionResult> {
  const { user } = await getAuthenticatedContext();

  if (!user) {
    return { success: false, error: "User not authenticated" };
  }

  const profile = await getServerProfile();

  if (!profile?.is_deactivated) {
    return { success: false, error: "Account is not deactivated" };
  }

  const result = await patchServerProfile({
      is_deactivated: false,
      deactivated_at: null,
    });

  if (!result.success) {
    return { success: false, error: result.error };
  }

  return { success: true, message: "Account reactivated successfully" };
}
