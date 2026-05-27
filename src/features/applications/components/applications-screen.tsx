"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Briefcase,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock,
  MapPin,
  RefreshCw,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Users,
  Wifi,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  fetchMyApplications,
  type StudentApplication,
  withdrawApplication,
} from "@/lib/api/applications";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

/* ── constants ────────────────────────────────────────────────────── */

const PAGE_SIZE = 10;

function getPaginationItems(currentPage: number, totalPages: number): Array<number | "ellipsis"> {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  if (currentPage <= 3) return [1, 2, 3, 4, "ellipsis", totalPages];
  if (currentPage >= totalPages - 2) return [1, "ellipsis", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  return [1, "ellipsis", currentPage - 1, currentPage, currentPage + 1, "ellipsis", totalPages];
}

const STATUS_CONFIG: Record<
  string,
  { label: string; dot: string; badge: string; bar: string }
> = {
  ACCEPTED: {
    label: "Accepted",
    dot: "bg-emerald-500",
    badge: "bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/25 dark:text-emerald-300",
    bar: "border-l-emerald-500",
  },
  REJECTED: {
    label: "Rejected",
    dot: "bg-rose-500",
    badge: "bg-rose-500/10 text-rose-700 ring-1 ring-rose-500/25 dark:text-rose-300",
    bar: "border-l-rose-500",
  },
  WITHDRAWN: {
    label: "Withdrawn",
    dot: "bg-zinc-400",
    badge: "bg-zinc-500/10 text-zinc-600 ring-1 ring-zinc-500/20 dark:text-zinc-400",
    bar: "border-l-zinc-400",
  },
  IN_REVIEW: {
    label: "In Review",
    dot: "bg-violet-500",
    badge: "bg-violet-500/10 text-violet-700 ring-1 ring-violet-500/25 dark:text-violet-300",
    bar: "border-l-violet-500",
  },
  SUBMITTED: {
    label: "Submitted",
    dot: "bg-amber-500",
    badge: "bg-amber-500/10 text-amber-700 ring-1 ring-amber-500/25 dark:text-amber-300",
    bar: "border-l-amber-500",
  },
};

const WORK_MODE_LABEL: Record<string, string> = {
  REMOTE: "Remote",
  ONSITE: "On-site",
  HYBRID: "Hybrid",
};

const OFFER_TYPE_LABEL: Record<string, string> = {
  INTERNSHIP: "Internship",
  PFE: "PFE",
  RESEARCH: "Research",
  PHD: "PhD",
  ALTERNANCE: "Alternance",
};

/* ── helpers ──────────────────────────────────────────────────────── */

function fmt(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function statusCfg(status: string) {
  return STATUS_CONFIG[status] ?? STATUS_CONFIG.SUBMITTED;
}

/* ── component ────────────────────────────────────────────────────── */

export function StudentApplicationsScreen() {
  const [applications, setApplications] = useState<StudentApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const load = async () => {
    setLoading(true);
    try {
      setApplications(await fetchMyApplications(1, 200));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const sorted = useMemo(
    () => [...applications].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [applications],
  );

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const paginated = useMemo(
    () => sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [sorted, page],
  );

  const stats = useMemo(() => ({
    total: applications.length,
    pending: applications.filter((a) => a.status === "SUBMITTED" || a.status === "IN_REVIEW").length,
    accepted: applications.filter((a) => a.status === "ACCEPTED").length,
    rejected: applications.filter((a) => a.status === "REJECTED").length,
  }), [applications]);

  const onWithdraw = async (id: string) => {
    setWithdrawingId(id);
    try {
      await withdrawApplication(id);
      toast.success("Application withdrawn");
      await load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to withdraw");
    } finally {
      setWithdrawingId(null);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.14),transparent_28%),radial-gradient(circle_at_top_left,rgba(244,114,182,0.12),transparent_24%),linear-gradient(180deg,rgba(248,250,252,0.88),rgba(255,255,255,1))] dark:bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.18),transparent_28%),radial-gradient(circle_at_top_left,rgba(244,114,182,0.14),transparent_24%),linear-gradient(180deg,rgba(2,6,23,0.92),rgba(2,6,23,1))]">
      <div className="mx-auto max-w-5xl px-6 py-8 space-y-6">

        {/* Header + stats */}
        <div className="rounded-3xl border border-white/50 bg-white/75 p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.45)] backdrop-blur dark:border-white/10 dark:bg-slate-950/70 space-y-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/15 bg-sky-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-700 dark:text-sky-300">
                <Sparkles className="h-3.5 w-3.5" />
                My applications
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
                Application tracker
              </h1>
              <p className="max-w-xl text-sm text-slate-600 dark:text-slate-300">
                Follow the status of every offer you applied to.
              </p>
            </div>
            <Button onClick={load} variant="outline" disabled={loading} className="gap-2 w-fit shrink-0">
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatChip icon={<Users className="h-4 w-4" />} label="Total" value={stats.total} color="sky" />
            <StatChip icon={<Clock className="h-4 w-4" />} label="Pending" value={stats.pending} color="amber" />
            <StatChip icon={<TrendingUp className="h-4 w-4" />} label="Accepted" value={stats.accepted} color="emerald" />
            <StatChip icon={<TrendingDown className="h-4 w-4" />} label="Rejected" value={stats.rejected} color="rose" />
          </div>
        </div>

        {/* Skeleton */}
        {loading && (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-white/60 bg-white/85 shadow-lg backdrop-blur dark:border-white/10 dark:bg-slate-950/70 overflow-hidden">
                <div className="flex items-start gap-4 p-5 border-b border-slate-200/70 dark:border-white/10">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <div className="p-5 flex gap-4">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-16" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && sorted.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-300 bg-white/70 py-20 text-center dark:border-white/10 dark:bg-slate-950/60">
            <div className="rounded-full bg-sky-500/10 p-4">
              <Briefcase className="h-6 w-6 text-sky-600 dark:text-sky-300" />
            </div>
            <div className="space-y-1">
              <p className="text-base font-semibold text-slate-900 dark:text-white">No applications yet</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Browse offers and apply to positions that match your profile.
              </p>
            </div>
          </div>
        )}

        {/* Cards */}
        {!loading && sorted.length > 0 && (
          <div className="space-y-4">
            {paginated.map((app) => {
              const cfg = statusCfg(app.status);
              const canWithdraw =
                app.status !== "ACCEPTED" &&
                app.status !== "REJECTED" &&
                app.status !== "WITHDRAWN";
              const score = app.matchScore ?? 0;

              return (
                <div
                  key={app.id}
                  className={`relative overflow-hidden rounded-2xl border-l-4 ${cfg.bar} border border-white/60 bg-white/85 shadow-lg shadow-slate-900/5 backdrop-blur dark:border-white/10 dark:bg-slate-950/70 transition-shadow hover:shadow-xl hover:shadow-slate-900/10`}
                >
                  {/* Header */}
                  <div className="flex items-start gap-4 p-5 border-b border-slate-200/60 dark:border-white/10">
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-semibold text-slate-900 dark:text-white truncate">
                        {app.offer?.title || "Offer"}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {app.offer?.company && (
                          <span className="flex items-center gap-1">
                            <Building2 className="h-3 w-3" />
                            {app.offer.company}
                          </span>
                        )}
                        {app.offer?.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {app.offer.location}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${cfg.badge}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                      {cfg.label}
                    </span>
                  </div>

                  {/* Body */}
                  <div className="px-5 py-4 flex flex-wrap items-center gap-x-5 gap-y-2">
                    {/* Offer badges */}
                    {app.offer?.type && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-white/10 px-2.5 py-1 text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                        <Briefcase className="h-3 w-3" />
                        {OFFER_TYPE_LABEL[app.offer.type] ?? app.offer.type}
                      </span>
                    )}
                    {app.offer?.workMode && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-sky-500/10 px-2.5 py-1 text-[10px] font-semibold text-sky-700 dark:text-sky-300">
                        <Wifi className="h-3 w-3" />
                        {WORK_MODE_LABEL[app.offer.workMode] ?? app.offer.workMode}
                      </span>
                    )}
                    {app.offer?.domain && (
                      <span className="rounded-full border border-slate-200 dark:border-white/10 px-2.5 py-1 text-[10px] font-medium text-slate-500 dark:text-slate-400">
                        {app.offer.domain}
                      </span>
                    )}

                    {/* Match score */}
                    {score > 0 && (
                      <span className="ml-auto inline-flex items-center gap-1.5 text-xs font-semibold text-violet-700 dark:text-violet-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
                        {Math.round(score)}% match
                      </span>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="px-5 py-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between gap-3">
                    <span className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500">
                      <CalendarDays className="h-3.5 w-3.5" />
                      Submitted {fmt(app.createdAt)}
                    </span>

                    {app.status === "ACCEPTED" && (
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="h-4 w-4" />
                        Congratulations!
                      </span>
                    )}
                    {app.status === "REJECTED" && (
                      <span className="flex items-center gap-1.5 text-xs text-rose-500 dark:text-rose-400">
                        <XCircle className="h-4 w-4" />
                        Not selected
                      </span>
                    )}
                    {canWithdraw && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs gap-1.5 border-slate-300/60 text-slate-600 hover:border-rose-300 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400"
                        onClick={() => void onWithdraw(app.id)}
                        disabled={withdrawingId === app.id}
                      >
                        {withdrawingId === app.id ? "Withdrawing…" : "Withdraw"}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-white/50 bg-white/75 px-5 py-3 shadow backdrop-blur dark:border-white/10 dark:bg-slate-950/70">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, sorted.length)} of {sorted.length} applications
            </p>
            <Pagination className="w-fit mx-0">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious onClick={() => setPage(p => Math.max(1, p - 1))} className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} />
                </PaginationItem>
                {getPaginationItems(page, totalPages).map((item, i) =>
                  item === "ellipsis" ? (
                    <PaginationItem key={`e-${i}`}><PaginationEllipsis /></PaginationItem>
                  ) : (
                    <PaginationItem key={item}>
                      <PaginationLink isActive={item === page} onClick={() => setPage(item)} className="cursor-pointer">{item}</PaginationLink>
                    </PaginationItem>
                  )
                )}
                <PaginationItem>
                  <PaginationNext onClick={() => setPage(p => Math.min(totalPages, p + 1))} className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"} />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentApplicationsScreen;

/* ── sub-components ───────────────────────────────────────────────── */

function StatChip({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: "sky" | "amber" | "emerald" | "rose";
}) {
  const styles = {
    sky:     { wrap: "bg-sky-500/8 border-sky-500/15",         text: "text-sky-700 dark:text-sky-300",     num: "text-sky-700 dark:text-sky-200" },
    amber:   { wrap: "bg-amber-500/8 border-amber-500/15",     text: "text-amber-700 dark:text-amber-300", num: "text-amber-700 dark:text-amber-200" },
    emerald: { wrap: "bg-emerald-500/8 border-emerald-500/15", text: "text-emerald-700 dark:text-emerald-300", num: "text-emerald-700 dark:text-emerald-200" },
    rose:    { wrap: "bg-rose-500/8 border-rose-500/15",       text: "text-rose-700 dark:text-rose-300",   num: "text-rose-700 dark:text-rose-200" },
  };
  const s = styles[color];
  return (
    <div className={`flex items-center gap-3 rounded-xl border ${s.wrap} px-4 py-3`}>
      <span className={s.text}>{icon}</span>
      <div>
        <p className={`text-xl font-bold ${s.num}`}>{value}</p>
        <p className={`text-[10px] font-semibold uppercase tracking-wider ${s.text}`}>{label}</p>
      </div>
    </div>
  );
}
