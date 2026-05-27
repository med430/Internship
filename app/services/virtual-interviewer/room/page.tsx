import { InterviewRoomScreen } from "@/features/virtual-interviewer-room/components/interview-room-screen";
import { SubscriptionGate } from "@/components/shared/subscription-gate";

export default function InterviewRoomPage() {
  return (
    <SubscriptionGate featureName="AI Virtual Interviewer">
      <InterviewRoomScreen />
    </SubscriptionGate>
  );
}
