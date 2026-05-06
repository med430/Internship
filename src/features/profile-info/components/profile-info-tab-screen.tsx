"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useProfileInfoController } from "../hooks/use-profile-info-controller";
import { ProfileInfoTabProps } from "../lib/profile-info-schema";
import { ProfileCompletionCard } from "./profile-completion-card";
import { ProfileInfoForm } from "./profile-info-form";

export function ProfileInfoTabScreen({ profile }: ProfileInfoTabProps) {
  const { completion, form, isSubmitting, onSubmit } =
    useProfileInfoController(profile);

  return (
    <div className="space-y-6">
      <ProfileCompletionCard completion={completion} />

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>
            Update your personal and professional information
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
    </div>
  );
}
