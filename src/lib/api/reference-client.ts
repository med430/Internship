// Reference data the profile dropdowns need: skills, schools, career domains.

import { fetchWithAuth } from "@/lib/api/auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export interface SkillOption {
  id: number;
  name: string;
}

export interface SchoolOption {
  id: number;
  name: string;
  city: string | null;
}

async function getJson<T>(path: string): Promise<T> {
  const response = await fetchWithAuth(`${API_BASE_URL}${path}`, { method: "GET" });
  if (!response.ok) throw new Error(`${path} failed: ${response.status}`);
  return (await response.json()) as T;
}

export const listSkills = () => getJson<SkillOption[]>("/skills");
export const listSchools = () => getJson<SchoolOption[]>("/schools");
export const listDomains = () => getJson<string[]>("/domains");
