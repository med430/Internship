"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { updateProfile } from "@/lib/profile/actions";
import { calculateProfileCompletion } from "@/lib/profile/completion";
import {
  buildDefaultValues,
  mapFormToProfilePayload,
  Profile,
  profileInfoSchema,
  ProfileInfoFormValues,
} from "../lib/profile-info-schema";

export function useProfileInfoController(profile: Profile) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPending, startTransition] = useTransition();

  const form = useForm<ProfileInfoFormValues>({
    resolver: zodResolver(profileInfoSchema),
    defaultValues: buildDefaultValues(profile),
  });

  const onSubmit = async (data: ProfileInfoFormValues) => {
    setIsSubmitting(true);

    try {
      const result = await updateProfile(mapFormToProfilePayload(data));

      if (result.success) {
        toast.success("Profile updated successfully!");
        startTransition(() => {
          router.refresh();
        });
        return;
      }

      toast.error(result.error || "Failed to update profile");
    } catch {
      toast.error("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    onSubmit,
    completion: calculateProfileCompletion(profile),
    isSubmitting,
    isPending,
  };
}
