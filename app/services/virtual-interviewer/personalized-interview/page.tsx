import { SubscriptionGate } from "@/components/shared/subscription-gate";
import { PersonalizedInterviewScreen } from "@/features/personalized_interview_simulator/components/personalized-interview-screen";

export default function PersonalizedInterviewPage() {
  return (
    <SubscriptionGate featureName="AI Virtual Interviewer">
      <PersonalizedInterviewScreen />
    </SubscriptionGate>
  );
}
