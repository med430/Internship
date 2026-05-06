"use client";

import { Star, Radar } from "lucide-react";

export default function JobMatcherHero() {
  return (
    <div className="relative mb-6 overflow-hidden rounded-2xl border border-border/40">
      {/* Slightly shorter on Y axis than other heroes */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-cyan-50 to-emerald-50 opacity-90 dark:from-emerald-900/20 dark:via-cyan-900/20 dark:to-emerald-900/20" />

      {/* subtle noise texture for richness */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='3.5' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(#noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "128px 128px",
        }}
      />

      <div className="relative px-4 py-6 md:px-8 md:py-8">
        <div className="grid md:grid-cols-2 items-center gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-100/70 border border-emerald-200 dark:bg-emerald-900/20 dark:border-emerald-800">
              <Star className="h-3 w-3 text-emerald-600" />
              <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-200">
                AI Matchmaking
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground leading-tight">
              Find the right role —{" "}
              <span className="bg-gradient-to-r from-emerald-500 to-cyan-400 bg-clip-text text-transparent">
                faster and smarter
              </span>
            </h1>

            <p className="text-sm md:text-base text-muted-foreground max-w-xl">
              We analyze your resume and preferences then match you to roles
              with better alignment and fit.
            </p>

            {/* Compact stats row to match other heroes (no CTAs) */}
            <div className="flex flex-wrap gap-x-3 gap-y-1.5 pt-1">
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
                <span className="text-xs text-foreground/80">
                  Personalized fit
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 dark:bg-cyan-300" />
                <span className="text-xs text-foreground/80">
                  Priority alerts
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-300" />
                <span className="text-xs text-foreground/80">
                  Tailored matches
                </span>
              </div>
            </div>
          </div>

          {/* Right: floating shapes & orbs */}
          <div className="relative hidden md:flex justify-center items-center">
            <div className="relative w-[240px] h-32">
              {/* Blurry background blobs */}
              <div className="absolute -left-6 top-1 w-24 h-24 rounded-full bg-emerald-300/40 blur-2xl dark:bg-emerald-700/30" />
              <div className="absolute -right-4 -top-4 w-28 h-28 rounded-full bg-cyan-300/30 blur-2xl dark:bg-cyan-700/20" />

              {/* floating shapes */}
              <div className="absolute left-4 top-4 p-2 rounded-lg bg-card/80 border border-border/40 shadow-md transform transition-all hover:-translate-y-1">
                <div className="flex items-center gap-1.5">
                  <Radar className="w-4 h-4 text-cyan-500 dark:text-cyan-300" />
                  <div>
                    <div className="text-[11px] font-semibold text-foreground">
                      Role Radar
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      Match your goals
                    </div>
                  </div>
                </div>
              </div>

              {/* Hoverable orbs */}
              <div className="absolute bottom-4 right-4 flex gap-2 items-end">
                <div className="group relative">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-400 shadow-lg cursor-pointer transform transition-all duration-200 group-hover:scale-110" />
                </div>

                <div className="group relative">
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-300 to-emerald-100 shadow-md cursor-pointer transform transition-all duration-200 group-hover:scale-110 dark:from-emerald-700 dark:to-emerald-500" />
                </div>

                <div className="group relative">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-sky-300 to-cyan-200 shadow cursor-pointer transform transition-all duration-200 group-hover:scale-110 dark:from-sky-700 dark:to-cyan-500" />
                </div>
              </div>

              {/* small rotated accent panel */}
              <div className="absolute -right-4 bottom-6 w-20 h-20 rotate-12 rounded-lg bg-gradient-to-r from-emerald-200/60 to-cyan-200/55 border border-emerald-200/30 blur-md shadow-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
