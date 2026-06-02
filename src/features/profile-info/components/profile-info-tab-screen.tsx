"use client";

import { Loader2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useProfileInfoController } from "../hooks/use-profile-info-controller";
import { ProfileCompletionCard } from "./profile-completion-card";
import { ProfileInfoForm } from "./profile-info-form";
import { EducationsEditor } from "./collections/educations-editor";
import { ExperiencesEditor } from "./collections/experiences-editor";
import { ProjectsEditor } from "./collections/projects-editor";
import { CertificationsEditor } from "./collections/certifications-editor";

export function ProfileInfoTabScreen() {
  const { completion, form, isSubmitting, loading, onSubmit, profile } =
    useProfileInfoController();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ProfileCompletionCard completion={completion} />

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Update your personal information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileInfoForm
            form={form}
            isSubmitting={isSubmitting}
            onSubmit={onSubmit}
          />
        </CardContent>
      </Card>

      {/* CV / background collections — each saves immediately via the /me/* endpoints */}
      <EducationsEditor initial={profile?.educations ?? []} />
      <ExperiencesEditor initial={profile?.experiences ?? []} />
      <ProjectsEditor initial={profile?.projects ?? []} />
      <CertificationsEditor initial={profile?.certifications ?? []} />
    </div>
  );
}
