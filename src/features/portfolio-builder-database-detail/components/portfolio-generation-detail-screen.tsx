"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PortfolioBuilderNav } from "@/components/portfolio-builder/portfolio-builder-nav";
import {
  fetchPortfolioGenerationById,
  type PortfolioGenerationRecord,
} from "@/lib/api/portfolio-builder";

interface PortfolioGenerationDetailScreenProps {
  generationId: string;
}

export function PortfolioGenerationDetailScreen({
  generationId,
}: PortfolioGenerationDetailScreenProps) {
  const [generation, setGeneration] = useState<PortfolioGenerationRecord | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadGeneration() {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchPortfolioGenerationById(generationId);
        setGeneration(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load portfolio generation",
        );
      } finally {
        setLoading(false);
      }
    }

    void loadGeneration();
  }, [generationId]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background px-6 py-10">
      <div className="container mx-auto max-w-7xl">
        <PortfolioBuilderNav />

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-medium tracking-tight text-foreground">
              Portfolio Preview
            </h1>
            <p className="mt-1 text-xs text-muted-foreground">
              Review your generated portfolio page.
            </p>
          </div>
          <Button asChild variant="outline" className="flex-shrink-0">
            <Link href="/services/portfolio-builder/database">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to History
            </Link>
          </Button>
        </div>

        {error && (
          <div className="mb-6 rounded-lg border border-red-200/40 bg-red-50/50 backdrop-blur p-4 text-xs text-red-600 dark:border-red-800/40 dark:bg-red-900/20 dark:text-red-400">
            {error}
          </div>
        )}

        <Card className="p-4 rounded-2xl bg-card/80 backdrop-blur-xl border border-border shadow-lg shadow-primary/5 h-[calc(100vh-16rem)]">
          {loading ? (
            <div className="space-y-4 p-4">
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-[calc(100vh-23rem)] w-full" />
            </div>
          ) : generation ? (
            <iframe
              srcDoc={generation.html}
              className="w-full h-full rounded-lg border border-border"
              title="Portfolio Generation Preview"
              sandbox="allow-scripts"
            />
          ) : null}
        </Card>
      </div>
    </div>
  );
}
