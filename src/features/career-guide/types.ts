import type { CVSource } from "@/components/shared/cv-selector";
import type { CareerGuideResponse } from "@/lib/api/career-guide";

export type CareerGuideStep = "input" | "result" | "loading";

export interface CareerGuideInputState {
  cvSource: CVSource | null;
  currentJob: string;
  targetJob: string;
  domain: string;
  useTargetJob: boolean;
}

export interface CareerGuideViewState extends CareerGuideInputState {
  currentStep: CareerGuideStep;
  isGenerating: boolean;
  careerGuide: CareerGuideResponse | null;
}
