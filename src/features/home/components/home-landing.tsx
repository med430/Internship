import { LandingFooter } from "@/components/shared/landing-footer";
import { LandingNav } from "@/components/shared/landing-nav";
import { CtaSection } from "./cta-section";
import { FaqBlock } from "./faq-block";
import { FeaturesSection } from "./features-section";
import { HeroSection } from "./hero-section";
import { PricingBlock } from "./pricing-block";
import { SecuritySection } from "./security-section";
import { TrustedSection } from "./trusted-section";

export function HomeLanding() {
  return (
    <div className="min-h-screen w-full bg-background">
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
      <div
        className="fixed inset-0 opacity-[0.08] mix-blend-overlay -z-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='3.4' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "140px 140px",
        }}
      />

      <LandingNav />
      <HeroSection />
      <TrustedSection />
      <FeaturesSection />
      <SecuritySection />
      <PricingBlock />
      <FaqBlock />
      <CtaSection />
      <LandingFooter />
    </div>
  );
}
