"use client";

import Link from "next/link";
import { format } from "date-fns";
import { ExternalLink } from "lucide-react";
import type { PortfolioGenerationRecord } from "@/lib/api/portfolio-builder";

interface PortfolioGenerationCardProps {
  generation: PortfolioGenerationRecord;
}

export function PortfolioGenerationCard({ generation }: PortfolioGenerationCardProps) {
  const formattedDate = format(new Date(generation.created_at), "MMM dd, yyyy");
  const wireframeLabel =
    generation.wireframe.charAt(0).toUpperCase() + generation.wireframe.slice(1);
  const themeLabel =
    generation.theme.charAt(0).toUpperCase() + generation.theme.slice(1);

  return (
    <Link href={`/services/portfolio-builder/database/${generation.id}`}>
      <div className="group cursor-pointer overflow-hidden rounded-xl border border-border/60 bg-card/80 backdrop-blur-md transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 hover:border-primary/40 dark:hover:shadow-primary/5">

        {/* ── Scaled iframe thumbnail ──────────────────────────────────── */}
        <div
          className="relative overflow-hidden bg-muted/20 dark:bg-muted/10"
          style={{ height: "190px" }}
        >
          <iframe
            srcDoc={generation.html}
            sandbox="allow-scripts"
            className="absolute top-0 left-0 border-0 pointer-events-none select-none"
            style={{
              width: "1200px",
              height: "633px",
              transform: "scale(0.3)",
              transformOrigin: "top left",
            }}
            title={`${wireframeLabel} — ${themeLabel}`}
          />
          {/* Transparent overlay — blocks clicks on iframe */}
          <div className="absolute inset-0" />

          {/* "Open" hover badge */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/20 backdrop-blur-[2px]">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 dark:bg-neutral-900/90 text-xs font-semibold text-foreground shadow-sm">
              <ExternalLink className="h-3 w-3" />
              Open
            </span>
          </div>
        </div>

        {/* ── Card metadata ─────────────────────────────────────────────── */}
        <div className="p-4 space-y-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
              {wireframeLabel}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-muted text-muted-foreground border border-border">
              {themeLabel}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{formattedDate}</span>
            <span className="group-hover:text-primary transition-colors duration-200 font-medium">
              View →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}