import { FIELD_LABELS, PROFILE_FIELDS } from "./completion-fields";

// Accepts any object so both the public profile and MyProfile can be passed.
export function calculateProfileCompletion(profile: unknown): number {
  if (!profile || typeof profile !== "object") return 0;

  const source = profile as Record<string, unknown>;

  let filledFields = 0;
  const totalFields = PROFILE_FIELDS.length;

  for (const field of PROFILE_FIELDS) {
    const value = source[field];
    if (value !== null && value !== undefined && value !== "") {
      filledFields++;
    }
  }

  return Math.round((filledFields / totalFields) * 100);
}

export function getIncompleteFields(profile: unknown): string[] {
  if (!profile || typeof profile !== "object") return [...PROFILE_FIELDS];

  const source = profile as Record<string, unknown>;

  return PROFILE_FIELDS.filter((field) => {
    const value = source[field];
    return value === null || value === undefined || value === "";
  });
}

export function getProfileSuggestions(profile: unknown) {
  return getIncompleteFields(profile).map((field) => ({
    field,
    label: FIELD_LABELS[field as (typeof PROFILE_FIELDS)[number]],
  }));
}

export function isProfileComplete(profile: unknown): boolean {
  return calculateProfileCompletion(profile) === 100;
}
