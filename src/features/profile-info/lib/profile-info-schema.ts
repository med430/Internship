import { z } from "zod";
import type { MyProfile } from "@/lib/api/me-profile-client";

export const GENDER_OPTIONS = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "OTHER", label: "Other" },
] as const;

export const profileInfoSchema = z.object({
  // User entity fields
  name: z.string().min(2, "Name must be at least 2 characters"),
  lastname: z.string().min(1, "Last name is required"),
  username: z.string().min(2, "Username must be at least 2 characters").optional().or(z.literal("")),
  phone: z.string().max(40).optional().or(z.literal("")),

  // StudentProfile fields
  bio: z.string().max(1000, "Bio must be under 1000 characters").optional().or(z.literal("")),
  birthDate: z.string().optional().or(z.literal("")),
  gender: z.enum(["MALE", "FEMALE", "OTHER", ""]).optional(),
  address: z.string().max(120).optional().or(z.literal("")),
  city: z.string().max(80).optional().or(z.literal("")),
});

export type ProfileInfoFormValues = z.infer<typeof profileInfoSchema>;

export function buildDefaultValues(profile: MyProfile): ProfileInfoFormValues {
  return {
    name: profile.name ?? "",
    lastname: profile.lastname ?? "",
    username: profile.username ?? "",
    phone: profile.phone ?? "",
    bio: profile.bio ?? "",
    birthDate: profile.birthDate ? profile.birthDate.split("T")[0] : "",
    gender: (profile.gender as ProfileInfoFormValues["gender"]) ?? "",
    address: profile.address ?? "",
    city: profile.city ?? "",
  };
}

export function mapFormToProfilePayload(data: ProfileInfoFormValues) {
  return {
    name: data.name,
    lastname: data.lastname || undefined,
    username: data.username || undefined,
    phone: data.phone || undefined,
    bio: data.bio || undefined,
    birthDate: data.birthDate || undefined,
    gender: (data.gender || undefined) as "MALE" | "FEMALE" | "OTHER" | undefined,
    address: data.address || undefined,
    city: data.city || undefined,
  };
}
