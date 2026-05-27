import { JobMatcherScreen } from "@/features/job-matcher/components/job-matcher-screen";
import { SubscriptionGate } from "@/components/shared/subscription-gate";

export default function JobMatcherPage() {
  return (
    <SubscriptionGate featureName="Job Matcher">
      <JobMatcherScreen />
    </SubscriptionGate>
  );
}
