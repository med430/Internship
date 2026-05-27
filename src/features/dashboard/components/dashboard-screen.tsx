"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Briefcase,
  CalendarDays,
  ClipboardList,
  Compass,
  FileText,
  GraduationCap,
  LayoutGrid,
  MessageSquare,
  Phone,
  Sparkles,
  Target,
  TrendingUp,
  Video,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboardController } from "../hooks/use-dashboard-controller";
import { cn } from "@/lib/utils";

/* ─── Feature data ─────────────────────────────────────────────────── */

const AI_TOOLS = [
  {
    href: "/services/cv-rewriter",
    icon: Sparkles,
    label: "CV Booster",
    badge: "AI",
    badgeColor: "bg-violet-500/15 text-violet-600 dark:text-violet-400",
    iconBg: "bg-violet-500/10",
    iconColor: "text-violet-500",
    accent: "group-hover:border-violet-400/50",
    glow: "group-hover:shadow-violet-500/10",
    description: "Rewrite your CV to pass ATS filters and impress recruiters.",
    cta: "Boost my CV",
  },
  {
    href: "/services/career-guide",
    icon: GraduationCap,
    label: "Career Guide",
    badge: "Insights",
    badgeColor: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-500",
    accent: "group-hover:border-amber-400/50",
    glow: "group-hover:shadow-amber-500/10",
    description: "Get a personalized roadmap built from real market data.",
    cta: "View my roadmap",
  },
  {
    href: "/services/virtual-interviewer",
    icon: Video,
    label: "V-Interviewer",
    badge: "Practice",
    badgeColor: "bg-blue-500/15 text-blue-600 dark:text-blue-400",
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-500",
    accent: "group-hover:border-blue-400/50",
    glow: "group-hover:shadow-blue-500/10",
    description: "Practice with AI interviewers and get instant feedback.",
    cta: "Start session",
  },
  {
    href: "/services/portfolio-builder",
    icon: Briefcase,
    label: "Portfolio Builder",
    badge: "Generate",
    badgeColor: "bg-pink-500/15 text-pink-600 dark:text-pink-400",
    iconBg: "bg-pink-500/10",
    iconColor: "text-pink-500",
    accent: "group-hover:border-pink-400/50",
    glow: "group-hover:shadow-pink-500/10",
    description: "Turn your profile into a stunning portfolio website.",
    cta: "Build portfolio",
  },
  {
    href: "/services/document-generator",
    icon: FileText,
    label: "CV & Letter Generator",
    badge: "AI",
    badgeColor: "bg-teal-500/15 text-teal-600 dark:text-teal-400",
    iconBg: "bg-teal-500/10",
    iconColor: "text-teal-500",
    accent: "group-hover:border-teal-400/50",
    glow: "group-hover:shadow-teal-500/10",
    description: "Generate a tailored CV + cover letter PDF for any job offer in one click.",
    cta: "Generate documents",
  },
];

const JOB_TOOLS = [
  {
    href: "/services/offers",
    icon: Compass,
    label: "Browse Offers",
    description: "Explore internship and PFE opportunities from top companies.",
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-500",
    accent: "group-hover:border-emerald-400/40",
  },
  {
    href: "/services/jobmatcher",
    icon: Target,
    label: "Job Matcher",
    description: "AI matches you to the offers that fit your profile best.",
    iconBg: "bg-cyan-500/10",
    iconColor: "text-cyan-500",
    accent: "group-hover:border-cyan-400/40",
  },
  {
    href: "/services/applications",
    icon: ClipboardList,
    label: "My Applications",
    description: "Track the status of every application in one place.",
    iconBg: "bg-orange-500/10",
    iconColor: "text-orange-500",
    accent: "group-hover:border-orange-400/40",
  },
];

const QUICK_TOOLS = [
  {
    href: "/services/chat",
    icon: MessageSquare,
    label: "Messages",
    description: "Chat with your network",
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-500",
  },
  {
    href: "/services/calendar",
    icon: CalendarDays,
    label: "Calendar",
    description: "Interview schedule",
    iconBg: "bg-purple-500/10",
    iconColor: "text-purple-500",
  },
];

/* ─── Sub-components ───────────────────────────────────────────────── */

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="p-2 rounded-xl bg-muted">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div>
        <h2 className="text-sm font-semibold text-foreground tracking-wide uppercase">
          {title}
        </h2>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}

