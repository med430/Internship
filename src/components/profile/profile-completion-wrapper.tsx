"use client";

import dynamic from "next/dynamic";

const ProfileCompletionWizard = dynamic(
  () =>
    import("@/components/profile/profile-completion-wizard").then((mod) => ({
      default: mod.ProfileCompletionWizard,
    })),
  { ssr: false },
);

interface ProfileCompletionWrapperProps {
  initialData?: {
    name: string;
    location: string;
    birthday: string;
    targeted_role: string;
    organization: string;
    skills: string;
    experiences: string;
    education: string;
    achievements: string;
    linkedin_url: string;
    github_url: string;
    twitter_url: string;
  };
  userEmail: string;
}

export function ProfileCompletionWrapper({
  initialData,
  userEmail,
}: ProfileCompletionWrapperProps) {
  return (
    <ProfileCompletionWizard initialData={initialData} userEmail={userEmail} />
  );
}
