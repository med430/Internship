"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";
import { fetchWithAuth } from "@/lib/api/auth";
import { getClientApiBaseUrl } from "@/lib/api/client-utils";
import {
  generateCareerGuide,
  type CareerGuideResponse,
} from "@/lib/api/career-guide";
import { fetchCareerGuideById } from "@/lib/api/career-guides";
import type { CVSource } from "@/components/shared/cv-selector";
import type { CareerGuideStep } from "../types";

function collectProfileData(
  profile:
    | {
        name?: unknown;
        location?: unknown;
        birthday?: unknown;
        targeted_role?: unknown;
        organization?: unknown;
        skills?: unknown;
        experiences?: unknown;
        education?: unknown;
        achievements?: unknown;
        github_url?: unknown;
        linkedin_url?: unknown;
        twitter_url?: unknown;
      }
    | null
    | undefined,
): Record<string, unknown> {
  if (!profile) {
    return {};
  }

  return {
    name: profile.name,
    location: profile.location,
    birthday: profile.birthday,
    targeted_role: profile.targeted_role,
    organization: profile.organization,
    skills: profile.skills,
    experiences: profile.experiences,
    education: profile.education,
    achievements: profile.achievements,
    github_url: profile.github_url,
    linkedin_url: profile.linkedin_url,
    twitter_url: profile.twitter_url,
  };
}

function validateInputs(params: {
  cvSource: CVSource | null;
  currentJob: string;
  domain: string;
  useTargetJob: boolean;
  targetJob: string;
}): string | null {
  const { cvSource, currentJob, domain, useTargetJob, targetJob } = params;

  if (!cvSource) return "Please upload or select a CV";
  if (!currentJob.trim()) return "Please enter your current job title";
  if (!domain) return "Please select a career domain";
  if (useTargetJob && !targetJob.trim()) {
    return "Please enter your target job or uncheck the option";
  }

  return null;
}

async function fetchProfile() {
  const response = await fetchWithAuth(`${getClientApiBaseUrl()}/onboard/profile`, {
    method: "GET",
  });

  if (!response.ok) {
    return null;
  }

  return (await response.json()) as {
    name?: unknown;
    location?: unknown;
    birthday?: unknown;
    targeted_role?: unknown;
    organization?: unknown;
    skills?: unknown;
    experiences?: unknown;
    education?: unknown;
    achievements?: unknown;
    github_url?: unknown;
    linkedin_url?: unknown;
    twitter_url?: unknown;
  };
}

function toCareerGuideResponse(
  guide: Awaited<ReturnType<typeof fetchCareerGuideById>>,
): CareerGuideResponse {
  return {
    current_strengths: guide.current_strengths,
    readiness_score: guide.readiness_score,
    skills_to_learn: guide.skills_to_learn,
    projects_to_work_on: guide.projects_to_work_on,
    soft_skills_to_develop: guide.soft_skills_to_develop,
    career_roadmap: guide.career_roadmap,
  };
}

export function useCareerGuideController() {
  const [currentStep, setCurrentStep] = useState<CareerGuideStep>("input");
  const [cvSource, setCvSource] = useState<CVSource | null>(null);
  const [currentJob, setCurrentJob] = useState("");
  const [targetJob, setTargetJob] = useState("");
  const [domain, setDomain] = useState("");
  const [useTargetJob, setUseTargetJob] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [careerGuide, setCareerGuide] = useState<CareerGuideResponse | null>(
    null,
  );

  const handleGenerateGuide = useCallback(async () => {
    const validationMessage = validateInputs({
      cvSource,
      currentJob,
      domain,
      useTargetJob,
      targetJob,
    });

    if (validationMessage) {
      toast.error(validationMessage);
      return;
    }

    setIsGenerating(true);
    setCurrentStep("loading");

    try {
      const profile = await fetchProfile();
      const profileData = collectProfileData(profile);

      const acceptedJob = await generateCareerGuide(
        cvSource?.type === "file" ? cvSource.file : null,
        cvSource?.type === "database" ? cvSource.cv.anonymized_cv_text : null,
        currentJob,
        domain,
        useTargetJob ? targetJob : null,
        Object.keys(profileData).length > 0 ? profileData : null,
      );

      if (!acceptedJob.resource_id) {
        throw new Error("Career guide completed but no result was returned.");
      }

      const guide = await fetchCareerGuideById(acceptedJob.resource_id);
      setCareerGuide(toCareerGuideResponse(guide));
      setCurrentStep("result");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to generate career guide. Please try again.",
      );
      setCurrentStep("input");
    } finally {
      setIsGenerating(false);
    }
  }, [currentJob, cvSource, domain, targetJob, useTargetJob]);

  const handleRestart = useCallback(() => {
    setCvSource(null);
    setCurrentJob("");
    setTargetJob("");
    setDomain("");
    setUseTargetJob(false);
    setCareerGuide(null);
    setCurrentStep("input");
    setIsGenerating(false);
  }, []);

  return {
    currentStep,
    cvSource,
    currentJob,
    targetJob,
    domain,
    useTargetJob,
    isGenerating,
    careerGuide,
    setCvSource,
    setCurrentJob,
    setTargetJob,
    setDomain,
    setUseTargetJob,
    handleGenerateGuide,
    handleRestart,
  };
}
