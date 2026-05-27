import { VirtualInterviewerSetupScreen } from "@/features/virtual-interviewer-setup/components/virtual-interviewer-setup-screen";
import { SubscriptionGate } from "@/components/shared/subscription-gate";

export default function VirtualInterviewerPage() {
  return (
    <SubscriptionGate featureName="AI Virtual Interviewer">
      <VirtualInterviewerSetupScreen />
    </SubscriptionGate>
  );
}
