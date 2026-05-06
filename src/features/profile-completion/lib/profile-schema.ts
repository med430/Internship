import { Award, Briefcase, Calendar, Link as LinkIcon } from "lucide-react";
import { z } from "zod";

export const profileSchema = z.object({
  name: z.string().max(255).optional(),
  location: z.string().optional(),
  birthday: z.string().optional(),
  targeted_role: z.string().optional(),
  organization: z.string().optional(),
  skills: z.string().optional(),
  experiences: z.string().optional(),
  education: z.string().optional(),
  achievements: z.string().optional(),
  linkedin_url: z
    .string()
    .optional()
    .refine(
      (val) => !val || val === "" || z.string().url().safeParse(val).success,
      { message: "Invalid URL" },
    ),
  github_url: z
    .string()
    .optional()
    .refine(
      (val) => !val || val === "" || z.string().url().safeParse(val).success,
      { message: "Invalid URL" },
    ),
  twitter_url: z
    .string()
    .optional()
    .refine(
      (val) => !val || val === "" || z.string().url().safeParse(val).success,
      { message: "Invalid URL" },
    ),
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

export interface ProfileCompletionWizardProps {
  initialData?: Partial<ProfileFormValues>;
  userEmail: string;
}

export const PROFILE_STEPS = [
  {
    id: 1,
    title: "Basic Info",
    icon: Calendar,
    description: "Tell us about yourself",
  },
  {
    id: 2,
    title: "Professional",
    icon: Briefcase,
    description: "Your career goals",
  },
  {
    id: 3,
    title: "Skills & Experience",
    icon: Award,
    description: "What you bring",
  },
  {
    id: 4,
    title: "Social Links",
    icon: LinkIcon,
    description: "Connect with you",
  },
] as const;

export const STEP_FIELDS: Record<number, (keyof ProfileFormValues)[]> = {
  1: ["name", "location", "birthday"],
  2: ["targeted_role", "organization"],
  3: ["skills", "experiences", "education", "achievements"],
  4: ["linkedin_url", "github_url", "twitter_url"],
};

export function buildDefaultValues(
  initialData?: Partial<ProfileFormValues>,
): ProfileFormValues {
  return {
    name: initialData?.name || "",
    location: initialData?.location || "",
    birthday: initialData?.birthday || "",
    targeted_role: initialData?.targeted_role || "",
    organization: initialData?.organization || "",
    skills: initialData?.skills || "",
    experiences: initialData?.experiences || "",
    education: initialData?.education || "",
    achievements: initialData?.achievements || "",
    linkedin_url: initialData?.linkedin_url || "",
    github_url: initialData?.github_url || "",
    twitter_url: initialData?.twitter_url || "",
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

export function mapFormToFinalProfilePayload(data: ProfileFormValues) {
  const skills = toList(data.skills);
  const experiences = toList(data.experiences);
  const education = toList(data.education);
  const achievements = toList(data.achievements);

  return {
    name: data.name || null,
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

export function mapFormToDraftProfilePayload(data: ProfileFormValues) {
  return {
    name: data.name || null,
    location: data.location || null,
    birthday: data.birthday || null,
    targeted_role: data.targeted_role || null,
    organization: data.organization || null,
    skills: toList(data.skills),
    experiences: toList(data.experiences),
    education: toList(data.education),
    achievements: toList(data.achievements),
    linkedin_url: data.linkedin_url || null,
    github_url: data.github_url || null,
    twitter_url: data.twitter_url || null,
  };
}
