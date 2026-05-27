import { CVRewriterScreen } from "@/features/cv-rewriter/components/cv-rewriter-screen";
import { SubscriptionGate } from "@/components/shared/subscription-gate";

export default function CVRewriterPage() {
  return (
    <SubscriptionGate featureName="AI CV Rewriter">
      <CVRewriterScreen />
    </SubscriptionGate>
  );
}
