"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Crown, Zap, Loader2, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSubscriptionStore } from "@/lib/stores/subscription-store";

interface SubscriptionGateProps {
  /** Display name shown in the paywall — e.g. "AI CV Rewriter" */
  featureName: string;
  children: React.ReactNode;
}

/**
 * Wraps any PRO-only feature page.
 *
 * - While the subscription status is loading (or not yet fetched), shows a
 *   spinner so there is no flash of the wrong content.
 * - If the user is FREE, renders a paywall with an upgrade CTA instead of the
 *   feature.
 * - If the user is PRO, renders children normally.
 *
 * The Zustand store is already warm when UserNav mounts (it calls fetchStatus
 * on every page load), so in practice this guard is instant.
 */
export function SubscriptionGate({ featureName, children }: SubscriptionGateProps) {
  const { isPro, isLoading, type, fetchStatus } = useSubscriptionStore();
  const router = useRouter();

  useEffect(() => {
    // Safety-net: fetch if nothing is cached yet (e.g. direct deep-link before
    // UserNav has mounted, or Zustand store was reset).
    if (type === null && !isLoading) {
      fetchStatus();
    }
  }, [type, isLoading, fetchStatus]);

  // ── Loading state ───────────────────────────────────────────────────────────
  if (isLoading || type === null) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // ── Paywall ─────────────────────────────────────────────────────────────────
  if (!isPro) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 py-16 text-center">
        <div className="relative mb-6">
          <div className="flex items-center justify-center h-24 w-24 rounded-full bg-muted">
            <Lock className="h-10 w-10 text-muted-foreground" />
          </div>
          <div className="absolute -top-1 -right-1 flex items-center justify-center h-8 w-8 rounded-full bg-amber-500 shadow-md">
            <Crown className="h-4 w-4 text-white" />
          </div>
        </div>

        <h2 className="text-2xl font-bold mb-2">Pro Feature</h2>
        <p className="text-muted-foreground mb-1 max-w-md">
          <span className="font-semibold text-foreground">{featureName}</span> is
          available on the Pro plan.
        </p>
        <p className="text-sm text-muted-foreground mb-8 max-w-sm">
          Upgrade to unlock all AI-powered tools and accelerate your career.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            size="lg"
            className="bg-amber-500 hover:bg-amber-600 text-white"
            onClick={() => router.push("/services/subscription")}
          >
            <Zap className="h-4 w-4 mr-2" />
            Upgrade to Pro
          </Button>
          <Button variant="outline" size="lg" onClick={() => router.back()}>
            Go back
          </Button>
        </div>
      </div>
    );
  }

  // ── Authorised ──────────────────────────────────────────────────────────────
  return <>{children}</>;
}
