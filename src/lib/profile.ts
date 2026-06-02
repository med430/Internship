import type { Database } from "@/types/database.types";
import { calculateProfileCompletion } from "@/lib/profile/completion";
import { getServerMyProfile, getServerProfile, patchServerProfile } from "@/lib/profile/backend";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

export async function getUserProfile(): Promise<Profile | null> {
  return getServerProfile();
}

export async function updateUserProfile(
  updates: ProfileUpdate,
): Promise<{ success: boolean; error?: string }> {
  const result = await patchServerProfile(updates);

  if (!result.success) {
    console.error("Error updating profile:", result.error);
    return { success: false, error: result.error };
  }

  return { success: true };
}

export async function getProfileCompletion(): Promise<number> {
  const myProfile = await getServerMyProfile();
  if (myProfile) {
    return calculateProfileCompletion(myProfile);
  }

  const profile = await getUserProfile();
  return typeof profile?.profile_completion === "number"
    ? profile.profile_completion
    : calculateProfileCompletion(profile);
}

export async function hasActiveSubscription(): Promise<boolean> {
  const profile = await getUserProfile();

  if (!profile || profile.subscription === "Starter") {
    return false;
  }

  if (!profile.subscription_end_date) {
    return true;
  }

  const endDate = new Date(profile.subscription_end_date);
  return endDate > new Date();
}

export async function getSubscriptionPlan(): Promise<
  Database["public"]["Tables"]["profiles"]["Row"]["subscription"]
> {
  const profile = await getUserProfile();
  return profile?.subscription ?? "Starter";
}
