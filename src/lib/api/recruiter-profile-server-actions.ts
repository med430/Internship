"use server";

import { createClient } from "@/utils/supabase/server";

export type UploadAvatarResult =
  | { success: true; url: string }
  | { success: false; error: string };

export async function uploadRecruiterAvatar(
  formData: FormData,
): Promise<UploadAvatarResult> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "User not authenticated" };

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) return { success: false, error: "No session" };

  const file = formData.get("avatar") as File | null;
  if (!file || !file.size) return { success: false, error: "No file provided" };
  if (!file.type.startsWith("image/")) return { success: false, error: "Please select an image file" };
  if (file.size > 5 * 1024 * 1024) return { success: false, error: "File size must be less than 5MB" };

  const ext = file.name.split(".").pop();
  const filePath = `${user.id}/avatar.${ext}`;

  // Remove old avatar first, then upload new one
  await supabase.storage.from("avatars").remove([filePath]);

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(filePath, file, { upsert: true, contentType: file.type });

  if (uploadError) return { success: false, error: uploadError.message };

  const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(filePath);

  // Persist to backend
  const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  const patchRes = await fetch(`${apiBase}/me`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ avatarUrl: publicUrl }),
    cache: "no-store",
  });

  if (!patchRes.ok) {
    const text = await patchRes.text().catch(() => "");
    return { success: false, error: text || "Failed to update avatar on backend" };
  }

  return { success: true, url: publicUrl };
}
