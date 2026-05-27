import { FIELD_LABELS, PROFILE_FIELDS } from "./completion-fields";

// Accepts any object so both the Supabase profile and MyProfile can be passed.
export function calculateProfileCompletion(profile: Record<string, unknown> | null): number {
  if (!profile) return 0;

  let filledFields = 0;
  const totalFields = PROFILE_FIELDS.length;

  for (const field of PROFILE_FIELDS) {
    const value = profile[field];
    if (value !== null && value !== undefined && value !== "") {
      filledFields++;
    }
  }

  return Math.round((filledFields / totalFields) * 100);
}

export function getIncompleteFields(profile: Record<string, unknown> | null): string[] {
  if (!profile) return [...PROFILE_FIELDS];

  return PROFILE_FIELDS.filter((field) => {
    const value = profile[field];
    return value === null || value === undefined || value === "";
  });
}

export function getProfileSuggestions(profile: Record<string, unknown> | null) {
  return getIncompleteFields(profile).map((field) => ({
    field,
    label: FIELD_LABELS[field as (typeof PROFILE_FIELDS)[number]],
  }));
}

export function isProfileComplete(profile: Record<string, unknown> | null): boolean {
  return calculateProfileCompletion(profile) === 100;
}
