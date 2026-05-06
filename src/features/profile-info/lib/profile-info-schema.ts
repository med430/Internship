import { z } from "zod";
import type { Database } from "@/types/database.types";

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export const profileInfoSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  location: z.string().optional(),
  birthday: z.string().optional(),
  targeted_role: z.string().optional(),
  organization: z.string().optional(),
  skills: z.string().optional(),
  experiences: z.string().optional(),
  education: z.string().optional(),
  achievements: z.string().optional(),
  linkedin_url: z.string().url("Invalid URL").optional().or(z.literal("")),
  github_url: z.string().url("Invalid URL").optional().or(z.literal("")),
  twitter_url: z.string().url("Invalid URL").optional().or(z.literal("")),
});

export type ProfileInfoFormValues = z.infer<typeof profileInfoSchema>;

export interface ProfileInfoTabProps {
  profile: Profile;
}

export function buildDefaultValues(profile: Profile): ProfileInfoFormValues {
  return {
    name: profile.name || "",
    location: profile.location || "",
    birthday: profile.birthday || "",
    targeted_role: profile.targeted_role || "",
    organization: profile.organization || "",
    skills: profile.skills?.join(", ") || "",
    experiences: profile.experiences?.join(", ") || "",
    education: profile.education?.join(", ") || "",
    achievements: profile.achievements?.join(", ") || "",
    linkedin_url: profile.linkedin_url || "",
    github_url: profile.github_url || "",
    twitter_url: profile.twitter_url || "",
  };
}

function toList(value?: string) {
  if (!value) {
    return [];
  }

  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function mapFormToProfilePayload(data: ProfileInfoFormValues) {
  const skills = toList(data.skills);
  const experiences = toList(data.experiences);
  const education = toList(data.education);
  const achievements = toList(data.achievements);

  return {
    name: data.name,
    location: data.location || null,
    birthday: data.birthday || null,
    targeted_role: data.targeted_role || null,
    organization: data.organization || null,
    skills: skills.length > 0 ? skills : null,
    experiences: experiences.length > 0 ? experiences : null,
    education: education.length > 0 ? education : null,
    achievements: achievements.length > 0 ? achievements : null,
    linkedin_url: data.linkedin_url || null,
    github_url: data.github_url || null,
    twitter_url: data.twitter_url || null,
  };
}
