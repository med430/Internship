"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { EventClickArg } from "@fullcalendar/core";
import { toast } from "sonner";
import { CalendarDays, X, Check, RefreshCw, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  fetchMyInterviewSlots,
  respondToInterviewSlot,
  type InterviewSlot,
} from "@/lib/api/interview-slots";

type SlotStatus = InterviewSlot["status"];

const STATUS_COLORS: Record<SlotStatus, string> = {
  PROPOSED:  "#f59e0b",
  ACCEPTED:  "#3b82f6",
  DECLINED:  "#6b7280",
  CONFIRMED: "#10b981",
};

const STATUS_LABELS: Record<SlotStatus, string> = {
  PROPOSED:  "Pending your response",
  ACCEPTED:  "Accepted",
  DECLINED:  "Declined",
  CONFIRMED: "Confirmed",
};

export function CalendarScreen({ role }: { role: "STUDENT" | "RECRUITER" }) {
  const [slots, setSlots] = useState<InterviewSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<InterviewSlot | null>(null);
  const [busy, setBusy] = useState(false);
  const [showCounter, setShowCounter] = useState(false);
  const [counterStart, setCounterStart] = useState("");
  const [counterEnd, setCounterEnd] = useState("");
  const [counterNotes, setCounterNotes] = useState("");
  const calendarRef = useRef<FullCalendar>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchMyInterviewSlots();
      setSlots(data);
    } catch {
      toast.error("Failed to load interview slots");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const events = slots.map((slot) => ({
    id: slot.id,
    title: slot.offerTitle ?? slot.company ?? "Interview",
    start: slot.startAt,
    end: slot.endAt,
    backgroundColor: STATUS_COLORS[slot.status],
    borderColor: STATUS_COLORS[slot.status],
    extendedProps: { slot },
  }));

  const handleEventClick = (info: EventClickArg) => {
    const slot = (info.event.extendedProps as { slot: InterviewSlot }).slot;
    setSelected(slot);
    setShowCounter(false);
    setCounterStart("");
    setCounterEnd("");
    setCounterNotes("");
  };

  const respond = async (action: "accept" | "decline" | "counter") => {
    if (!selected) return;
    if (action === "counter" && (!counterStart || !counterEnd)) {
      toast.error("Please set a counter-proposal date and time");
      return;
    }
    setBusy(true);
    try {
      await respondToInterviewSlot(selected.id, {
        action,
        counterStartAt: counterStart || undefined,
        counterEndAt: counterEnd || undefined,
        counterNotes: counterNotes || undefined,
      });
      toast.success(
        action === "accept" ? "Interview confirmed!" :
        action === "decline" ? "Date declined" :
        "Counter-proposal sent"
      );
      setSelected(null);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Action failed");
    } finally {
      setBusy(false);
    }
  };

  const upcoming = slots
    .filter(s => s.status === "CONFIRMED" && new Date(s.startAt) > new Date())
    .sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime())
    .slice(0, 3);

  const pending = slots.filter(s => s.status === "PROPOSED");

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.14),transparent_28%),linear-gradient(180deg,rgba(248,250,252,0.88),rgba(255,255,255,1))] dark:bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.18),transparent_28%),linear-gradient(180deg,rgba(2,6,23,0.92),rgba(2,6,23,1))]">
      <div className="mx-auto max-w-7xl px-6 py-8 space-y-6">

        {/* Header */}
        <div className="flex flex-col gap-2 rounded-3xl border border-white/50 bg-white/75 p-6 shadow-lg backdrop-blur dark:border-white/10 dark:bg-slate-950/70">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/15 bg-sky-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-700 dark:text-sky-300 w-fit">
            <CalendarDays className="h-3.5 w-3.5" />
            Interview calendar
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">My Schedule</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            View and manage your interview appointments.
          </p>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-2">
            {(Object.entries(STATUS_LABELS) as [SlotStatus, string][]).map(([s, label]) => (
              <div key={s} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: STATUS_COLORS[s] }} />
                {label}
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">

          {/* Calendar */}
          <div className="rounded-3xl border border-white/50 bg-white/90 p-4 shadow-lg backdrop-blur dark:border-white/10 dark:bg-slate-950/80">
            {loading ? (
              <div className="flex items-center justify-center h-96 text-slate-500">Loading...</div>
            ) : (
              <FullCalendar
                ref={calendarRef}
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="timeGridWeek"
                headerToolbar={{
                  left: "prev,next today",
                  center: "title",
                  right: "dayGridMonth,timeGridWeek,timeGridDay",
                }}
                events={events}
                eventClick={handleEventClick}
                height="auto"
                locale="fr"
                firstDay={1}
                slotMinTime="08:00:00"
                slotMaxTime="20:00:00"
                nowIndicator
                buttonText={{ today: "Today", month: "Month", week: "Week", day: "Day" }}
              />
            )}
          </div>

          {/* Right panel */}
          <div className="space-y-4">

            {/* Pending responses (student only) */}
            {role === "STUDENT" && pending.length > 0 && (
              <Card className="border-amber-500/20 bg-amber-50/50 dark:bg-amber-950/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-amber-700 dark:text-amber-300 flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Pending ({pending.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {pending.map(slot => (
                    <button
                      key={slot.id}
                      onClick={() => { setSelected(slot); setShowCounter(false); }}
                      className="w-full text-left rounded-xl border border-amber-200/60 bg-white/70 dark:bg-white/5 px-3 py-2 text-sm hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors"
                    >
                      <div className="font-medium text-slate-900 dark:text-white">{slot.offerTitle ?? "Interview"}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {new Date(slot.startAt).toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </div>
                    </button>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Upcoming confirmed */}
            {upcoming.length > 0 && (
              <Card className="border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    Upcoming confirmed
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {upcoming.map(slot => (
                    <div key={slot.id} className="rounded-xl border border-emerald-200/60 bg-white/70 dark:bg-white/5 px-3 py-2 text-sm">
                      <div className="font-medium text-slate-900 dark:text-white">{slot.offerTitle ?? "Interview"}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {new Date(slot.startAt).toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}
                      </div>
                      {slot.studentName && (
                        <div className="text-xs text-slate-400">{slot.studentName}</div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {slots.length === 0 && !loading && (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center justify-center gap-2 py-10 text-center">
                  <CalendarDays className="h-8 w-8 text-slate-400" />
                  <p className="text-sm text-slate-500">No interviews scheduled yet</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Slot detail panel */}
        {selected && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <Card className="w-full max-w-md bg-white dark:bg-slate-900 shadow-2xl">
              <CardHeader className="flex flex-row items-start justify-between gap-4 pb-3">
                <div>
                  <CardTitle className="text-lg">{selected.offerTitle ?? "Interview"}</CardTitle>
                  <p className="text-sm text-slate-500 mt-0.5">{selected.company}</p>
                </div>
                <button onClick={() => setSelected(null)} className="rounded-full p-1 hover:bg-slate-100 dark:hover:bg-slate-800">
                  <X className="h-4 w-4" />
                </button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-xl bg-slate-50 dark:bg-white/5 px-4 py-3 space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Start</span>
                    <span className="font-medium">{new Date(selected.startAt).toLocaleString("fr-FR")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">End</span>
                    <span className="font-medium">{new Date(selected.endAt).toLocaleString("fr-FR")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Status</span>
                    <span className="font-semibold" style={{ color: STATUS_COLORS[selected.status] }}>
                      {STATUS_LABELS[selected.status]}
                    </span>
                  </div>
                  {selected.notes && (
                    <div className="pt-1 border-t border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300">
                      {selected.notes}
                    </div>
                  )}
                  {selected.studentName && (
                    <div className="flex justify-between pt-1 border-t border-slate-200 dark:border-white/10">
                      <span className="text-slate-500">Candidate</span>
                      <span className="font-medium">{selected.studentName}</span>
                    </div>
                  )}
                </div>

                {/* Student actions for PROPOSED slots */}
                {role === "STUDENT" && selected.status === "PROPOSED" && (
                  <div className="space-y-3">
                    {!showCounter ? (
                      <div className="flex gap-2">
                        <Button
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                          onClick={() => void respond("accept")}
                          disabled={busy}
                        >
                          <Check className="h-4 w-4 mr-1" /> Accept
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => void respond("decline")}
                          disabled={busy}
                        >
                          <X className="h-4 w-4 mr-1" /> Decline
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => setShowCounter(true)}
                          disabled={busy}
                          title="Propose another date"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Propose another date</p>
                        <div className="space-y-2">
                          <label className="text-xs text-slate-500">Start</label>
                          <input
                            type="datetime-local"
                            value={counterStart}
                            onChange={e => setCounterStart(e.target.value)}
                            className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs text-slate-500">End</label>
                          <input
                            type="datetime-local"
                            value={counterEnd}
                            onChange={e => setCounterEnd(e.target.value)}
                            className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3 py-2 text-sm"
                          />
                        </div>
                        <textarea
                          placeholder="Note (optional)"
                          value={counterNotes}
                          onChange={e => setCounterNotes(e.target.value)}
                          rows={2}
                          className="w-full rounded-lg border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 px-3 py-2 text-sm resize-none"
                        />
                        <div className="flex gap-2">
                          <Button className="flex-1" onClick={() => void respond("counter")} disabled={busy}>
                            Send proposal
                          </Button>
                          <Button variant="outline" onClick={() => setShowCounter(false)} disabled={busy}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
