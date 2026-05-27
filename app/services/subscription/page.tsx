"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Zap, Loader2, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  getSubscriptionStatus,
  createCheckoutSession,
  createPortalSession,
  type SubscriptionType,
} from "@/lib/api/subscription";

const FREE_FEATURES = [
  "Browse job offers",
  "Apply to internships",
  "Basic profile",
  "Interview calendar",
  "Chat with recruiters",
];

const PAID_FEATURES = [
  "Everything in Free",
  "AI CV Rewriter",
  "AI Career Guide",
  "AI Portfolio Builder",
  "AI Virtual Interviewer",
  "Job Matcher",
  "Priority support",
];

export default function SubscriptionPage() {
  const router = useRouter();
  const [status, setStatus] = useState<SubscriptionType | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    getSubscriptionStatus()
      .then((s) => setStatus(s.type))
      .finally(() => setLoading(false));
  }, []);

  const handleUpgrade = async () => {
    setActionLoading(true);
    try {
      const url = await createCheckoutSession();
      window.location.href = url;
    } catch {
      setActionLoading(false);
    }
  };

  const handleManage = async () => {
    setActionLoading(true);
    try {
      const url = await createPortalSession();
      window.location.href = url;
    } catch {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const isPaid = status === "PAID";

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-2">Subscription</h1>
        <p className="text-muted-foreground">
          Unlock AI-powered tools to accelerate your career
        </p>
        {isPaid && (
          <Badge className="mt-3 bg-amber-500 hover:bg-amber-500 text-white gap-1">
            <Crown className="h-3 w-3" /> Pro Plan Active
          </Badge>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Free Plan */}
        <Card className={!isPaid ? "border-primary shadow-md" : ""}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Free</CardTitle>
              {!isPaid && <Badge variant="secondary">Current plan</Badge>}
            </div>
            <CardDescription>Everything you need to get started</CardDescription>
            <p className="text-3xl font-bold mt-2">
              $0 <span className="text-sm font-normal text-muted-foreground">/ month</span>
            </p>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" disabled>
              {isPaid ? "Downgrade" : "Current plan"}
            </Button>
          </CardFooter>
        </Card>

        {/* Pro Plan */}
        <Card className={`${isPaid ? "border-amber-400 shadow-md" : "border-primary shadow-lg"} relative overflow-hidden`}>
          {!isPaid && (
            <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs px-3 py-1 rounded-bl-lg font-medium">
              Recommended
            </div>
          )}
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-amber-500" />
                Pro
              </CardTitle>
              {isPaid && <Badge className="bg-amber-500 hover:bg-amber-500 text-white">Current plan</Badge>}
            </div>
            <CardDescription>Full AI-powered career acceleration</CardDescription>
            <p className="text-3xl font-bold mt-2">
              $9.99 <span className="text-sm font-normal text-muted-foreground">/ month</span>
            </p>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {PAID_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            {isPaid ? (
              <Button
                variant="outline"
                className="w-full"
                onClick={handleManage}
                disabled={actionLoading}
              >
                {actionLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Manage subscription
              </Button>
            ) : (
              <Button
                className="w-full"
                onClick={handleUpgrade}
                disabled={actionLoading}
              >
                {actionLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Upgrade to Pro
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>

      <p className="text-center text-xs text-muted-foreground mt-8">
        Payments are securely processed by Stripe. Cancel anytime.
      </p>
    </div>
  );
}
