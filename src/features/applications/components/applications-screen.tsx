"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  fetchMyApplications,
  type StudentApplication,
  withdrawApplication,
} from "@/lib/api/applications";

export function StudentApplicationsScreen() {
  const [applications, setApplications] = useState<StudentApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetchMyApplications(1, 200);
      setApplications(data);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load applications",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const sortedApplications = useMemo(
    () =>
      [...applications].sort((a, b) => {
        const left = new Date(a.createdAt).getTime();
        const right = new Date(b.createdAt).getTime();
        return right - left;
      }),
    [applications],
  );

  const onWithdraw = async (applicationId: string) => {
    setWithdrawingId(applicationId);
    try {
      await withdrawApplication(applicationId);
      toast.success("Application withdrawn");
      await load();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to withdraw");
    } finally {
      setWithdrawingId(null);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">My Applications</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Track your submitted offers and their latest status.
        </p>
      </div>

      {loading ? (
        <div className="text-sm text-muted-foreground">Loading applications...</div>
      ) : sortedApplications.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No applications yet.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {sortedApplications.map((application) => {
            const canWithdraw =
              application.status !== "ACCEPTED" &&
              application.status !== "REJECTED" &&
              application.status !== "WITHDRAWN";

            return (
              <Card key={application.id}>
                <CardHeader>
                  <CardTitle className="text-lg">
                    {application.offer?.title || "Offer"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    {application.offer?.company || "Unknown company"}
                    {application.offer?.location
                      ? ` • ${application.offer.location}`
                      : ""}
                  </div>
                  <div className="text-sm">
                    Status: <span className="font-medium">{application.status}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Submitted: {new Date(application.createdAt).toLocaleString()}
                  </div>
                  <div className="flex justify-end">
                    {canWithdraw ? (
                      <Button
                        variant="outline"
                        onClick={() => onWithdraw(application.id)}
                        disabled={withdrawingId === application.id}
                      >
                        {withdrawingId === application.id
                          ? "Withdrawing..."
                          : "Withdraw"}
                      </Button>
                    ) : null}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default StudentApplicationsScreen;
