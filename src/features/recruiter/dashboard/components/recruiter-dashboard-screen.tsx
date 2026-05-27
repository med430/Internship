"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  CalendarDays,
  ClipboardList,
  Clock,
  PlusSquare,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { fetchRecruiterStats, type RecruiterStats } from "@/lib/api/recruiter-stats-client";

function greeting(name: string): string {
  const h = new Date().getHours();
  const time = h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
  return `${time}, ${name.split(" ")[0]}!`;
}

interface Props {
  userName: string;
}

const quickActions = [
  {
    href: "/recruiter/offers/new",
    title: "Post an Offer",
    description: "Create a new job offer and reach the best candidates",
    icon: PlusSquare,
    gradient: "from-sky-500/5 via-blue-400/8 to-sky-500/5",
    tag: "Create",
    tagColor: "sky",
    features: ["Instant publishing", "Targeted matching"],
  },
  {
    href: "/recruiter/applications",
    title: "Applications",
    description: "Review and manage candidates who applied to your offers",
    icon: ClipboardList,
    gradient: "from-violet-500/5 via-purple-400/8 to-violet-500/5",
    tag: "Review",
    tagColor: "violet",
    features: ["Filter by status", "Download CVs"],
  },
  {
    href: "/recruiter/offers",
    title: "My Offers",
    description: "View, edit and track performance of all your job postings",
    icon: Briefcase,
    gradient: "from-emerald-500/5 via-teal-400/8 to-emerald-500/5",
    tag: "Manage",
    tagColor: "emerald",
    features: ["Edit anytime", "View applicants"],
  },
  {
    href: "/recruiter/calendar",
    title: "Calendar",
    description: "Schedule and track all your upcoming candidate interviews",
    icon: CalendarDays,
    gradient: "from-amber-500/5 via-orange-400/8 to-amber-500/5",
    tag: "Schedule",
    tagColor: "amber",
    features: ["Propose slots", "Sync with candidates"],
  },
];

const tagColors: Record<string, string> = {
  sky:     "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  violet:  "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  amber:   "bg-amber-500/10 text-amber-600 dark:text-amber-400",
};

const dotColors: Record<string, string> = {
  sky:     "bg-sky-500",
  violet:  "bg-violet-500",
  emerald: "bg-emerald-500",
  amber:   "bg-amber-500",
};

export function RecruiterDashboardScreen({ userName }: Props) {
  const [stats, setStats] = useState<RecruiterStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecruiterStats()
      .then(setStats)
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    {
      label: "Active Offers",
      value: stats?.activeOffers ?? 0,
      suffix: "",
      icon: Briefcase,
      color: "text-sky-600 dark:text-sky-400",
      bg: "bg-sky-500/10",
      hint: "offers currently posted",
    },
    {
      label: "This Week",
      value: stats?.applicationsThisWeek ?? 0,
      suffix: "",
      icon: Users,
      color: "text-violet-600 dark:text-violet-400",
      bg: "bg-violet-500/10",
      hint: "new applications (7 days)",
    },
    {
      label: "Response Rate",
      value: stats?.responseRate ?? 0,
      suffix: "%",
      icon: TrendingUp,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10",
      hint: "of applications answered",
    },
    {
      label: "Accepted",
      value: stats?.acceptedApplications ?? 0,
      suffix: "",
      icon: Clock,
      color: "text-teal-600 dark:text-teal-400",
      bg: "bg-teal-500/10",
      hint: "candidates accepted",
    },
  ];

  return (
    <div className="min-h-screen bg-background">

      {/* Hero */}
      <section className="relative min-h-[38vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-sky-500/20 via-blue-400/10 to-violet-500/15 animate-gradient" />
        <div
          className="absolute inset-0 opacity-[0.12] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='3.5' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
            backgroundSize: "128px 128px",
          }}
        />
        <div className="absolute inset-0 backdrop-blur-[100px] bg-background/40" />

        <div className="relative z-10 text-center px-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-700 dark:text-sky-300 mb-4">
            <Sparkles className="h-3.5 w-3.5" />
            Recruiter workspace
          </div>
          {loading ? (
            <Skeleton className="inline-block h-14 w-64 mx-auto" />
          ) : (
            <h1 className="text-4xl md:text-6xl font-bold text-foreground font-heading">
              {greeting(userName)}
            </h1>
          )}
          <p className="mt-3 text-muted-foreground text-sm md:text-base">
            Manage your offers, review candidates and schedule interviews.
          </p>
        </div>
      </section>

      <div className="container mx-auto max-w-7xl px-6 -mt-10 space-y-8 pb-12">

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((s) => {
            const Icon = s.icon;
            return (
              <Card
                key={s.label}
                className="p-5 bg-card/80 backdrop-blur-xl border-border hover:border-primary/30 transition-all duration-200 hover:shadow-lg hover:shadow-primary/5"
              >
                {loading ? (
                  <div className="space-y-2">
                    <Skeleton className="h-8 w-8 rounded-lg" />
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className={`p-2 rounded-lg w-fit ${s.bg}`}>
                      <Icon className={`h-5 w-5 ${s.color}`} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-foreground">
                        {s.value}{s.suffix}
                      </p>
                      <p className="text-xs font-semibold text-foreground/80 mt-0.5">{s.label}</p>
                      <p className="text-[11px] text-muted-foreground mt-0.5">{s.hint}</p>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        {/* Quick actions */}
        <div>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.href} href={action.href} className="group">
                  <Card className="relative overflow-hidden p-5 flex flex-col gap-3 bg-card/80 backdrop-blur-xl border-border hover:border-primary/40 transition-all duration-200 hover:shadow-lg hover:shadow-primary/10 h-full">
                    <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                    <div className="relative z-10 flex flex-col gap-3 h-full">
                      <div className="flex items-center justify-between">
                        <div className={`p-2 rounded-xl ${tagColors[action.tagColor].replace("text-", "bg-").split(" ")[0].replace("/10", "/10")}`}>
                          <Icon className={`h-5 w-5 ${tagColors[action.tagColor].split(" ").slice(1).join(" ")}`} />
                        </div>
                        <Badge variant="secondary" className={`text-[10px] font-semibold ${tagColors[action.tagColor]}`}>
                          {action.tag}
                        </Badge>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-foreground">{action.title}</h3>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{action.description}</p>
                      </div>
                      <div className="flex flex-col gap-1.5 mt-auto">
                        {action.features.map((f) => (
                          <div key={f} className="flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${dotColors[action.tagColor]}`} />
                            <span className="text-[10px] text-muted-foreground">{f}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                        <span>Open</span>
                        <ArrowRight className="h-3 w-3 group-hover:translate-x-0.5 transition-transform" />
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
