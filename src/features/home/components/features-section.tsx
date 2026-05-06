import { Sparkles } from "lucide-react";
import { CareerGpsCard } from "./feature-cards/career-gps-card";
import { CvOptimizerCard } from "./feature-cards/cv-optimizer-card";
import { JobMatchingCard } from "./feature-cards/job-matching-card";
import { PortfolioGeneratorCard } from "./feature-cards/portfolio-generator-card";
import { PrivacySecurityCard } from "./feature-cards/privacy-security-card";
import { VirtualInterviewerCard } from "./feature-cards/virtual-interviewer-card";

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
      <div className="container mx-auto max-w-7xl relative">
        <div className="text-center mb-20 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
            <span className="text-sm font-semibold text-primary">
              The Complete Toolkit
            </span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold font-heading bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
            Your Career Arsenal
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Six powerful tools working in harmony to transform your job search
            from overwhelming to unstoppable
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <CvOptimizerCard />
          <CareerGpsCard />
          <JobMatchingCard />
          <VirtualInterviewerCard />
          <PortfolioGeneratorCard />
          <PrivacySecurityCard />
        </div>
      </div>
    </section>
  );
}