function RecentItem({
  href,
  icon: Icon,
  label,
  sub,
  right,
}: {
  href: string;
  icon: React.ElementType;
  label: string;
  sub: string;
  right: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl hover:bg-muted/60 transition-colors group"
    >
      <div className="flex items-center gap-2.5">
        <div className="p-1.5 rounded-lg bg-primary/10 shrink-0">
          <Icon className="h-3.5 w-3.5 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-medium text-foreground truncate">{label}</p>
          <p className="text-[11px] text-muted-foreground truncate">{sub}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {right}
        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </Link>
  );
}

/* ─── Main component ────────────────────────────────────────────────── */

export function DashboardScreen() {
  const router = useRouter();
  const { userName, greeting, latestCV, latestGuide, latestLetter, loading } =
    useDashboardController();

  const firstName = userName ? userName.split(" ")[0] : "";

  const handleStartCall = () => {
    router.push(`/services/call?room=${crypto.randomUUID()}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* ── Hero ────────────────────────────────────────────────── */}
      <section className="border-b border-border bg-gradient-to-r from-background via-muted/30 to-background px-6 py-8">
        <div className="container mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <p className="text-sm text-muted-foreground font-medium mb-1">
                {greeting}
              </p>
              {loading ? (
                <Skeleton className="h-9 w-52 mb-2" />
              ) : (
                <h1 className="text-3xl font-bold text-foreground tracking-tight">
                  Welcome back{firstName ? `, ${firstName}` : ""}
                </h1>
              )}
              <p className="text-sm text-muted-foreground mt-1">
                Here&apos;s what&apos;s ready for you today.
              </p>
            </div>

            {/* Quick stats */}
            <div className="flex items-center gap-3 flex-wrap">
              {loading ? (
                <>
                  <Skeleton className="h-16 w-32 rounded-xl" />
                  <Skeleton className="h-16 w-32 rounded-xl" />
                  <Skeleton className="h-16 w-32 rounded-xl" />
                </>
              ) : (
                <>
                  {latestCV && (
                    <Link href={`/services/cv-rewriter/database/${latestCV.id}`}>
                      <div className="px-4 py-3 rounded-xl border border-border bg-card hover:border-primary/40 transition-colors cursor-pointer text-center min-w-[112px]">
                        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                          CV Score
                        </p>
                        <p className="text-2xl font-bold text-green-500 mt-0.5">
                          +{Math.round(
                            ((latestCV.final_score - latestCV.original_score) /
                              latestCV.original_score) * 100 + 10,
                          )}%
                        </p>
                      </div>
                    </Link>
                  )}
                  {latestGuide && (
                    <Link href={`/services/career-guide/database/${latestGuide.id}`}>
                      <div className="px-4 py-3 rounded-xl border border-border bg-card hover:border-primary/40 transition-colors cursor-pointer text-center min-w-[112px]">
                        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                          Readiness
                        </p>
                        <p className="text-2xl font-bold text-amber-500 mt-0.5">
                          {latestGuide.readiness_score}%
                        </p>
                      </div>
                    </Link>
                  )}
                  <Link href="/services/profile">
                    <div className="px-4 py-3 rounded-xl border border-border bg-card hover:border-primary/40 transition-colors cursor-pointer min-w-[112px]">
                      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider mb-1">
                        Profile
                      </p>
                      <div className="flex items-center gap-2">
                        <Progress value={40} className="h-1.5 flex-1" />
                        <span className="text-xs font-semibold text-foreground">40%</span>
                      </div>
                    </div>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Body ────────────────────────────────────────────────── */}
      <div className="container mx-auto max-w-7xl px-6 py-8 space-y-10">

        {/* ── Recent activity (if anything exists) ────────────── */}
        {!loading && (latestCV || latestGuide || latestLetter) && (
          <div className="rounded-2xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-semibold text-foreground">Recent activity</h2>
            </div>
            <div className="divide-y divide-border -mx-3">
              {latestCV && (
                <RecentItem
                  href={`/services/cv-rewriter/database/${latestCV.id}`}
                  icon={Sparkles}
                  label={latestCV.job_title}
                  sub="CV Booster"
                  right={
                    <span className="text-xs font-semibold text-green-500">
                      +{Math.round(
                        ((latestCV.final_score - latestCV.original_score) /
                          latestCV.original_score) * 100 + 10,
                      )}%
                    </span>
                  }
                />
              )}
              {latestGuide && (
                <RecentItem
                  href={`/services/career-guide/database/${latestGuide.id}`}
                  icon={GraduationCap}
                  label={latestGuide.target_job || latestGuide.current_job}
                  sub="Career Guide"
                  right={
                    <span className="text-xs font-semibold text-amber-500">
                      {latestGuide.readiness_score}%
                    </span>
                  }
                />
              )}
              {latestLetter && (
                <RecentItem
                  href={`/services/cover-letters/database/${latestLetter.id}`}
                  icon={FileText}
                  label="Cover Letter"
                  sub={new Date(latestLetter.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                  right={null}
                />
              )}
            </div>
          </div>
        )}

        {/* ── AI Career Tools ──────────────────────────────────── */}
        <div>
          <SectionHeader
            icon={Zap}
            title="AI Career Tools"
            subtitle="Powered by AI — build your profile, prepare for interviews, stand out."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {AI_TOOLS.map((t) => {
              const Icon = t.icon;
              return (
                <Link key={t.href} href={t.href}>
                  <div
                    className={cn(
                      "group relative flex flex-col justify-between h-full rounded-2xl border border-border bg-card p-5 transition-all duration-200 hover:shadow-lg cursor-pointer",
                      t.accent,
                      t.glow,
                    )}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className={cn("p-2.5 rounded-xl", t.iconBg)}>
                        <Icon className={cn("h-5 w-5", t.iconColor)} />
                      </div>
                      <span
                        className={cn(
                          "text-[10px] font-semibold px-2 py-0.5 rounded-full",
                          t.badgeColor,
                        )}
                      >
                        {t.badge}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-foreground mb-1">
                        {t.label}
                      </h3>
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        {t.description}
                      </p>
                    </div>
                    <div className="mt-4 flex items-center gap-1 text-xs font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      {t.cta}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* ── Job Search ───────────────────────────────────────── */}
        <div>
          <SectionHeader
            icon={Compass}
            title="Job Search"
            subtitle="Find opportunities, get matched, and track every application."
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {JOB_TOOLS.map((t) => {
              const Icon = t.icon;
              return (
                <Link key={t.href} href={t.href}>
                  <div
                    className={cn(
                      "group flex items-center gap-4 rounded-2xl border border-border bg-card p-5 hover:shadow-md transition-all duration-200 cursor-pointer",
                      t.accent,
                    )}
                  >
                    <div className={cn("p-3 rounded-xl shrink-0", t.iconBg)}>
                      <Icon className={cn("h-5 w-5", t.iconColor)} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-semibold text-foreground">
                        {t.label}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {t.description}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* ── Communication & Tools ────────────────────────────── */}
        <div>
          <SectionHeader
            icon={MessageSquare}
            title="Communication & Tools"
            subtitle="Stay connected, manage your schedule and generate documents."
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {QUICK_TOOLS.map((t) => {
              const Icon = t.icon;
              return (
                <Link key={t.href} href={t.href}>
                  <div className="group flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 hover:border-primary/30 hover:shadow-md transition-all duration-200 cursor-pointer">
                    <div className={cn("p-2.5 rounded-xl w-fit", t.iconBg)}>
                      <Icon className={cn("h-4 w-4", t.iconColor)} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">
                        {t.label}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {t.description}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}

            {/* Video Call — button action, not a link */}
            <button
              type="button"
              onClick={handleStartCall}
              className="group flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 hover:border-green-400/40 hover:shadow-md transition-all duration-200 cursor-pointer text-left"
            >
              <div className="p-2.5 rounded-xl w-fit bg-green-500/10">
                <Phone className="h-4 w-4 text-green-500" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">
                  Video Call
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Start a private room instantly
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* ── Upgrade CTA (for free users) ─────────────────────── */}
        <div className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Unlock all AI features
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                CV Booster, Career Guide, Portfolio Builder, Virtual Interviewer — all included in Pro.
              </p>
            </div>
          </div>
          <Button asChild size="sm" className="shrink-0">
            <Link href="/services/subscription">
              Upgrade to Pro <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
