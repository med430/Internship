"use client";

import { Sparkles } from "lucide-react";
import { RecruiterProfileTabs } from "./recruiter-profile-tabs";
import type { RecruiterProfileData } from "@/lib/api/recruiter-profile-api";

interface Props {
  profile: RecruiterProfileData;
  userEmail: string;
  isOAuthUser: boolean;
}

export function RecruiterProfileScreen({ profile, userEmail, isOAuthUser }: Props) {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-background via-muted/30 to-background">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 py-6 sm:py-8 lg:py-12">
        <div className="space-y-4 sm:space-y-6">

          <div className="space-y-1 sm:space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/15 bg-sky-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-700 dark:text-sky-300 w-fit">
              <Sparkles className="h-3.5 w-3.5" />
              Recruiter workspace
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-foreground">
              Profile Settings
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base lg:text-lg">
              Manage your account and company information.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 lg:gap-8">
            <RecruiterProfileTabs
              profile={profile}
              userEmail={userEmail}
              isOAuthUser={isOAuthUser}
            />
          </div>
        </div>
      </div>
    </div>
  );
}