"use client";

import { useEffect } from "react";
import Link from "next/link";
import { CheckCircle2, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubscriptionStore } from "@/lib/stores/subscription-store";

export default function SubscriptionSuccessPage() {
  const fetchStatus = useSubscriptionStore((s) => s.fetchStatus);

  // Refresh the Zustand store so the PRO crown appears on the avatar
  // immediately without requiring the user to navigate away and back.
  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      <div className="flex items-center justify-center h-20 w-20 rounded-full bg-amber-500/10 mb-4">
        <Crown className="h-10 w-10 text-amber-500" />
      </div>
      <h1 className="text-2xl font-bold mb-2">You&apos;re now on Pro!</h1>
      <p className="text-muted-foreground mb-6 max-w-sm">
        Your subscription is active. All AI-powered features are now unlocked.
      </p>
      <div className="flex gap-3">
        <Button asChild>
          <Link href="/services/dashboard">Go to Dashboard</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/services/cv-rewriter">Try CV Rewriter</Link>
        </Button>
      </div>
    </div>
  );
}
