export const PROFILE_FIELDS = [
  "name",
  "location",
  "birthday",
  "linkedin_url",
  "github_url",
  "twitter_url",
  "targeted_role",
  "organization",
  "skills",
  "experiences",
  "education",
  "achievements",
] as const;

export const FIELD_LABELS: Record<(typeof PROFILE_FIELDS)[number], string> = {
  name: "Full Name",
  location: "Location",
  birthday: "Birthday",
  linkedin_url: "LinkedIn Profile",
  github_url: "GitHub Profile",
  twitter_url: "Twitter Profile",
  targeted_role: "Targeted Role",
  organization: "Organization",
  skills: "Skills",
  experiences: "Work Experience",
  education: "Education",
  achievements: "Achievements",
};
