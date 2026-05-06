"use client";

import { PortfolioBuilderNav } from "@/components/portfolio-builder/portfolio-builder-nav";
import { usePortfolioBuilderController } from "../hooks/use-portfolio-builder-controller";
import { PortfolioBuilderHero } from "./portfolio-builder-hero";
import { PortfolioBuilderConfigStep } from "./portfolio-builder-config-step";
import { PortfolioBuilderResultStep } from "./portfolio-builder-result-step";

export function PortfolioBuilderScreen() {
  const {
    currentStep,
    selectedWireframe,
    selectedTheme,
    customTheme,
    useCustomTheme,
    selectedFields,
    isGenerating,
    generatedHtml,
    availableFields,
    subdomainName,
    setSelectedWireframe,
    setSelectedTheme,
    setCustomTheme,
    setUseCustomTheme,
    setCvSource,
    toggleField,
    handleGenerate,
    handleBack,
    openInNewTab,
  } = usePortfolioBuilderController();

  if (currentStep === "result") {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-background via-muted/30 to-background p-6">
        <div className="max-w-[1800px] mx-auto">
          <PortfolioBuilderNav />
          <PortfolioBuilderResultStep
            isGenerating={isGenerating}
            generatedHtml={generatedHtml}
            subdomainName={subdomainName}
            onBack={handleBack}
            onOpenInNewTab={openInNewTab}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-background via-muted/30 to-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <PortfolioBuilderNav />
        <PortfolioBuilderHero />
        <PortfolioBuilderConfigStep
          selectedWireframe={selectedWireframe}
          selectedTheme={selectedTheme}
          customTheme={customTheme}
          useCustomTheme={useCustomTheme}
          selectedFields={selectedFields}
          availableFields={availableFields}
          isGenerating={isGenerating}
          onWireframeChange={setSelectedWireframe}
          onThemeChange={(value) => setSelectedTheme(value || null)}
          onCustomThemeChange={setCustomTheme}
          onUseCustomThemeChange={setUseCustomTheme}
          onCVSourceChange={setCvSource}
          onToggleField={toggleField}
          onGenerate={handleGenerate}
        />
      </div>
    </div>
  );
}
