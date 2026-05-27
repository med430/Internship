"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Briefcase,
  CalendarDays,
  CheckCircle2,
  Clock,
  FileText,
  Mail,
  RefreshCw,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  fetchRecruiterApplications,
  openRecruiterApplicationFile,
  updateRecruiterApplicationStatus,
  type RecruiterApplication,
} from "@/lib/api/recruiter-applications";
import {
  fetchMyInterviewSlots,
  proposeInterviewSlot,
  type InterviewSlot,
} from "@/lib/api/interview-slots";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

/* ── helpers ──────────────────────────────────────────────────────── */

function statusConfig(status: string) {
  switch (status) {
    case "ACCEPTED":
      return {
        label: "Accepted",
        dot: "bg-emerald-500",
        badge: "bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-500/25 dark:text-emerald-300",
        bar: "border-l-emerald-500",
      };
    case "REJECTED":
      return {
        label: "Rejected",
        dot: "bg-rose-500",
        badge: "bg-rose-500/10 text-rose-700 ring-1 ring-rose-500/25 dark:text-rose-300",
        bar: "border-l-rose-500",
      };
    case "WITHDRAWN":
      return {
        label: "Withdrawn",
        dot: "bg-zinc-400",
        badge: "bg-zinc-500/10 text-zinc-600 ring-1 ring-zinc-500/20 dark:text-zinc-400",
        bar: "border-l-zinc-400",
      };
    default:
      return {
        label: "Pending",
        dot: "bg-amber-500",
        badge: "bg-amber-500/10 text-amber-700 ring-1 ring-amber-500/25 dark:text-amber-300",
        bar: "border-l-amber-500",
      };
  }
}

function candidateInitials(name?: string): string {
  if (!name) return "?";
  const n = name.includes("@") ? name.split("@")[0] : name;
  return n.split(/[\s._-]+/).map((p) => p[0]).join("").toUpperCase().slice(0, 2);
}

/* ── constants ────────────────────────────────────────────────────── */

const PAGE_SIZE = 10;

