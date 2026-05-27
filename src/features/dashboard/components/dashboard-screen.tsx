"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Briefcase,
  Compass,
  FileText,
  MessageSquare,
  Phone,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import ServiceCard from "@/components/services/service-card";
import { useDashboardController } from "../hooks/use-dashboard-controller";

export function DashboardScreen() {
  const router = useRouter();
  const { userName, greeting, latestCV, latestGuide, latestLetter, loading } =
    useDashboardController();

  const handleStartCall = () => {
    const id = crypto.randomUUID();
    router.push(`/services/call?room=${id}`);
  };

  return (
    <div className="min-h-screen bg-background">
      <section className="relative min-h-[40vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-accent/15 to-primary/20 animate-gradient" />
        <div
          className="absolute inset-0 opacity-[0.15] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='3.5' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
            backgroundSize: "128px 128px",
          }}
        />
        <div className="absolute inset-0 backdrop-blur-[100px] bg-background/40" />

        <div className="relative z-10 text-center px-4">
          <h1 className="text-5xl md:text-7xl font-bold text-foreground mb-6 font-heading">
            {loading ? (
              <Skeleton className="inline-block h-16 w-48" />
            ) : (
              `${greeting}, ${userName.split(" ")[0]}!`
            )}
          </h1>
        </div>
      </section>

      <div className="container mx-auto max-w-7xl px-6 -mt-12 space-y-8 pb-12">
        {!loading && (latestCV || latestGuide || latestLetter) && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {latestCV && (
              <Link href={`/services/cv-rewriter/database/${latestCV.id}`}>
                <Card className="p-4 bg-card/80 backdrop-blur-xl border-border hover:border-primary/40 transition-all duration-200 hover:shadow-lg hover:shadow-primary/10 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-primary/10">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-[10px] font-medium text-muted-foreground font-label">
                          Latest CV
                        </p>
                        <h3 className="text-xs font-semibold text-foreground font-body line-clamp-1">
                          {latestCV.job_title}
                        </h3>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-green-600 dark:text-green-500 font-label">
                        +
                        {Math.round(
                          ((latestCV.final_score - latestCV.original_score) /
                            latestCV.original_score) *
                            100 +
                            10,
                        )}
                        %
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                  </div>
                </Card>
              </Link>
            )}

            {latestGuide && (
              <Link href={`/services/career-guide/database/${latestGuide.id}`}>
                <Card className="p-4 bg-card/80 backdrop-blur-xl border-border hover:border-primary/40 transition-all duration-200 hover:shadow-lg hover:shadow-primary/10 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-primary/10">
                        <Compass className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-[10px] font-medium text-muted-foreground font-label">
                          Latest Guide
                        </p>
                        <h3 className="text-xs font-semibold text-foreground font-body line-clamp-1">
                          {latestGuide.target_job || latestGuide.current_job}
                        </h3>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-green-600 dark:text-green-500 font-label">
                        {latestGuide.readiness_score}%
                      </span>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                  </div>
                </Card>
              </Link>
            )}
            {latestLetter && (
              <Link href={`/services/cover-letters/database/${latestLetter.id}`}>
                <Card className="p-4 bg-card/80 backdrop-blur-xl border-border hover:border-primary/40 transition-all duration-200 hover:shadow-lg hover:shadow-primary/10 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-primary/10">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-[10px] font-medium text-muted-foreground font-label">
                          Latest Cover Letter
                        </p>
                        <h3 className="text-xs font-semibold text-foreground font-body line-clamp-1">
                          {new Date(latestLetter.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </h3>
                      </div>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                </Card>
              </Link>
            )}
          </div>
        )}

        <div
          className={`${!loading && !latestCV && !latestGuide && !latestLetter ? "mt-12 md:mt-20" : ""}`}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <ServiceCard
              href="/services/cv-rewriter"
              title="CV Booster"
              description="Transform your CV into a compelling narrative that stands out"
              icon={Sparkles}
              gradient="from-primary/5 via-accent/10 to-primary/5"
              tagText="AI-Powered"
              tagIcon={Sparkles}
              tagColor="primary"
              features={[
                { label: "Context-aware rewriting", colorClass: "bg-primary" },
                { label: "ATS-optimized", colorClass: "bg-accent" },
              ]}
            />

            <ServiceCard
              href="/services/career-guide"
              title="Career Guide"
              description="Get a personalized roadmap built from your CV and real market data"
              icon={Zap}
              gradient="from-accent/8 via-primary/5 to-accent/8"
              tagText="Market Intel"
              tagIcon={Compass}
              tagColor="primary"
              features={[
                { label: "Readiness score", colorClass: "bg-primary" },
                { label: "Growth roadmap", colorClass: "bg-accent" },
              ]}
            />

            <ServiceCard
              href="/services/jobmatcher"
              title="Job Matcher"
              description="Find jobs that match your skills perfectly with AI-powered matching"
              icon={Target}
              gradient="from-emerald-500/5 via-cyan-400/8 to-emerald-500/5"
              tagText="Smart Match"
              tagIcon={Target}
              tagColor="emerald"
              features={[
                { label: "Smart matching", colorClass: "bg-emerald-500" },
                { label: "Real-time updates", colorClass: "bg-cyan-400" },
              ]}
            />

            <ServiceCard
              href="/services/virtual-interviewer"
              title="V-Interviewer"
              description="Practice interviews with AI personalities and get actionable feedback"
              icon={Zap}
              gradient="from-purple-500/8 via-blue-500/10 to-cyan-500/8"
              tagText="Practice"
              tagIcon={Zap}
              tagColor="purple"
              features={[
                { label: "AI-powered personas", colorClass: "bg-purple-500" },
                { label: "Real-time feedback", colorClass: "bg-blue-500" },
              ]}
            />

            <div
              onClick={handleStartCall}
              className="cursor-pointer group relative overflow-hidden rounded-2xl border border-border bg-card/80 backdrop-blur-xl p-5 flex flex-col gap-3 hover:border-primary/40 transition-all duration-200 hover:shadow-lg hover:shadow-primary/10"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-emerald-400/8 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div className="p-2 rounded-xl bg-green-500/10">
                    <Phone className="h-5 w-5 text-green-500" />
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 font-label">
                    Live
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground font-heading">
                    Start a Call
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 font-body line-clamp-2">
                    Create a private room and invite anyone with a link
                  </p>
                </div>
                <div className="flex flex-col gap-1.5 mt-auto">
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    <span className="text-[10px] text-muted-foreground font-label">Video & audio</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span className="text-[10px] text-muted-foreground font-label">Private link</span>
                  </div>
                </div>
              </div>
            </div>

            <ServiceCard
              href="/services/chat"
              title="Messages"
              description="Chat in real-time with your network — private, instant messaging"
              icon={MessageSquare}
              gradient="from-blue-500/5 via-indigo-400/8 to-blue-500/5"
              tagText="Real-time"
              tagIcon={MessageSquare}
              tagColor="primary"
              features={[
                { label: "Instant delivery", colorClass: "bg-blue-500" },
                { label: "Read receipts", colorClass: "bg-indigo-400" },
              ]}
            />

            <ServiceCard
              href="/services/portfolio-builder"
              title="Portfolio Builder"
              description="Transform your profile into a stunning portfolio website"
              icon={Briefcase}
              gradient="from-purple-500/8 via-pink-500/6 to-blue-500/8"
              tagText="AI-Generated"
              tagIcon={Sparkles}
              tagColor="purple"
              features={[
                { label: "5 Wireframes", colorClass: "bg-purple-500" },
                { label: "6 Themes", colorClass: "bg-pink-500" },
              ]}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
