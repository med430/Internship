import Link from "next/link";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SubscriptionCancelPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      <XCircle className="h-16 w-16 text-muted-foreground mb-4" />
      <h1 className="text-2xl font-bold mb-2">Payment cancelled</h1>
      <p className="text-muted-foreground mb-6 max-w-sm">
        No charge was made. You can upgrade whenever you&apos;re ready.
      </p>
      <div className="flex gap-3">
        <Button asChild>
          <Link href="/services/subscription">View Plans</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/services/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
