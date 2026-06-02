"use client";

import { cn } from "@/lib/utils";

interface CircularProgressProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  showLabel?: boolean;
  label?: string;
}

export function CircularProgress({
  value,
  size = 180,
  strokeWidth = 12,
  className,
  showLabel = true,
  label,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const center = size / 2;

  const getColor = (val: number) => {
    if (val >= 75) return { start: "#05e34f", end: "#04c945" };
    if (val >= 50) return { start: "#eab308", end: "#facc15" };
    if (val >= 30) return { start: "#f97316", end: "#fb923c" };
    return { start: "#ef4444", end: "#f87171" };
  };

  const colors = getColor(value);

  const getTextColor = (val: number) => {
    if (val >= 75) return "#05e34f";
    if (val >= 50) return "#eab308";
    if (val >= 30) return "#f97316";
    return "#ef4444";
  };

  const getDefaultLabel = (val: number) => {
    if (val >= 75) return "Well positioned";
    if (val >= 50) return "On the right track";
    if (val >= 30) return "Keep building";
    return "Needs focus";
  };

  return (
    <div
      className={cn(
        "relative inline-flex items-center justify-center",
        className,
      )}
    >
      <svg width={size} height={size} className="transform -rotate-90">
        <defs>
          <linearGradient
            id={`gradient-${value}`}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor={colors.start} />
            <stop offset="100%" stopColor={colors.end} />
          </linearGradient>
          <filter
            id={`glow-${value}`}
            x="-50%"
            y="-50%"
            width="200%"
            height="200%"
          >
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted dark:text-muted"
        />
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={`url(#gradient-${value})`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
        />
      </svg>

      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div
              className="text-6xl font-bold tracking-tight"
              style={{ color: getTextColor(value) }}
            >
              {value}%
            </div>
            <div className="text-base text-muted-foreground mt-3 font-bold">
              {label ?? getDefaultLabel(value)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}