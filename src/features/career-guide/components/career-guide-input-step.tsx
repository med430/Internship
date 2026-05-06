import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CVSelector, type CVSource } from "@/components/shared/cv-selector";
import { CAREER_DOMAINS } from "../lib/constants";

interface CareerGuideInputStepProps {
  cvSource: CVSource | null;
  currentJob: string;
  targetJob: string;
  domain: string;
  useTargetJob: boolean;
  isGenerating: boolean;
  onCvSourceChange: (source: CVSource | null) => void;
  onCurrentJobChange: (value: string) => void;
  onTargetJobChange: (value: string) => void;
  onDomainChange: (value: string) => void;
  onUseTargetJobChange: (value: boolean) => void;
  onGenerate: () => Promise<void>;
}

export function CareerGuideInputStep({
  cvSource,
  currentJob,
  targetJob,
  domain,
  useTargetJob,
  isGenerating,
  onCvSourceChange,
  onCurrentJobChange,
  onTargetJobChange,
  onDomainChange,
  onUseTargetJobChange,
  onGenerate,
}: CareerGuideInputStepProps) {
  return (
    <Card className="p-6 rounded-2xl bg-card/80 backdrop-blur-xl border border-border shadow-lg shadow-primary/5">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-1.5 text-neutral-900 dark:text-neutral-50">
            Career Information
          </h2>
          <p className="text-neutral-600 dark:text-neutral-400 text-sm font-light">
            Upload your CV and tell us about your career goals
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <CVSelector
              onCVSelect={onCvSourceChange}
              label="Your CV"
              description="Upload your CV or select from your saved CVs"
            />
          </div>

          <div className="space-y-4">
            <div className="space-y-2 mt-2.5">
              <Label
                htmlFor="domain"
                className="text-sm font-semibold text-foreground"
              >
                Career Domain
              </Label>
              <Select value={domain} onValueChange={onDomainChange}>
                <SelectTrigger
                  className="bg-card border-border"
                  suppressHydrationWarning
                >
                  <SelectValue placeholder="Select domain" />
                </SelectTrigger>
                <SelectContent suppressHydrationWarning>
                  {CAREER_DOMAINS.map((domainItem) => (
                    <SelectItem key={domainItem} value={domainItem}>
                      {domainItem}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="current-job"
                className="text-sm font-semibold text-foreground"
              >
                Current Job Title
              </Label>
              <Input
                id="current-job"
                placeholder="e.g., Software Engineer"
                value={currentJob}
                onChange={(event) => onCurrentJobChange(event.target.value)}
                className="bg-card border-border"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="use-target-job"
                  checked={useTargetJob}
                  onCheckedChange={(checked) =>
                    onUseTargetJobChange(Boolean(checked))
                  }
                />
                <Label
                  htmlFor="use-target-job"
                  className="text-sm font-medium text-neutral-900 dark:text-neutral-50 cursor-pointer"
                >
                  I have a target job in mind
                </Label>
              </div>

              {useTargetJob && (
                <>
                  <Input
                    id="target-job"
                    placeholder="e.g., Senior Software Architect"
                    value={targetJob}
                    onChange={(event) => onTargetJobChange(event.target.value)}
                    className="bg-card border-border"
                  />
                  <p className="text-xs text-muted-foreground">
                    If not specified, we will provide tips for your current role
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-center pt-2">
          <Button
            onClick={onGenerate}
            disabled={isGenerating || !cvSource || !domain || !currentJob}
            size="lg"
            className="px-6 py-2.5 text-sm font-medium rounded-lg shadow-lg shadow-primary/25 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Get Guidance
          </Button>
        </div>
      </div>
    </Card>
  );
}
