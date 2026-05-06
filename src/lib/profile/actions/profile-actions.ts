"use server";

import type { ActionResult, ActionResultWithUrl, ProfileUpdate } from "./types";
import { getAuthenticatedContext } from "./auth";
import { validateAvatarFile } from "./validators";
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

export async function uploadAvatar(formData: FormData): Promise<ActionResultWithUrl> {
  const { supabase, user } = await getAuthenticatedContext();

  if (!user) {
    return { success: false, error: "User not authenticated" };
  }

  const file = formData.get("avatar") as File | null;
  const validationError = validateAvatarFile(file);
  if (validationError) {
    return { success: false, error: validationError };
  }

  const fileExt = file!.name.split(".").pop();
  const filePath = `${user.id}/avatar.${fileExt}`;

  await supabase.storage.from("avatars").remove([filePath]);

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(filePath, file!, {
      upsert: true,
      contentType: file!.type,
    });

  if (uploadError) {
    return { success: false, error: uploadError.message };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(filePath);

  const updateResult = await patchServerProfile({
    avatar_url: publicUrl,
  });

  if (!updateResult.success) {
    return { success: false, error: updateResult.error };
  }

  return {
    success: true,
    message: "Avatar uploaded successfully",
    url: publicUrl,
  };
}
