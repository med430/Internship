"use client";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);
import Link from "next/link";
import Image from "next/image";
import {
  MapPin,
  Building2,
  Clock,
  Bookmark,
  ArrowUpRight,
  Wallet,
  CalendarClock,
  Globe2,
} from "lucide-react";

import { cn, toTitleCase, formatTag } from "@/lib/utils";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { JobCardProps } from "@/types/job-matcher";

const JobCard = ({
  jobId,
  title,
  company,
  companyLogo,
  location,
  employmentType,
  workModel,
  postedAt,
  matchScore,
  description,
  isSaved = false,
  isPaid,
  applicationDeadline,
  onSave,
  onView,
}: JobCardProps) => {
  const displayScore = Math.round(matchScore);

  // Match score colour ramp — green → blue → violet → orange.
  const matchTone =
    displayScore >= 80
      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:text-emerald-400"
      : displayScore >= 65
        ? "bg-blue-500/10 text-blue-600 border-blue-500/30 dark:text-blue-400"
        : displayScore >= 50
          ? "bg-violet-500/10 text-violet-600 border-violet-500/30 dark:text-violet-400"
          : "bg-orange-500/10 text-orange-600 border-orange-500/30 dark:text-orange-400";

  const daysLeft = applicationDeadline
    ? Math.ceil((applicationDeadline.getTime() - Date.now()) / 86_400_000)
    : null;
  const isUrgent = daysLeft !== null && daysLeft > 0 && daysLeft <= 3;

  return (
    <Link
      href={`/services/offers/${jobId}`}
      onClick={() => onView?.(jobId)}
      className="group block focus:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-xl"
    >
      <article className="flex flex-col h-full rounded-xl border border-border/60 bg-card hover:border-primary/40 hover:shadow-md hover:shadow-primary/5 transition-all duration-200">
        {/* Header — company + match chip */}
        <header className="flex items-start justify-between gap-3 p-5 pb-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {companyLogo ? (
              <div className="w-10 h-10 rounded-lg overflow-hidden border border-border/60 flex-shrink-0 bg-background">
                <Image
                  src={companyLogo}
                  width={40}
                  height={40}
                  alt={company}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/15 to-primary/5 border border-border/60 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-4 h-4 text-primary" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-foreground truncate">
                {company}
              </p>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <Clock className="w-3 h-3" />
                {dayjs(postedAt).fromNow()}
              </p>
            </div>
          </div>

          <div
            className={cn(
              "shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold tabular-nums",
              matchTone,
            )}
          >
            {displayScore}% match
          </div>
        </header>

        {/* Title + meta */}
        <div className="px-5 space-y-2">
          <h3 className="font-semibold text-base leading-snug text-foreground line-clamp-2 group-hover:text-primary transition-colors">
            {title}
          </h3>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {toTitleCase(location || "—")}
            </span>
            {employmentType && (
              <>
                <span className="text-border">·</span>
                <span>{formatTag(employmentType)}</span>
              </>
            )}
            {workModel && (
              <>
                <span className="text-border">·</span>
                <span className="inline-flex items-center gap-1">
                  <Globe2 className="w-3.5 h-3.5" />
                  {formatTag(workModel)}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Description excerpt */}
        <div className="px-5 mt-3 flex-1">
          <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
            {description || "No description available."}
          </p>
        </div>

        {/* Status chips */}
        <div className="flex flex-wrap items-center gap-1.5 px-5 mt-4">
          {isPaid !== undefined && (
            <Badge
              variant="outline"
              className={cn(
                "text-[11px] font-medium gap-1 border",
                isPaid
                  ? "border-emerald-500/30 text-emerald-700 dark:text-emerald-400 bg-emerald-500/5"
                  : "border-border text-muted-foreground bg-muted/30",
              )}
            >
              <Wallet className="w-3 h-3" />
              {isPaid ? "Paid" : "Unpaid"}
            </Badge>
          )}
          {daysLeft !== null && daysLeft > 0 && (
            <Badge
              variant="outline"
              className={cn(
                "text-[11px] font-medium gap-1 border",
                isUrgent
                  ? "border-orange-500/30 text-orange-600 dark:text-orange-400 bg-orange-500/10"
                  : "border-border text-muted-foreground bg-muted/30",
              )}
            >
              <CalendarClock className="w-3 h-3" />
              {daysLeft}d left
            </Badge>
          )}
        </div>

        {/* Footer — bookmark + view details */}
        <footer className="flex items-center gap-2 p-4 mt-4 border-t border-border/40">
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-9 w-9 rounded-lg",
              isSaved
                ? "text-blue-500 bg-blue-500/10 hover:bg-blue-500/20"
                : "hover:bg-muted",
            )}
            aria-label={isSaved ? "Unsave" : "Save"}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onSave?.(jobId);
            }}
          >
            <Bookmark className={cn("w-4 h-4", isSaved && "fill-current")} />
          </Button>

          <div className="flex-1 inline-flex items-center justify-end text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
            View details
            <ArrowUpRight className="w-4 h-4 ml-1" />
          </div>
        </footer>
      </article>
    </Link>
  );
};

export default JobCard;
