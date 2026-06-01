"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Navigation, MapPin, Flag, Zap, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface RoadmapSectionProps {
  roadmap: string[];
}

export function RoadmapSection({ roadmap }: RoadmapSectionProps) {
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);

  const stepIcons = [MapPin, Navigation, Zap, Target, Flag];

  if (!roadmap || roadmap.length === 0) return null;

  return (
    <Card className="p-6 rounded-2xl bg-card/80 backdrop-blur-xl border border-border shadow-lg shadow-primary/5">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground mb-1">
          Career Roadmap
        </h2>
        <p className="text-sm text-muted-foreground">
          Follow this path to reach your career goals
        </p>
      </div>

      {/* Mobile: simple vertical list */}
      <div className="flex flex-col gap-4 md:hidden">
        {roadmap.map((step, index) => {
          const Icon = stepIcons[index] ?? Navigation;
          return (
            <div
              key={index}
              className="flex gap-4 items-start p-4 rounded-xl border border-border bg-card"
            >
              <div className="shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-bold">
                {index + 1}
              </div>
              <div className="flex-1">
                <div className="inline-flex p-1.5 rounded-lg bg-primary/10 mb-2">
                  <Icon className="h-4 w-4 text-primary" />
                </div>
                <p className="text-sm leading-relaxed text-foreground/90">{step}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop: zigzag GPS-style map */}
      <div className="relative hidden md:block">
        {roadmap.map((step, index) => {
          const isEven = index % 2 === 0;
          const Icon = stepIcons[index] ?? Navigation;
          const isHovered = hoveredStep === index;
          const isLast = index === roadmap.length - 1;

          return (
            <div
              key={index}
              className={cn(
                "relative mb-6 lg:mb-20 flex items-start",
                isEven ? "justify-start" : "justify-end",
              )}
            >
              {/* SVG connector to next step */}
              {!isLast && (
                <div
                  className="absolute top-full left-0 w-full pointer-events-none"
                  style={{ height: "5rem", zIndex: 1 }}
                >
                  <svg
                    className="w-full h-full overflow-visible"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                  >
                    <path
                      d={
                        isEven
                          ? "M 22 0 C 22 30, 42 50, 50 50 C 58 50, 78 70, 78 100"
                          : "M 78 0 C 78 30, 58 50, 50 50 C 42 50, 22 70, 22 100"
                      }
                      className="stroke-primary"
                      strokeWidth="2.5"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray="6 4"
                      strokeOpacity="0.5"
                    />
                  </svg>
                </div>
              )}

              {/* Step card */}
              <div
                className={cn(
                  "relative w-full lg:w-[44%] transform transition-all duration-300 ease-out",
                  isHovered && "scale-[1.02]",
                )}
                style={{ zIndex: 10 }}
                onMouseEnter={() => setHoveredStep(index)}
                onMouseLeave={() => setHoveredStep(null)}
              >
                <div
                  className={cn(
                    "relative p-4 rounded-xl border transition-all duration-300 bg-card border-border",
                    isHovered && "shadow-lg shadow-primary/15 border-primary/50",
                  )}
                >
                  {/* Step number badge */}
                  <div
                    className={cn(
                      "absolute -top-2.5 -left-2.5 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow-md transition-all duration-300 bg-primary text-primary-foreground",
                      isHovered && "scale-110",
                    )}
                  >
                    {index + 1}
                  </div>

                  <div
                    className={cn(
                      "inline-flex p-2 rounded-lg mb-3 transition-all duration-300 bg-primary/10",
                      isHovered && "bg-primary/20 scale-105",
                    )}
                  >
                    <Icon className="h-4 w-4 text-primary" />
                  </div>

                  <p className="text-sm leading-relaxed text-foreground/90">
                    {step}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
