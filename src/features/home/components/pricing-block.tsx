import { PricingSection } from "@/components/shared/pricing-section";

export function PricingBlock() {
  return (
    <section id="pricing" className="py-24 px-6">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold font-heading">
            Simple, transparent pricing
          </h2>
          <p className="text-lg text-muted-foreground">
            Choose the plan that fits your needs. Upgrade or downgrade anytime.
          </p>
        </div>

        <PricingSection />
      </div>
    </section>
  );
}
