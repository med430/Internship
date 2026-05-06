"use client";

import * as React from "react";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { updateProfile } from "@/lib/profile/actions";
import {
  buildDefaultValues,
  mapFormToDraftProfilePayload,
  mapFormToFinalProfilePayload,
  profileSchema,
  PROFILE_STEPS,
  ProfileFormValues,
  STEP_FIELDS,
} from "../lib/profile-schema";

export function useProfileCompletionController(
  initialData?: Partial<ProfileFormValues>,
) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: buildDefaultValues(initialData),
  });

  const progress = (currentStep / PROFILE_STEPS.length) * 100;

  const onSubmit = async (data: ProfileFormValues) => {
    setIsSubmitting(true);

    try {
      const result = await updateProfile(
        mapFormToFinalProfilePayload(data),
        true,
      );

      if (result.success) {
        toast.success("Profile completed successfully!", {
          description: "You're all set! Redirecting to dashboard...",
        });

        setTimeout(() => {
          window.location.href = "/services/dashboard";
        }, 1000);
        return;
      }

      toast.error("Failed to update profile", {
        description: result.error || "Please try again",
      });
    } catch {
      toast.error("An unexpected error occurred", {
        description: "Please try again later",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = async () => {
    const fieldsToValidate = STEP_FIELDS[currentStep] || [];
    const isStepValid = await form.trigger(fieldsToValidate);

    if (!isStepValid || currentStep >= PROFILE_STEPS.length) {
      return;
    }

    setCurrentStep((step) => step + 1);
  };

  const handlePrevious = () => {
    if (currentStep <= 1) {
      return;
    }

    setCurrentStep((step) => step - 1);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLFormElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
    }
  };

  const handleSkip = async () => {
    await updateProfile(mapFormToDraftProfilePayload(form.getValues()));

    if (currentStep < PROFILE_STEPS.length) {
      setCurrentStep((step) => step + 1);
    }
  };

  return {
    form,
    currentStep,
    isSubmitting,
    progress,
    onSubmit,
    handleNext,
    handlePrevious,
    handleKeyDown,
    handleSkip,
    currentStepMeta: PROFILE_STEPS[currentStep - 1],
    steps: PROFILE_STEPS,
  };
}
