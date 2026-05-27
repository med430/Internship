// Client for GET/PATCH /me/profile — the canonical student-profile shape the recommender reads.

import { fetchWithAuth } from "@/lib/api/auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export interface MyProfileSkill {
  id: string;
  skillId: number;
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
}

export interface MyProfile {
  id: string;
  userId: string;
  bio: string | null;
  birthDate: string | null;
  gender: string | null;
  address: string | null;
  city: string | null;
  domains: string[];
  schoolId: number | null;
  currentYear: number | null;
  currentProgram: string | null;
  preferredCities: string[];
  preferredDomains: string[];
  preferredOfferTypes: string[];
  preferredWorkMode: "ONSITE" | "REMOTE" | "HYBRID" | null;
  languages: string[];
  paidOnly: boolean;
  availableFrom: string | null;
  availableTo: string | null;
  skills: MyProfileSkill[];
}

export type MyProfilePatch = Partial<
  Omit<MyProfile, "id" | "userId" | "skills">
>;

export async function getMyProfile(): Promise<MyProfile | null> {
  const response = await fetchWithAuth(`${API_BASE_URL}/me/profile`, {
    method: "GET",
  });
  if (!response.ok) return null;
  return (await response.json()) as MyProfile;
}

export async function patchMyProfile(updates: MyProfilePatch): Promise<MyProfile> {
  const response = await fetchWithAuth(`${API_BASE_URL}/me/profile`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || "Failed to save profile");
  }
  return (await response.json()) as MyProfile;
}