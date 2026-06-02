// Client for GET/PATCH /me/profile — the canonical student-profile shape the recommender reads.

import { fetchWithAuth } from "@/lib/api/auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export interface MyProfileSkill {
  id: string;
  skillId: number;
  level: "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "EXPERT";
}

export interface MyProfileProject {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  githubUrl: string | null;
  demoUrl: string | null;
}

export interface MyProfileExperience {
  id: string;
  company: string;
  role: string;
  startDate: string | null;
  endDate: string | null;
  description: string | null;
}

export interface MyProfileEducation {
  id: string;
  school: string;
  degree: string;
  field: string;
  startDate: string | null;
  endDate: string | null;
  description: string | null;
}

export interface MyProfileCertification {
  id: string;
  name: string;
  organization: string;
  issueDate: string | null;
  expirationDate: string | null;
  credentialId: string | null;
  credentialUrl: string | null;
}

export interface MyProfile {
  // User entity fields
  name: string | null;
  lastname: string | null;
  username: string | null;
  phone: string | null;
  avatarUrl: string | null;

  // StudentProfile entity fields
  id: string;
  userId: string;
  bio: string | null;
  birthDate: string | null;
  gender: "MALE" | "FEMALE" | "OTHER" | null;
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
  projects: MyProfileProject[];
  experiences: MyProfileExperience[];
  educations: MyProfileEducation[];
  certifications: MyProfileCertification[];
}

export type MyProfilePatch = Partial<
  Omit<
    MyProfile,
    "id" | "userId" | "skills" | "projects" | "experiences" | "educations" | "certifications"
  >
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
