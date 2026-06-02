// Client-side validation + form<->payload mapping for the CV collection editors.
// Mirrors the backend DTOs exactly (required fields, >=1 technology, valid URLs, ISO dates).

import { z } from "zod";
import type {
  MyProfileProject,
  MyProfileExperience,
  MyProfileEducation,
  MyProfileCertification,
} from "@/lib/api/me-profile-client";
import type {
  ProjectInput,
  ExperienceInput,
  EducationInput,
  CertificationInput,
} from "@/lib/api/me-collections-client";

const urlOrEmpty = z.string().trim().url("Enter a valid URL (https://…)").or(z.literal(""));
// Optional text/url/date fields go to the API only when non-empty (@IsUrl/@IsString reject "").
const opt = (v?: string | null): string | undefined => {
  const s = (v ?? "").trim();
  return s ? s : undefined;
};

// ── Project ───────────────────────────────────────────────
export const projectSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().min(1, "Description is required"),
  technologies: z.array(z.string()).min(1, "Add at least one technology"),
  githubUrl: urlOrEmpty.optional(),
  demoUrl: urlOrEmpty.optional(),
});
export type ProjectFormValues = z.infer<typeof projectSchema>;
export const emptyProject: ProjectFormValues = { title: "", description: "", technologies: [], githubUrl: "", demoUrl: "" };
export const projectFromItem = (p: MyProfileProject): ProjectFormValues => ({
  title: p.title,
  description: p.description,
  technologies: p.technologies ?? [],
  githubUrl: p.githubUrl ?? "",
  demoUrl: p.demoUrl ?? "",
});
export const projectToPayload = (v: ProjectFormValues): ProjectInput => ({
  title: v.title.trim(),
  description: v.description.trim(),
  technologies: v.technologies,
  githubUrl: opt(v.githubUrl),
  demoUrl: opt(v.demoUrl),
});

// ── Experience ────────────────────────────────────────────
export const experienceSchema = z.object({
  company: z.string().trim().min(1, "Company is required"),
  role: z.string().trim().min(1, "Role is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  description: z.string().optional(),
});
export type ExperienceFormValues = z.infer<typeof experienceSchema>;
export const emptyExperience: ExperienceFormValues = { company: "", role: "", startDate: "", endDate: "", description: "" };
export const experienceFromItem = (e: MyProfileExperience): ExperienceFormValues => ({
  company: e.company,
  role: e.role,
  startDate: e.startDate ?? "",
  endDate: e.endDate ?? "",
  description: e.description ?? "",
});
export const experienceToPayload = (v: ExperienceFormValues): ExperienceInput => ({
  company: v.company.trim(),
  role: v.role.trim(),
  startDate: v.startDate,
  endDate: opt(v.endDate),
  description: opt(v.description),
});

// ── Education ─────────────────────────────────────────────
export const educationSchema = z.object({
  school: z.string().trim().min(1, "School is required"),
  degree: z.string().trim().min(1, "Degree is required"),
  field: z.string().trim().min(1, "Field of study is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  description: z.string().optional(),
});
export type EducationFormValues = z.infer<typeof educationSchema>;
export const emptyEducation: EducationFormValues = { school: "", degree: "", field: "", startDate: "", endDate: "", description: "" };
export const educationFromItem = (e: MyProfileEducation): EducationFormValues => ({
  school: e.school,
  degree: e.degree,
  field: e.field,
  startDate: e.startDate ?? "",
  endDate: e.endDate ?? "",
  description: e.description ?? "",
});
export const educationToPayload = (v: EducationFormValues): EducationInput => ({
  school: v.school.trim(),
  degree: v.degree.trim(),
  field: v.field.trim(),
  startDate: v.startDate,
  endDate: opt(v.endDate),
  description: opt(v.description),
});

// ── Certification ─────────────────────────────────────────
export const certificationSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  organization: z.string().trim().min(1, "Issuing organization is required"),
  issueDate: z.string().min(1, "Issue date is required"),
  expirationDate: z.string().optional(),
  credentialId: z.string().optional(),
  credentialUrl: urlOrEmpty.optional(),
});
export type CertificationFormValues = z.infer<typeof certificationSchema>;
export const emptyCertification: CertificationFormValues = {
  name: "", organization: "", issueDate: "", expirationDate: "", credentialId: "", credentialUrl: "",
};
export const certificationFromItem = (c: MyProfileCertification): CertificationFormValues => ({
  name: c.name,
  organization: c.organization,
  issueDate: c.issueDate ?? "",
  expirationDate: c.expirationDate ?? "",
  credentialId: c.credentialId ?? "",
  credentialUrl: c.credentialUrl ?? "",
});
export const certificationToPayload = (v: CertificationFormValues): CertificationInput => ({
  name: v.name.trim(),
  organization: v.organization.trim(),
  issueDate: v.issueDate,
  expirationDate: opt(v.expirationDate),
  credentialId: opt(v.credentialId),
  credentialUrl: opt(v.credentialUrl),
});
