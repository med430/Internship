"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Crown } from "lucide-react";
import type { Database } from "@/types/database.types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface SubscriptionTabProps {
  profile: Profile;
}

export function SubscriptionTab({ profile }: SubscriptionTabProps) {
  const subscription = profile.subscription || "Starter";
  const endDate = profile.subscription_end_date;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription Plan</CardTitle>
        <CardDescription>Manage your subscription and billing</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6">
        <div className="flex flex-col gap-3 sm:gap-4 items-start p-3 sm:p-6 rounded-lg border-2 bg-gradient-to-br from-primary/5 to-primary/10 md:flex-row md:items-center md:justify-between md:gap-0">
          <div className="space-y-2 min-w-0">
            <div className="flex items-center gap-2">
              <Crown className="w-5 h-5 text-primary flex-shrink-0" />
              <p className="text-base sm:text-lg font-semibold">Current Plan</p>
              <Badge
                variant={subscription === "Starter" ? "secondary" : "default"}
                className="text-xs sm:text-sm px-2 py-0.5"
              >
                {subscription}
              </Badge>
            </div>
            {endDate && (
              <span className="text-xs sm:text-sm text-muted-foreground">
                Until {new Date(endDate).toLocaleDateString()}
              </span>
            )}
          </div>

          {subscription === "Starter" && (
            <Button size="sm" className="w-full sm:w-auto md:self-center">
              Upgrade Plan
            </Button>
          )}
        </div>

        {/* Placeholder for subscription management */}
        <div className="space-y-3 sm:space-y-4 p-3 sm:p-6 rounded-lg border bg-muted/50">
          <h3 className="text-sm sm:text-base font-semibold">
            Subscription Management
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Subscription management features will be available soon. You&apos;ll
            be able to:
          </p>
          <ul className="text-xs sm:text-sm text-muted-foreground space-y-1 sm:space-y-2 list-disc list-inside">
            <li>Upgrade or downgrade your plan</li>
            <li>View billing history</li>
            <li>Update payment methods</li>
            <li>Cancel subscription</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
