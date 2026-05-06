"use server";

import type { ActionResult } from "./types";
import { getAuthenticatedContext } from "./auth";
import { validatePasswordPolicy } from "./validators";
import { patchServerProfile } from "@/lib/profile/backend";

export async function updateEmail(
  newEmail: string,
  password: string,
): Promise<ActionResult> {
  const { supabase, user } = await getAuthenticatedContext();

  if (!user) {
    return { success: false, error: "User not authenticated" };
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password,
  });

  if (signInError) {
    return { success: false, error: "Invalid password" };
  }

  const { error } = await supabase.auth.updateUser({
    email: newEmail,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  const profileResult = await patchServerProfile({ email: newEmail });
  if (!profileResult.success) {
    console.error("Error updating onboarding profile email:", profileResult.error);
  }

  try {
    await supabase.auth.signOut({ scope: "global" });
  } catch {
    console.error("Error during sign out after email update");
  }

  return {
    success: true,
    message: "Check both emails for confirmation",
  };
}

export async function updatePassword(
  currentPassword: string,
  newPassword: string,
): Promise<ActionResult> {
  const { supabase, user } = await getAuthenticatedContext();

  if (!user) {
    return { success: false, error: "User not authenticated" };
  }

  const passwordPolicyError = validatePasswordPolicy(newPassword);
  if (passwordPolicyError) {
    return {
      success: false,
      error: passwordPolicyError,
    };
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password: currentPassword,
  });

  if (signInError) {
    return { success: false, error: "Current password is incorrect" };
  }

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  try {
    await supabase.auth.signOut({ scope: "global" });
  } catch {}

  return {
    success: true,
    message: "Password updated successfully",
  };
}
