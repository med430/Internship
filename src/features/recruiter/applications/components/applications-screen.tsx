"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Briefcase, CalendarDays, CheckCircle2, FileText, MapPin, Mail, Sparkles, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  fetchRecruiterApplications,
  openRecruiterApplicationFile,
  updateRecruiterApplicationStatus,
  type RecruiterApplication,
} from "@/lib/api/recruiter-applications";

function statusTone(status: string) {
  switch (status) {
    case "ACCEPTED":
      return "bg-emerald-500/15 text-emerald-700 ring-1 ring-emerald-500/20 dark:text-emerald-300";
    case "REJECTED":
      return "bg-rose-500/15 text-rose-700 ring-1 ring-rose-500/20 dark:text-rose-300";
    case "WITHDRAWN":
      return "bg-zinc-500/15 text-zinc-700 ring-1 ring-zinc-500/20 dark:text-zinc-300";
    default:
      return "bg-amber-500/15 text-amber-700 ring-1 ring-amber-500/20 dark:text-amber-300";
  }
}

export function RecruiterApplicationsScreen() {
  const [applications, setApplications] = useState<RecruiterApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadApplications = async () => {
    setLoading(true);
    try {
      const data = await fetchRecruiterApplications(1, 200);
      setApplications(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadApplications();
  }, []);

  const stats = useMemo(() => {
    const pending = applications.filter((application) => application.status === "SUBMITTED" || application.status === "IN_REVIEW").length;
    const accepted = applications.filter((application) => application.status === "ACCEPTED").length;
    const rejected = applications.filter((application) => application.status === "REJECTED").length;
    return { total: applications.length, pending, accepted, rejected };
  }, [applications]);

  const action = async (id: string, verb: "accept" | "reject") => {
    setBusyId(id);
    try {
      await updateRecruiterApplicationStatus(id, verb);
      toast.success(verb === "accept" ? "Application accepted" : "Application rejected");
      await loadApplications();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Action failed");
    } finally {
      setBusyId(null);
    }
  };

  const openFile = async (id: string, type: "cv" | "cover-letter") => {
    setBusyId(id);
    try {
      await openRecruiterApplicationFile(id, type);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to open file");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.14),transparent_28%),radial-gradient(circle_at_top_left,rgba(244,114,182,0.12),transparent_24%),linear-gradient(180deg,rgba(248,250,252,0.88),rgba(255,255,255,1))] dark:bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.18),transparent_28%),radial-gradient(circle_at_top_left,rgba(244,114,182,0.14),transparent_24%),linear-gradient(180deg,rgba(2,6,23,0.92),rgba(2,6,23,1))]">
      <div className="mx-auto max-w-7xl px-6 py-8 space-y-6">
        <div className="flex flex-col gap-6 rounded-3xl border border-white/50 bg-white/75 p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.45)] backdrop-blur dark:border-white/10 dark:bg-slate-950/70">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/15 bg-sky-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-700 dark:text-sky-300">
                <Sparkles className="h-3.5 w-3.5" />
                Recruiter workspace
              </div>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">Applications</h1>
              <p className="max-w-2xl text-sm text-slate-600 dark:text-slate-300">
                Review candidates, open their CV and motivation letter, and move them through your hiring pipeline.
              </p>
            </div>
            <Button onClick={loadApplications} variant="outline" className="w-fit">
              Refresh
            </Button>
          </div>

          <div className="grid gap-3 md:grid-cols-4">
            <StatCard label="Total" value={stats.total} accent="text-sky-600" />
            <StatCard label="Pending" value={stats.pending} accent="text-amber-600" />
            <StatCard label="Accepted" value={stats.accepted} accent="text-emerald-600" />
            <StatCard label="Rejected" value={stats.rejected} accent="text-rose-600" />
          </div>
        </div>

        {loading ? (
          <div className="text-sm text-slate-600 dark:text-slate-300">Loading applications...</div>
        ) : applications.length === 0 ? (
          <Card className="border-dashed bg-white/70 dark:bg-slate-950/60">
            <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <div className="rounded-full bg-sky-500/10 p-4 text-sky-600 dark:text-sky-300">
                <Briefcase className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <div className="text-lg font-semibold">No applications yet</div>
                <div className="text-sm text-muted-foreground">
                  When students apply to your offers, they’ll appear here with their CV and motivation letter.
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {applications.map((application) => {
              const canAct = application.status !== "ACCEPTED" && application.status !== "REJECTED" && application.status !== "WITHDRAWN";

              return (
                <Card key={application.id} className="overflow-hidden border-white/60 bg-white/85 shadow-lg shadow-slate-900/5 backdrop-blur dark:border-white/10 dark:bg-slate-950/70">
                  <CardHeader className="border-b border-slate-200/70 dark:border-white/10">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <CardTitle className="text-xl">
                          {application.student?.name || application.student?.username || application.student?.email || "Candidate"}
                        </CardTitle>
                        <CardDescription>
                          {application.offer?.title || "Offer"} • {application.offer?.company || "Unknown company"}
                        </CardDescription>
                      </div>
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${statusTone(application.status)}`}>
                        {application.status}
                      </span>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-5 py-5">
                    <div className="grid gap-3 text-sm sm:grid-cols-2">
                      <InfoLine icon={<UserRound className="h-4 w-4" />} label="Student" value={application.student?.email || application.student?.id || "Unknown"} />
                      <InfoLine icon={<Briefcase className="h-4 w-4" />} label="Offer" value={application.offer?.title || application.offer?.id || "Unknown"} />
                      <InfoLine icon={<MapPin className="h-4 w-4" />} label="Location" value={application.offer?.location || "Unknown"} />
                      <InfoLine icon={<CalendarDays className="h-4 w-4" />} label="Submitted" value={new Date(application.createdAt).toLocaleString()} />
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button variant="outline" onClick={() => void openFile(application.id, "cv")} disabled={busyId === application.id}>
                        <FileText className="h-4 w-4" />
                        View CV
                      </Button>
                      <Button variant="outline" onClick={() => void openFile(application.id, "cover-letter")} disabled={busyId === application.id}>
                        <Mail className="h-4 w-4" />
                        View motivation letter
                      </Button>
                    </div>

                    <div className="flex flex-wrap justify-end gap-2 pt-1">
                      <Button
                        variant="outline"
                        onClick={() => void action(application.id, "reject")}
                        disabled={!canAct || busyId === application.id}
                      >
                        <CheckCircle2 className="h-4 w-4 rotate-180" />
                        Reject
                      </Button>
                      <Button
                        onClick={() => void action(application.id, "accept")}
                        disabled={!canAct || busyId === application.id}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Accept
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function InfoLine({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-slate-200/70 bg-slate-50/70 px-3 py-2.5 dark:border-white/10 dark:bg-white/5">
      <div className="mt-0.5 text-slate-500 dark:text-slate-300">{icon}</div>
      <div className="min-w-0">
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{label}</div>
        <div className="truncate text-sm font-medium text-slate-900 dark:text-white">{value}</div>
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }: { label: string; value: number; accent: string }) {
  return (
    <div className="rounded-2xl border border-slate-200/70 bg-white/80 px-4 py-3 shadow-sm dark:border-white/10 dark:bg-white/5">
      <div className={`text-2xl font-semibold ${accent}`}>{value}</div>
      <div className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{label}</div>
    </div>
  );
}
