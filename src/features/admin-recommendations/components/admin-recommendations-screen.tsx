// Admin panel for recompute + ML health checks on the recommendation pipeline.

"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, RefreshCw, Activity, Shield, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  triggerRecompute,
  triggerCleanup,
  checkMlHealth,
  type ComputeResult,
  type CleanupResult,
  type MlHealth,
} from "@/lib/api/admin-recommendations-client";

export function AdminRecommendationsScreen() {
  const [computing, setComputing] = useState(false);
  const [healthChecking, setHealthChecking] = useState(false);
  const [cleaning, setCleaning] = useState(false);
  const [lastCompute, setLastCompute] = useState<ComputeResult | null>(null);
  const [lastHealth, setLastHealth] = useState<MlHealth | null>(null);
  const [lastCleanup, setLastCleanup] = useState<CleanupResult | null>(null);
  const [computeError, setComputeError] = useState<string | null>(null);
  const [healthError, setHealthError] = useState<string | null>(null);
  const [cleanupError, setCleanupError] = useState<string | null>(null);

  // Click handler that triggers a full score rebuild and reports the result.
  async function onRecompute() {
    setComputing(true);
    setComputeError(null);
    try {
      const result = await triggerRecompute();
      setLastCompute(result);
      toast.success(`Recomputed ${result.pairsWritten} score rows in ${result.durationMs}ms`);
    } catch (err) {
      const msg = (err as Error).message;
      setComputeError(msg);
      toast.error(`Recompute failed: ${msg}`);
    } finally {
      setComputing(false);
    }
  }

  // Click handler that runs the retention cleanup on demand and reports rows deleted per table.
  async function onCleanup() {
    setCleaning(true);
    setCleanupError(null);
    try {
      const result = await triggerCleanup();
      setLastCleanup(result);
      const total = result.offerViewsDeleted + result.offerImpressionsDeleted + result.searchQueriesDeleted;
      toast.success(`Cleanup removed ${total} aged event rows in ${result.durationMs}ms`);
    } catch (err) {
      const msg = (err as Error).message;
      setCleanupError(msg);
      toast.error(`Cleanup failed: ${msg}`);
    } finally {
      setCleaning(false);
    }
  }

  // Click handler that probes the Python ML sidecar through the backend.
  async function onMlHealth() {
    setHealthChecking(true);
    setHealthError(null);
    try {
      const result = await checkMlHealth();
      setLastHealth(result);
      toast[result.reachable ? "success" : "warning"](
        result.reachable ? `ML reachable (${result.modelVersion ?? "?"})` : "ML sidecar unreachable",
      );
    } catch (err) {
      const msg = (err as Error).message;
      setHealthError(msg);
      toast.error(`Health check failed: ${msg}`);
    } finally {
      setHealthChecking(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-5xl px-6 py-10 space-y-8">
        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-primary/10 text-primary p-3">
            <Shield className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">
              Recommendation Admin
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Trigger score recomputation and check the ML sidecar.
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-primary" />
                <CardTitle>Recompute scores</CardTitle>
              </div>
              <CardDescription>
                Rebuilds the RecommendationScore table for every active student × offer pair.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={onRecompute} disabled={computing} className="w-full">
                {computing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Computing…
                  </>
                ) : (
                  "Trigger recompute"
                )}
              </Button>

              {computeError && (
                <p className="text-sm text-destructive">{computeError}</p>
              )}

              {lastCompute && (
                <div className="rounded-lg border bg-muted/40 p-4 text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Students</span>
                    <span className="font-medium">{lastCompute.studentsProcessed}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Offers</span>
                    <span className="font-medium">{lastCompute.offersConsidered}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Score rows written</span>
                    <span className="font-medium">{lastCompute.pairsWritten}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-medium">{lastCompute.durationMs}ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Model</span>
                    <Badge variant="secondary">{lastCompute.modelVersion}</Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Trash2 className="h-4 w-4 text-primary" />
                <CardTitle>Event cleanup</CardTitle>
              </div>
              <CardDescription>
                Prunes aged OfferView (6mo), OfferImpression (3mo), and SearchQuery (6mo) rows. Bookmarks are kept.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={onCleanup} disabled={cleaning} variant="secondary" className="w-full">
                {cleaning ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Cleaning…
                  </>
                ) : (
                  "Run cleanup"
                )}
              </Button>

              {cleanupError && (
                <p className="text-sm text-destructive">{cleanupError}</p>
              )}

              {lastCleanup && (
                <div className="rounded-lg border bg-muted/40 p-4 text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">OfferView deleted</span>
                    <span className="font-medium">{lastCleanup.offerViewsDeleted}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">OfferImpression deleted</span>
                    <span className="font-medium">{lastCleanup.offerImpressionsDeleted}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">SearchQuery deleted</span>
                    <span className="font-medium">{lastCleanup.searchQueriesDeleted}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Duration</span>
                    <span className="font-medium">{lastCleanup.durationMs}ms</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary" />
                <CardTitle>ML sidecar health</CardTitle>
              </div>
              <CardDescription>
                Pings the Python ML service through the backend and reports its model version.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={onMlHealth} disabled={healthChecking} variant="secondary" className="w-full">
                {healthChecking ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Checking…
                  </>
                ) : (
                  "Check ML health"
                )}
              </Button>

              {healthError && (
                <p className="text-sm text-destructive">{healthError}</p>
              )}

              {lastHealth && (
                <div className="rounded-lg border bg-muted/40 p-4 text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Reachable</span>
                    <Badge variant={lastHealth.reachable ? "default" : "destructive"}>
                      {lastHealth.reachable ? "yes" : "no"}
                    </Badge>
                  </div>
                  {lastHealth.status && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status</span>
                      <span className="font-medium">{lastHealth.status}</span>
                    </div>
                  )}
                  {lastHealth.modelVersion && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Model</span>
                      <Badge variant="secondary">{lastHealth.modelVersion}</Badge>
                    </div>
                  )}
                  {lastHealth.modelsLoaded && lastHealth.modelsLoaded.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Loaded</span>
                      <span className="font-medium">{lastHealth.modelsLoaded.join(", ")}</span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}