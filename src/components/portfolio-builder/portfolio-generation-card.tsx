"use client";

import Link from "next/link";
import { format } from "date-fns";
import type { PortfolioGenerationRecord } from "@/lib/api/portfolio-builder";

interface PortfolioGenerationCardProps {
  generation: PortfolioGenerationRecord;
}

export function PortfolioGenerationCard({ generation }: PortfolioGenerationCardProps) {
  const formattedDate = format(new Date(generation.created_at), "MMM dd, yyyy");

  return (
    <Link href={`/services/portfolio-builder/database/${generation.id}`}>
      <div className="group cursor-pointer overflow-hidden rounded-xl border border-border/60 bg-card/80 backdrop-blur-md transition-all duration-200 hover:bg-card hover:shadow-lg hover:shadow-primary/10 hover:border-primary/30 dark:hover:shadow-primary/5">
        <div className="p-5 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-base font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
              {generation.wireframe} / {generation.theme}
            </h3>
          </div>

          <p className="text-xs text-muted-foreground line-clamp-3">
            {generation.html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()}
          </p>

          <div className="pt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>{formattedDate}</span>
            <span>Open</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