function getPaginationItems(currentPage: number, totalPages: number): Array<number | "ellipsis"> {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  if (currentPage <= 3) return [1, 2, 3, 4, "ellipsis", totalPages];
  if (currentPage >= totalPages - 2) return [1, "ellipsis", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  return [1, "ellipsis", currentPage - 1, currentPage, currentPage + 1, "ellipsis", totalPages];
}

/* ── component ────────────────────────────────────────────────────── */

export function RecruiterApplicationsScreen() {
  const [applications, setApplications] = useState<RecruiterApplication[]>([]);
  const [slotsMap, setSlotsMap] = useState<Record<string, InterviewSlot[]>>({});
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [schedulingAppId, setSchedulingAppId] = useState<string | null>(null);
  const [slotStart, setSlotStart] = useState("");
  const [slotEnd, setSlotEnd] = useState("");
  const [slotNotes, setSlotNotes] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const [apps, slots] = await Promise.all([
        fetchRecruiterApplications(1, 200),
        fetchMyInterviewSlots(),
      ]);
      setApplications(apps);
      const map: Record<string, InterviewSlot[]> = {};
      for (const s of slots) {
        (map[s.applicationId] ??= []).push(s);
      }
      setSlotsMap(map);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void load(); }, []);

  const totalPages = Math.ceil(applications.length / PAGE_SIZE);
  const paginated = useMemo(
    () => applications.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [applications, page],
  );

  const stats = useMemo(() => {
    const pending = applications.filter(
      (a) => a.status === "SUBMITTED" || a.status === "IN_REVIEW",
    ).length;
    const accepted = applications.filter((a) => a.status === "ACCEPTED").length;
    const rejected = applications.filter((a) => a.status === "REJECTED").length;
    return { total: applications.length, pending, accepted, rejected };
  }, [applications]);

  const act = async (id: string, verb: "accept" | "reject") => {
    setBusyId(id);
    try {
      await updateRecruiterApplicationStatus(id, verb);
      toast.success(verb === "accept" ? "Application accepted" : "Application rejected");
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Action failed");
    } finally {
      setBusyId(null);
    }
  };

  const openFile = async (id: string, type: "cv" | "cover-letter") => {
    setBusyId(id);
    try {
      await openRecruiterApplicationFile(id, type);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to open file");
    } finally {
      setBusyId(null);
    }
  };

  const submitSlot = async () => {
    if (!schedulingAppId || !slotStart || !slotEnd) {
      toast.error("Please set a start and end date/time");
      return;
    }
    setBusyId(schedulingAppId);
    try {
      await proposeInterviewSlot({
        applicationId: schedulingAppId,
        startAt: slotStart,
        endAt: slotEnd,
        notes: slotNotes || undefined,
      });
      toast.success("Interview slot proposed to the candidate");
      setSchedulingAppId(null);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to propose slot");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.14),transparent_28%),radial-gradient(circle_at_top_left,rgba(244,114,182,0.12),transparent_24%),linear-gradient(180deg,rgba(248,250,252,0.88),rgba(255,255,255,1))] dark:bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.18),transparent_28%),radial-gradient(circle_at_top_left,rgba(244,114,182,0.14),transparent_24%),linear-gradient(180deg,rgba(2,6,23,0.92),rgba(2,6,23,1))]">
      <div className="mx-auto max-w-7xl px-6 py-8 space-y-6">

        {/* Header + stats */}
        <div className="rounded-3xl border border-white/50 bg-white/75 p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.45)] backdrop-blur dark:border-white/10 dark:bg-slate-950/70 space-y-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/15 bg-sky-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-700 dark:text-sky-300">
                <Sparkles className="h-3.5 w-3.5" />
                Applications
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
                Candidate pipeline
              </h1>
              <p className="max-w-2xl text-sm text-slate-600 dark:text-slate-300">
                Review candidates, open their CV and cover letter, and move them through your hiring pipeline.
              </p>
            </div>
            <Button onClick={load} variant="outline" disabled={loading} className="gap-2 w-fit shrink-0">
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          {/* Stat chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StatChip icon={<Users className="h-4 w-4" />} label="Total" value={stats.total} color="sky" />
            <StatChip icon={<Clock className="h-4 w-4" />} label="Pending" value={stats.pending} color="amber" />
            <StatChip icon={<TrendingUp className="h-4 w-4" />} label="Accepted" value={stats.accepted} color="emerald" />
            <StatChip icon={<TrendingDown className="h-4 w-4" />} label="Rejected" value={stats.rejected} color="rose" />
          </div>
        </div>

        {/* Skeleton */}
        {loading && (
          <div className="grid gap-4 xl:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-white/60 bg-white/85 shadow-lg shadow-slate-900/5 backdrop-blur dark:border-white/10 dark:bg-slate-950/70 overflow-hidden">
                <div className="flex items-start gap-4 p-5 border-b border-slate-200/70 dark:border-white/10">
                  <Skeleton className="h-11 w-11 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-40" />
                    <Skeleton className="h-4 w-56" />
                  </div>
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <div className="p-5 space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <Skeleton className="h-10 rounded-xl" />
                    <Skeleton className="h-10 rounded-xl" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-9 w-24 rounded-md" />
                    <Skeleton className="h-9 w-32 rounded-md" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && applications.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-300 bg-white/70 py-20 text-center dark:border-white/10 dark:bg-slate-950/60">
            <div className="rounded-full bg-sky-500/10 p-4">
              <Briefcase className="h-6 w-6 text-sky-600 dark:text-sky-300" />
            </div>
            <div className="space-y-1">
              <p className="text-base font-semibold text-slate-900 dark:text-white">No applications yet</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                When students apply to your offers, they'll appear here.
              </p>
            </div>
          </div>
        )}

        {/* Cards */}
        {!loading && applications.length > 0 && (
          <div className="grid gap-4 xl:grid-cols-2">
            {paginated.map((app) => {
              const cfg = statusConfig(app.status);
              const canAct =
                app.status !== "ACCEPTED" &&
                app.status !== "REJECTED" &&
                app.status !== "WITHDRAWN";
              const name =
                app.student?.name ||
                app.student?.username ||
                app.student?.email ||
                "Candidate";

              return (
                <div
                  key={app.id}
                  className={`relative overflow-hidden rounded-2xl border-l-4 ${cfg.bar} border border-white/60 bg-white/85 shadow-lg shadow-slate-900/5 backdrop-blur dark:border-white/10 dark:bg-slate-950/70 transition-shadow hover:shadow-xl hover:shadow-slate-900/10`}
                >
                  {/* Header */}
                  <div className="flex items-start gap-4 p-5 border-b border-slate-200/60 dark:border-white/10">
                    <div className="h-11 w-11 flex-shrink-0 rounded-full bg-gradient-to-br from-sky-500 to-violet-500 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                      {candidateInitials(name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-semibold text-slate-900 dark:text-white truncate">
                        {name}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                        {app.offer?.title || "Offer"} · {app.offer?.company || "Unknown company"}
                      </p>
                    </div>
                    <span className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${cfg.badge}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                      {cfg.label}
                    </span>
                  </div>

                  {/* Body */}
                  <div className="p-5 space-y-4">
                    {/* Meta row */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <MetaChip icon={<Mail className="h-3.5 w-3.5" />} value={app.student?.email || "—"} />
                      <MetaChip icon={<CalendarDays className="h-3.5 w-3.5" />} value={fmtDate(app.createdAt)} />
                    </div>

                    {/* Documents */}
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 h-8 text-xs"
                        onClick={() => void openFile(app.id, "cv")}
                        disabled={busyId === app.id}
                      >
                        <FileText className="h-3.5 w-3.5" />
                        CV
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 h-8 text-xs"
                        onClick={() => void openFile(app.id, "cover-letter")}
                        disabled={busyId === app.id}
                      >
                        <Mail className="h-3.5 w-3.5" />
                        Cover letter
                      </Button>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between gap-2 border-t border-slate-200/60 dark:border-white/10 pt-4">
                      {app.status === "ACCEPTED" ? (() => {
                        const appSlots = slotsMap[app.id] ?? [];
                        const activeSlot = appSlots.find(s => s.status !== "DECLINED");
                        if (activeSlot) {
                          const slotLabel =
                            activeSlot.status === "CONFIRMED" ? "Confirmed" :
                            activeSlot.status === "PROPOSED"  ? "Awaiting response" :
                            "Scheduled";
                          return (
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                              <CalendarDays className="h-3.5 w-3.5" />
                              Scheduled · {slotLabel}
                            </div>
                          );
                        }
                        return (
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1.5 border-sky-400/40 text-sky-700 hover:bg-sky-50 dark:text-sky-300 dark:hover:bg-sky-900/20"
                            onClick={() => {
                              setSchedulingAppId(app.id);
                              setSlotStart(""); setSlotEnd(""); setSlotNotes("");
                            }}
                            disabled={busyId === app.id}
                          >
                            <CalendarDays className="h-3.5 w-3.5" />
                            Schedule interview
                          </Button>
                        );
                      })() : (
                        <div /> /* spacer */
                      )}

                      {canAct && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1.5 border-rose-300/60 text-rose-600 hover:bg-rose-50 hover:border-rose-400 dark:text-rose-400 dark:hover:bg-rose-900/20"
                            onClick={() => void act(app.id, "reject")}
                            disabled={busyId === app.id}
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            Reject
                          </Button>
                          <Button
                            size="sm"
                            className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                            onClick={() => void act(app.id, "accept")}
                            disabled={busyId === app.id}
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Accept
                          </Button>
                        </div>
                      )}
                    </div>
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
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, applications.length)} of {applications.length} applications
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

      {/* Schedule modal */}
      {schedulingAppId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border border-white/50 bg-white dark:bg-slate-900 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-900 dark:text-white">Schedule interview</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Propose a time slot to the candidate</p>
              </div>
              <button
                onClick={() => setSchedulingAppId(null)}
                className="rounded-full p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Start</label>
                <input
                  type="datetime-local"
                  value={slotStart}
                  onChange={(e) => setSlotStart(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300">End</label>
                <input
                  type="datetime-local"
                  value={slotEnd}
                  onChange={(e) => setSlotEnd(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300">Note (optional)</label>
                <textarea
                  rows={3}
                  placeholder="Meeting link, location, instructions…"
                  value={slotNotes}
                  onChange={(e) => setSlotNotes(e.target.value)}
                  className="w-full resize-none rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-1">
              <Button variant="outline" size="sm" onClick={() => setSchedulingAppId(null)}>
                Cancel
              </Button>
              <Button size="sm" onClick={() => void submitSlot()} disabled={!!busyId} className="gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" />
                Send proposal
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

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
    sky:     { wrap: "bg-sky-500/8 border-sky-500/15",     text: "text-sky-700 dark:text-sky-300",     num: "text-sky-700 dark:text-sky-200" },
    amber:   { wrap: "bg-amber-500/8 border-amber-500/15", text: "text-amber-700 dark:text-amber-300", num: "text-amber-700 dark:text-amber-200" },
    emerald: { wrap: "bg-emerald-500/8 border-emerald-500/15", text: "text-emerald-700 dark:text-emerald-300", num: "text-emerald-700 dark:text-emerald-200" },
    rose:    { wrap: "bg-rose-500/8 border-rose-500/15",   text: "text-rose-700 dark:text-rose-300",   num: "text-rose-700 dark:text-rose-200" },
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

function MetaChip({ icon, value }: { icon: React.ReactNode; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-slate-50/80 dark:bg-white/5 px-3 py-2 text-slate-600 dark:text-slate-300">
      <span className="text-slate-400 shrink-0">{icon}</span>
      <span className="truncate text-xs">{value}</span>
    </div>
  );
}

function fmtDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}