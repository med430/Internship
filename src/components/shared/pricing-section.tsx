"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import Link from "next/link";

const pricingTiers = [
  {
    name: "Starter",
    price: { monthly: 0, annual: 0 },
    description: "Perfect for exploring OnBoard",
    features: [
      "Basic CV analysis",
      "Up to 5 job matches per week",
      "Career roadmap access",
      "Community support",
      "Basic portfolio builder",
    ],
    cta: "Get Started",
    highlighted: false,
  },
  {
    name: "Pro",
    price: { monthly: 29, annual: 240 },
    description: "Best for active job seekers",
    features: [
      "Unlimited CV optimization",
      "Unlimited job matching",
      "Priority matching algorithm",
      "Virtual interviewer access",
      "Advanced career guidance",
      "Professional portfolio themes",
      "Email support",
      "Resume anonymization",
    ],
    cta: "Start Free Trial",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: { monthly: 99, annual: 900 },
    description: "For teams and organizations",
    features: [
      "Everything in Pro",
      "Team collaboration tools",
      "Custom integrations",
      "Dedicated account manager",
      "Priority support",
      "Advanced analytics",
      "SSO & advanced security",
      "Custom AI training",
      "API access",
    ],
    cta: "Contact Sales",
    highlighted: false,
  },
];

export function PricingSection() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-center gap-4 pb-10">
        <span
          className={`text-sm font-medium transition-colors ${
            !isAnnual ? "text-foreground" : "text-muted-foreground"
          }`}
        >
          Monthly
        </span>
        <Switch
          checked={isAnnual}
          onCheckedChange={setIsAnnual}
          aria-label="Toggle annual billing"
          className="h-7 w-14"
        />
        <span
          className={`text-sm font-medium transition-colors ${
            isAnnual ? "text-foreground" : "text-muted-foreground"
          }`}
        >
          Annual
          <span className="ml-1.5 text-xs text-primary font-semibold">
            Save 17%
          </span>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {pricingTiers.map((tier) => (
          <div
            key={tier.name}
            className={`relative rounded-2xl border ${
              tier.highlighted
                ? "border-primary shadow-lg shadow-primary/10 scale-105"
                : "border-border"
            } bg-card p-8 flex flex-col`}
          >
            {tier.highlighted && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full">
                Most Popular
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-2xl font-bold font-heading mb-2">
                {tier.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {tier.description}
              </p>
            </div>

            <div className="mb-8">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold font-heading">
                  $
                  {Math.floor(
                    isAnnual ? tier.price.annual / 12 : tier.price.monthly,
                  )}
                </span>
                <span className="text-muted-foreground">/month</span>
              </div>
              {isAnnual && tier.price.annual > 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  Billed ${tier.price.annual} annually
                </p>
              )}
            </div>

            <ul className="space-y-3 mb-8 flex-grow">
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              asChild
              variant={tier.highlighted ? "default" : "outline"}
              size="lg"
              className="w-full"
            >
              <Link href={tier.name === "Enterprise" ? "/contact" : "/signup"}>
                {tier.cta}
              </Link>
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
