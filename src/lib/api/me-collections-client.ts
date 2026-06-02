// Per-row CRUD for the current student's CV collections.
// Backed by /me/{projects,experiences,educations,certifications}; mirrors me-skills-client.ts.

import { fetchWithAuth } from "@/lib/api/auth";
import type {
  MyProfileProject,
  MyProfileExperience,
  MyProfileEducation,
  MyProfileCertification,
} from "./me-profile-client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

async function send<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetchWithAuth(`${API_BASE_URL}${path}`, {
    method,
    headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Request failed (${res.status})`);
  }
  // DELETE returns a small {message} blob we don't use; tolerate empty bodies.
  return (await res.json().catch(() => ({}))) as T;
}

// Payload shapes mirror the backend DTOs. Dates are ISO strings (@IsDateString);
// optional URL/string fields must be omitted (not "") so @IsUrl/@IsString don't reject them.
export interface ProjectInput {
  title: string;
  description: string;
  technologies: string[];
  githubUrl?: string;
  demoUrl?: string;
}
export interface ExperienceInput {
  company: string;
  role: string;
  startDate: string;
  endDate?: string;
  description?: string;
}
export interface EducationInput {
  school: string;
  degree: string;
  field: string;
  startDate: string;
  endDate?: string;
  description?: string;
}
export interface CertificationInput {
  name: string;
  organization: string;
  issueDate: string;
  expirationDate?: string;
  credentialId?: string;
  credentialUrl?: string;
}

export const createProject = (b: ProjectInput) => send<MyProfileProject>("POST", "/me/projects", b);
export const updateProject = (id: string, b: Partial<ProjectInput>) => send<MyProfileProject>("PATCH", `/me/projects/${id}`, b);
export const removeProject = (id: string) => send<void>("DELETE", `/me/projects/${id}`);

export const createExperience = (b: ExperienceInput) => send<MyProfileExperience>("POST", "/me/experiences", b);
export const updateExperience = (id: string, b: Partial<ExperienceInput>) => send<MyProfileExperience>("PATCH", `/me/experiences/${id}`, b);
export const removeExperience = (id: string) => send<void>("DELETE", `/me/experiences/${id}`);

export const createEducation = (b: EducationInput) => send<MyProfileEducation>("POST", "/me/educations", b);
export const updateEducation = (id: string, b: Partial<EducationInput>) => send<MyProfileEducation>("PATCH", `/me/educations/${id}`, b);
export const removeEducation = (id: string) => send<void>("DELETE", `/me/educations/${id}`);

export const createCertification = (b: CertificationInput) => send<MyProfileCertification>("POST", "/me/certifications", b);
export const updateCertification = (id: string, b: Partial<CertificationInput>) => send<MyProfileCertification>("PATCH", `/me/certifications/${id}`, b);
export const removeCertification = (id: string) => send<void>("DELETE", `/me/certifications/${id}`);
