"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { fetchWithAuth } from "@/lib/api/auth";
import { getClientApiBaseUrl } from "@/lib/api/client-utils";
import {
  fetchPortfolioGenerationById,
  generatePortfolio,
} from "@/lib/api/portfolio-builder";
import type { CVSource } from "@/components/shared/cv-selector";
import type { PortfolioBuilderStep, Profile } from "../types";
import { PROFILE_FIELDS } from "../lib/constants";

function hasMeaningfulValue(value: unknown): boolean {
  if (value === null || value === undefined || value === "") {
    return false;
  }

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  return true;
}

async function fetchProfile(): Promise<Profile | null> {
  const response = await fetchWithAuth(`${getClientApiBaseUrl()}/onboard/profile`, {
    method: "GET",
  });

  if (!response.ok) {
    return null;
  }

  return (await response.json()) as Profile;
}

export function usePortfolioBuilderController() {
  const [currentStep, setCurrentStep] =
    useState<PortfolioBuilderStep>("configure");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [selectedWireframe, setSelectedWireframe] = useState<string | null>(
    null,
  );
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null);
  const [customTheme, setCustomTheme] = useState("");
  const [useCustomTheme, setUseCustomTheme] = useState(false);
  const [cvSource, setCvSource] = useState<CVSource | null>(null);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedHtml, setGeneratedHtml] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    async function loadProfile() {
      try {
        const profileData = await fetchProfile();

        if (!isActive || !profileData) {
          return;
        }

        setProfile(profileData);

        const nonNullFields = PROFILE_FIELDS.filter((field) => {
          const value = profileData[field.key as keyof Profile];
          return hasMeaningfulValue(value);
        }).map((field) => field.key);

        setSelectedFields(nonNullFields);
      } catch {
        toast.error("Failed to load profile");
      }
    }

    void loadProfile();

    return () => {
      isActive = false;
    };
  }, []);

  const availableFields = useMemo(() => {
    if (!profile) {
      return [];
    }

    return PROFILE_FIELDS.filter((field) => {
      const value = profile[field.key as keyof Profile];
      return hasMeaningfulValue(value);
    });
  }, [profile]);

  const toggleField = useCallback((fieldKey: string) => {
    setSelectedFields((previous) =>
      previous.includes(fieldKey)
        ? previous.filter((key) => key !== fieldKey)
        : [...previous, fieldKey],
    );
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!selectedWireframe) {
      toast.error("Please select a wireframe");
      return;
    }

    if (!useCustomTheme && !selectedTheme) {
      toast.error("Please select a theme or enter a custom theme");
      return;
    }

    if (useCustomTheme && customTheme.trim().length < 3) {
      toast.error("Custom theme description must be at least 3 characters");
      return;
    }

    if (!profile) {
      toast.error("Profile not loaded");
      return;
    }

    setIsGenerating(true);
    setCurrentStep("result");

    try {
      const personalInfo: Record<string, unknown> = {};
      selectedFields.forEach((fieldKey) => {
        const value = profile[fieldKey as keyof Profile];
        if (value !== null && value !== undefined) {
          personalInfo[fieldKey] = value;
        }
      });

      const acceptedJob = await generatePortfolio({
        wireframe: selectedWireframe,
        theme: useCustomTheme ? customTheme.trim() : selectedTheme!,
        cv: cvSource?.type === "file" ? cvSource.file : undefined,
        cvText:
          cvSource?.type === "database"
            ? cvSource.cv.anonymized_cv_text || undefined
            : undefined,
        personalInfo,
        photoUrl: profile.avatar_url || undefined,
      });

      if (!acceptedJob.resource_id) {
        throw new Error("Portfolio completed but no generated page was returned.");
      }

      const generation = await fetchPortfolioGenerationById(acceptedJob.resource_id);
      setGeneratedHtml(generation.html);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to generate portfolio",
      );
      setCurrentStep("configure");
    } finally {
      setIsGenerating(false);
    }
  }, [
    customTheme,
    cvSource,
    profile,
    selectedFields,
    selectedTheme,
    selectedWireframe,
    useCustomTheme,
  ]);

  const handleBack = useCallback(() => {
    setCurrentStep("configure");
    setIsGenerating(false);
  }, []);

  const openInNewTab = useCallback(() => {
    if (!generatedHtml) {
      return;
    }

    const newWindow = window.open();
    if (!newWindow) {
      return;
    }

    newWindow.document.write(generatedHtml);
    newWindow.document.close();
  }, [generatedHtml]);

  return {
    currentStep,
    profile,
    selectedWireframe,
    selectedTheme,
    customTheme,
    useCustomTheme,
    cvSource,
    selectedFields,
    isGenerating,
    generatedHtml,
    availableFields,
    setSelectedWireframe,
    setSelectedTheme,
    setCustomTheme,
    setUseCustomTheme,
    setCvSource,
    toggleField,
    handleGenerate,
    handleBack,
    openInNewTab,
  };
}
