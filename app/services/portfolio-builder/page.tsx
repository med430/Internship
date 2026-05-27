import { PortfolioBuilderScreen } from "@/features/portfolio-builder/components/portfolio-builder-screen";
import { SubscriptionGate } from "@/components/shared/subscription-gate";

export default function PortfolioBuilderPage() {
  return (
    <SubscriptionGate featureName="AI Portfolio Builder">
      <PortfolioBuilderScreen />
    </SubscriptionGate>
  );
}
