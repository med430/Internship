import { CareerGuideScreen } from "@/features/career-guide/components/career-guide-screen";
import { SubscriptionGate } from "@/components/shared/subscription-gate";

export default function CareerGuidePage() {
  return (
    <SubscriptionGate featureName="AI Career Guide">
      <CareerGuideScreen />
    </SubscriptionGate>
  );
}
