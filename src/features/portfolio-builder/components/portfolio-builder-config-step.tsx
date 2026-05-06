import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CVSelector, type CVSource } from "@/components/shared/cv-selector";
import { THEMES, WIREFRAMES } from "../lib/constants";
import type { ProfileFieldOption } from "../types";
import { OptionGridSelector } from "./option-grid-selector";
import { ProfileFieldsSelector } from "./profile-fields-selector";

interface PortfolioBuilderConfigStepProps {
  selectedWireframe: string | null;
  selectedTheme: string | null;
  customTheme: string;
  useCustomTheme: boolean;
  selectedFields: string[];
  availableFields: ProfileFieldOption[];
  isGenerating: boolean;
  onWireframeChange: (id: string) => void;
  onThemeChange: (id: string) => void;
  onCustomThemeChange: (value: string) => void;
  onUseCustomThemeChange: (value: boolean) => void;
  onCVSourceChange: (source: CVSource | null) => void;
  onToggleField: (fieldKey: string) => void;
  onGenerate: () => Promise<void>;
}

export function PortfolioBuilderConfigStep({
  selectedWireframe,
  selectedTheme,
  customTheme,
  useCustomTheme,
  selectedFields,
  availableFields,
  isGenerating,
  onWireframeChange,
  onThemeChange,
  onCustomThemeChange,
  onUseCustomThemeChange,
  onCVSourceChange,
  onToggleField,
  onGenerate,
}: PortfolioBuilderConfigStepProps) {
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card className="bg-white/60 dark:bg-neutral-900/60 backdrop-blur-xl border-neutral-200/50 dark:border-neutral-800/50 shadow-sm p-4">
            <OptionGridSelector
              title="Select Format"
              subtitle="Choose your portfolio layout"
              options={WIREFRAMES}
              selectedId={selectedWireframe}
              onSelect={onWireframeChange}
            />
          </Card>

          <Card className="bg-white/60 dark:bg-neutral-900/60 backdrop-blur-xl border-neutral-200/50 dark:border-neutral-800/50 shadow-sm p-4">
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium text-neutral-900 dark:text-neutral-50">
                  Select Theme
                </Label>
                <p className="text-xs text-neutral-600 dark:text-neutral-400 mt-0.5">
                  Choose a predefined theme or create your own
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="custom-theme"
                  checked={useCustomTheme}
                  onCheckedChange={(checked) => {
                    onUseCustomThemeChange(Boolean(checked));
                    if (checked) onThemeChange("");
                  }}
                />
                <Label
                  htmlFor="custom-theme"
                  className="text-xs text-neutral-700 dark:text-neutral-300 cursor-pointer"
                >
                  Use custom theme description
                </Label>
              </div>

              {useCustomTheme ? (
                <div className="space-y-2">
                  <Textarea
                    placeholder="e.g., Modern and vibrant with bold colors..."
                    value={customTheme}
                    onChange={(event) =>
                      onCustomThemeChange(event.target.value.slice(0, 50))
                    }
                    maxLength={50}
                    className="resize-none bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-sm h-20"
                  />
                  <p className="text-xs text-neutral-500 dark:text-neutral-500 text-right">
                    {customTheme.length}/50
                  </p>
                </div>
              ) : (
                <OptionGridSelector
                  title=""
                  subtitle=""
                  options={THEMES}
                  selectedId={selectedTheme}
                  onSelect={onThemeChange}
                />
              )}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="bg-white/60 dark:bg-neutral-900/60 backdrop-blur-xl border-neutral-200/50 dark:border-neutral-800/50 shadow-sm p-6">
            <CVSelector
              onCVSelect={onCVSourceChange}
              label="CV (Optional)"
              description="Upload your CV or select from your saved CVs"
            />
          </Card>

          <ProfileFieldsSelector
            availableFields={availableFields}
            selectedFields={selectedFields}
            onToggleField={onToggleField}
          />
        </div>
      </div>

      <div className="flex justify-center">
        <Button
          onClick={onGenerate}
          disabled={
            isGenerating ||
            !selectedWireframe ||
            (!selectedTheme && !useCustomTheme)
          }
          className="bg-neutral-900 hover:bg-neutral-800 dark:bg-neutral-50 dark:hover:bg-neutral-200 text-white dark:text-neutral-900 px-6"
          size="sm"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            "Generate"
          )}
        </Button>
      </div>
    </>
  );
}
