import type { Database } from "@/types/database.types";
import { FIELD_LABELS, PROFILE_FIELDS } from "./completion-fields";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export function calculateProfileCompletion(profile: Profile | null): number {
  if (!profile) return 0;

  let filledFields = 0;
  const totalFields = PROFILE_FIELDS.length;

  for (const field of PROFILE_FIELDS) {
    const value = profile[field];

    if (value !== null && value !== undefined && value !== "") {
      if (Array.isArray(value)) {
        if (value.length > 0) {
          filledFields++;
        }
      } else {
        filledFields++;
      }
    }
  }

  return Math.round((filledFields / totalFields) * 100);
}

export function getIncompleteFields(profile: Profile | null): string[] {
  if (!profile) return [...PROFILE_FIELDS];

  const incomplete: string[] = [];

  for (const field of PROFILE_FIELDS) {
    const value = profile[field];

    if (value === null || value === undefined || value === "") {
      incomplete.push(field);
    } else if (Array.isArray(value) && value.length === 0) {
      incomplete.push(field);
    }
  }

  return incomplete;
}

export function getProfileSuggestions(profile: Profile | null) {
  const incomplete = getIncompleteFields(profile);

  return incomplete.map((field) => ({
    field,
    label: FIELD_LABELS[field as (typeof PROFILE_FIELDS)[number]],
  }));
}

export function isProfileComplete(profile: Profile | null): boolean {
  return calculateProfileCompletion(profile) === 100;
}
