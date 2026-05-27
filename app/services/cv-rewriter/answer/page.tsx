import { CVRewriterAnswerScreen } from "@/features/cv-rewriter/components/cv-rewriter-answer-screen";
import { SubscriptionGate } from "@/components/shared/subscription-gate";

export default function CVRewriterAnswerPage() {
  return (
    <SubscriptionGate featureName="AI CV Rewriter">
      <CVRewriterAnswerScreen />
    </SubscriptionGate>
  );
}
