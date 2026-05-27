import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  Building2,
  Clock,
  Bookmark,
  ExternalLink,
  Sparkles,
  Briefcase,
  Layers,
} from "lucide-react";

import {
  cn,
  toTitleCase,
  formatTag,
  filterAndDeduplicateTags,
} from "@/lib/utils";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { AnimatedCircularProgressBar } from "../ui/animated-circular-progress-bar";
import { JobCardProps } from "@/types/job-matcher";

const JobCard = ({
  jobId,
  title,
  company,
  companyLogo,
  location,
  employmentType,
  seniorityLevel,
  jobFunction,
  industries,
  postedAt,
  matchScore,
  description,
  platforms = [],
  sourceUrl,
  isSaved = false,
  onSave,
}: JobCardProps) => {
  const getMatchLevel = (score: number) => {
    if (score >= 90)
      return {
        label: "Excellent Match",
        primaryColor: "rgb(16, 185, 129)",
        secondaryColor: "rgb(209, 250, 229)",
        badgeClass:
          "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 border-emerald-500/20",
      };
    if (score >= 80)
      return {
        label: "Great Match",
        primaryColor: "rgb(59, 130, 246)",
        secondaryColor: "rgb(219, 234, 254)",
        badgeClass:
          "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 border-blue-500/20",
      };
    if (score >= 70)
      return {
        label: "Good Match",
        primaryColor: "rgb(139, 92, 246)",
        secondaryColor: "rgb(237, 233, 254)",
        badgeClass:
          "bg-violet-500/10 text-violet-600 dark:bg-violet-500/20 dark:text-violet-400 border-violet-500/20",
      };
    return {
      label: "Fair Match",
      primaryColor: "rgb(249, 115, 22)",
      secondaryColor: "rgb(254, 243, 199)",
      badgeClass:
        "bg-orange-500/10 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400 border-orange-500/20",
    };
  };

  const matchLevel = getMatchLevel(matchScore);
  const formattedDate = dayjs(postedAt).fromNow();
  const displayScore = Math.round(matchScore);

  return (
    <div className="group flex flex-col h-[500px] w-full cursor-pointer overflow-hidden rounded-xl border border-border/60 bg-card/80 backdrop-blur-md transition-all duration-300 hover:bg-card hover:shadow-lg hover:shadow-primary/10 hover:border-primary/30 dark:hover:shadow-primary/5">
      {/* --- HEADER --- */}
      <div className="relative h-[140px] flex-shrink-0 bg-gradient-to-br from-primary/5 via-primary/3 to-transparent p-6 border-b border-border/40 overflow-hidden">
        {/* Match Score */}
        <div className="absolute top-4 right-4 z-10">
          <AnimatedCircularProgressBar
            max={100}
            min={0}
            value={displayScore}
            gaugePrimaryColor={matchLevel.primaryColor}
            gaugeSecondaryColor={matchLevel.secondaryColor}
            className="size-14"
          />
        </div>

        {/* Company Info */}
        <div className="flex items-start gap-3 pr-16">
          {companyLogo ? (
            <div className="w-12 h-12 rounded-lg overflow-hidden border border-border/60 flex-shrink-0 bg-background/50">
              <Image
                src={companyLogo}
                width={48}
                height={48}
                alt={company}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 border border-border/60 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="h-[44px] flex items-start overflow-hidden">
              <h3 className="font-semibold text-base line-clamp-2 text-foreground group-hover:text-primary transition-colors leading-tight break-words">
                {title}
              </h3>
            </div>
            <p className="text-sm text-muted-foreground font-medium truncate mt-1">
              {company}
            </p>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-2 mt-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground truncate w-full">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="font-medium truncate">
              {toTitleCase(location || "Unknown Location")}
            </span>
          </div>
        </div>
      </div>

      {/* --- CONTENT BODY --- */}
      <div className="flex-1 p-6 flex flex-col gap-4 overflow-hidden">
        {/* Row 1: Match Badge & Employment Type */}
        <div className="flex items-center gap-2 flex-wrap">
          <Badge
            className={cn(
              "font-medium text-[10px] border px-2 py-0.5 whitespace-nowrap",
              matchLevel.badgeClass,
            )}
          >
            <Sparkles className="w-3 h-3 mr-1" />
            {matchLevel.label}
          </Badge>

          {filterAndDeduplicateTags([employmentType, seniorityLevel]).map(
            (tag, index) => (
              <Badge
                key={index}
                variant="outline"
                className="text-[10px] px-2 py-0.5 bg-background/50"
              >
                {formatTag(tag)}
              </Badge>
            ),
          )}
        </div>

        {/* Row 2: Description */}
        <div className="h-[4.5rem] flex-shrink-0 overflow-hidden">
          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
            {description || "No description available."}
          </p>
        </div>

        {/* Row 3: Job Function & Industry */}
        <div className="flex flex-col gap-1.5">
          {jobFunction && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Briefcase className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate font-medium">
                {toTitleCase(jobFunction)}
              </span>
            </div>
          )}
          {industries && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Layers className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="truncate">{toTitleCase(industries)}</span>
            </div>
          )}
        </div>

        {/* Row 4: Meta Info */}
        <div className="mt-auto flex items-center gap-3 text-xs text-muted-foreground flex-shrink-0 overflow-hidden whitespace-nowrap pt-2 border-t border-border/30">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{formattedDate}</span>
          </div>
          <span className="text-border">•</span>
          <span className="font-medium">
            {toTitleCase(platforms[0] || "LinkedIn")}
          </span>
        </div>
      </div>

      {/* --- FOOTER --- */}
      <div className="px-6 pb-6 flex gap-2 pt-2">
        <Button
          variant="ghost"
          size="icon"
          className={cn(
            "rounded-lg h-9 w-9 transition-colors flex-shrink-0",
            isSaved
              ? "text-blue-500 hover:text-blue-600 bg-blue-500/10 hover:bg-blue-500/20"
              : "hover:bg-muted",
          )}
          onClick={(e) => {
            e.preventDefault();
            onSave?.(jobId);
          }}
        >
          <Bookmark className={cn("w-4 h-4", isSaved && "fill-current")} />
        </Button>

        <Button
          className="flex-1 gap-2 h-9 font-semibold shadow-sm hover:shadow-md transition-shadow whitespace-nowrap"
          asChild
        >
          {sourceUrl.startsWith("/") ? (
            <Link
              href={sourceUrl}
              className="inline-flex items-center justify-center overflow-hidden"
            >
              <span className="truncate">View Details</span>
              <ExternalLink className="w-3.5 h-3.5 ml-2 flex-shrink-0" />
            </Link>
          ) : (
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center overflow-hidden"
            >
              <span className="truncate">View Details</span>
              <ExternalLink className="w-3.5 h-3.5 ml-2 flex-shrink-0" />
            </a>
          )}
        </Button>
      </div>
    </div>
  );
};

export default JobCard;
