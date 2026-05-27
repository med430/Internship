"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CalendarClock,
  Clock,
  Video,
  Check,
  X,
  RefreshCw,
  Loader2,
  Building2,
  User,
  ChevronRight,
  CalendarOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { InterviewSlot } from "@/lib/api/interview-slots";
import { useInterviewSchedule } from "../hooks/use-interview-schedule";

// ── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString([], {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

function formatTimeRange(startIso: string, endIso: string) {
  const fmt = (iso: string) =>
    new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return `${fmt(startIso)} – ${fmt(endIso)}`;
}

function toDateKey(iso: string) {
  return new Date(iso).toDateString();
}

function groupByDate(slots: InterviewSlot[]) {
  const map = new Map<string, InterviewSlot[]>();
  for (const s of slots) {
    const key = toDateKey(s.startAt);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(s);
  }
  return Array.from(map.entries()).map(([dateKey, items]) => ({ dateKey, items }));
}

function relativeDay(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === tomorrow.toDateString()) return "Tomorrow";
  return formatDate(iso);
}

function counterpartName(slot: InterviewSlot): string {
  // Recruiter gets studentName; student gets recruiterName
  return slot.studentName ?? slot.recruiterName ?? slot.company ?? "Your interviewer";
}

// ── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: InterviewSlot["status"] }) {
  const map: Record<InterviewSlot["status"], { label: string; className: string }> = {
    CONFIRMED: {
      label: "Confirmed",
      className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
    },
    PROPOSED: {
      label: "Pending",
      className: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
    },
    ACCEPTED: {
      label: "Accepted",
      className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
    },
    DECLINED: {
      label: "Declined",
      className: "bg-muted text-muted-foreground",
    },
  };
  const { label, className } = map[status] ?? map.DECLINED;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium font-label",
        className,
      )}
    >
      <span
        className={cn(
          "h-1.5 w-1.5 rounded-full",
          status === "CONFIRMED" || status === "ACCEPTED"
            ? "bg-emerald-500"
            : status === "PROPOSED"
              ? "bg-amber-500"
              : "bg-muted-foreground",
        )}
      />
      {label}
    </span>
  );
}

// ── Counter-propose dialog ────────────────────────────────────────────────────

interface CounterDialogProps {
  slotId: string;
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: {
    counterStartAt: string;
    counterEndAt: string;
    counterNotes?: string;
  }) => Promise<void>;
  responding: boolean;
}

function CounterDialog({
  slotId: _slotId,
  open,
  onClose,
  onSubmit,
  responding,
}: CounterDialogProps) {
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [notes, setNotes] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!startAt || !endAt) {
      setErr("Please fill in both start and end times.");
      return;
    }
    if (new Date(startAt) >= new Date(endAt)) {
      setErr("Start time must be before end time.");
      return;
    }
    setErr(null);
    try {
      await onSubmit({
        counterStartAt: new Date(startAt).toISOString(),
        counterEndAt: new Date(endAt).toISOString(),
        counterNotes: notes.trim() || undefined,
      });
      onClose();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to submit counter-proposal");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-heading">Propose a New Time</DialogTitle>
          <DialogDescription className="font-body text-sm">
            Suggest an alternative time for the interview. The other party will
            be notified.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="font-label text-xs">Start time</Label>
              <input
                type="datetime-local"
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="font-label text-xs">End time</Label>
              <input
                type="datetime-local"
                value={endAt}
                onChange={(e) => setEndAt(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-body focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="font-label text-xs">Notes (optional)</Label>
            <Textarea
              placeholder="Any context for the counter-proposal…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="resize-none font-body text-sm"
              rows={2}
            />
          </div>

          {err && <p className="text-xs text-destructive font-body">{err}</p>}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="font-label">
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={responding} className="font-label">
            {responding && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Send Proposal
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Slot card ────────────────────────────────────────────────────────────────

interface SlotCardProps {
  slot: InterviewSlot;
  currentUserId: string | null;
  responding: boolean;
  roomBasePath: string;
  onRespond: (
    slotId: string,
    action: "accept" | "decline" | "counter",
    payload?: { counterStartAt: string; counterEndAt: string; counterNotes?: string },
  ) => Promise<void>;
}

function SlotCard({ slot, currentUserId, responding, roomBasePath, onRespond }: SlotCardProps) {
  const router = useRouter();
  const [counterOpen, setCounterOpen] = useState(false);
  const isPast = new Date(slot.endAt) < new Date();
  const isMine = slot.proposedByUserId === currentUserId;
  const counterpart = counterpartName(slot);

  return (
    <>
      <div
        className={cn(
          "rounded-2xl border border-border bg-card p-4 transition-all duration-150",
          isPast && slot.status !== "CONFIRMED" && "opacity-50",
        )}
      >
        {/* Top row: time + status */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2 text-sm font-medium font-label text-foreground">
            <Clock className="h-4 w-4 text-primary shrink-0" />
            {formatTimeRange(slot.startAt, slot.endAt)}
          </div>
          <StatusBadge status={slot.status} />
        </div>

        {/* Offer + company */}
        <div className="space-y-1 mb-3">
          <p className="text-sm font-semibold font-heading text-foreground line-clamp-1">
            {slot.offerTitle ?? "Interview"}
          </p>
          <div className="flex items-center gap-3 text-xs text-muted-foreground font-body">
            {slot.company && (
              <span className="flex items-center gap-1">
                <Building2 className="h-3 w-3" />
                {slot.company}
              </span>
            )}
            {counterpart && (
              <span className="flex items-center gap-1">
                <User className="h-3 w-3" />
                {counterpart}
              </span>
            )}
          </div>
        </div>

        {/* Notes */}
        {slot.notes && (
          <p className="text-xs text-muted-foreground font-body italic mb-3 line-clamp-2">
            "{slot.notes}"
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* CONFIRMED → Join button */}
          {(slot.status === "CONFIRMED" || slot.status === "ACCEPTED") && (
            <Button
              size="sm"
              onClick={() =>
                router.push(`${roomBasePath}?slot=${slot.id}`)
              }
              className="gap-1.5 font-label"
            >
              <Video className="h-4 w-4" />
              Join Interview
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          )}

          {/* PROPOSED + I'm the receiver → Accept / Decline / Counter */}
          {slot.status === "PROPOSED" && !isMine && (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onRespond(slot.id, "accept")}
                disabled={responding}
                className="gap-1.5 font-label border-emerald-500/50 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
              >
                {responding ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Check className="h-3.5 w-3.5" />
                )}
                Accept
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onRespond(slot.id, "decline")}
                disabled={responding}
                className="gap-1.5 font-label border-destructive/40 text-destructive hover:bg-destructive/5"
              >
                <X className="h-3.5 w-3.5" />
                Decline
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setCounterOpen(true)}
                disabled={responding}
                className="gap-1.5 font-label text-muted-foreground"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Counter-propose
              </Button>
            </>
          )}

          {/* PROPOSED + I proposed it → awaiting badge */}
          {slot.status === "PROPOSED" && isMine && (
            <span className="text-xs text-muted-foreground font-body italic">
              Awaiting their response…
            </span>
          )}

          {/* DECLINED → label */}
          {slot.status === "DECLINED" && (
            <span className="text-xs text-muted-foreground font-body">
              This time slot was declined
            </span>
          )}
        </div>
      </div>

      <CounterDialog
        slotId={slot.id}
        open={counterOpen}
        onClose={() => setCounterOpen(false)}
        onSubmit={(payload) => onRespond(slot.id, "counter", payload)}
        responding={responding}
      />
    </>
  );
}

// ── Skeletons ────────────────────────────────────────────────────────────────

function ScheduleSkeleton() {
  return (
    <div className="space-y-8">
      {[0, 1].map((g) => (
        <div key={g} className="space-y-3">
          <Skeleton className="h-5 w-32 rounded-full" />
          {[0, 1].map((i) => (
            <div key={i} className="rounded-2xl border border-border p-4 space-y-3">
              <div className="flex justify-between">
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-8 w-28 rounded-lg" />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ── Root screen ───────────────────────────────────────────────────────────────

export function InterviewScheduleScreen({
  roomBasePath = "/services/interviews/room",
}: {
  roomBasePath?: string;
} = {}) {
  const { slots, loading, error, respondingId, currentUserId, respond } =
    useInterviewSchedule();

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <CalendarClock className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold font-heading">Interviews</h1>
        </div>
        <ScheduleSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <CalendarClock className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold font-heading">Interviews</h1>
        </div>
        <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6 text-center">
          <p className="text-sm text-destructive font-body">{error}</p>
        </div>
      </div>
    );
  }

  const groups = groupByDate(slots);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <CalendarClock className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold font-heading">Interviews</h1>
          <p className="text-sm text-muted-foreground font-body">
            {slots.length === 0
              ? "No interviews scheduled"
              : `${slots.filter((s) => s.status === "CONFIRMED" || s.status === "ACCEPTED").length} confirmed`}
          </p>
        </div>
      </div>

      {/* Empty state */}
      {slots.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-muted-foreground">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
            <CalendarOff className="h-8 w-8 opacity-40" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold font-heading text-foreground">
              No interviews yet
            </p>
            <p className="text-xs font-body mt-1">
              Interviews will appear here once a recruiter schedules one for
              your application.
            </p>
          </div>
        </div>
      )}

      {/* Date groups */}
      <div className="space-y-8">
        {groups.map(({ dateKey, items }) => (
          <section key={dateKey} className="space-y-3">
            {/* Date heading */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold font-label text-muted-foreground uppercase tracking-wider">
                {relativeDay(items[0].startAt)}
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Slot cards */}
            {items.map((slot) => (
              <SlotCard
                key={slot.id}
                slot={slot}
                currentUserId={currentUserId}
                roomBasePath={roomBasePath}
                responding={respondingId === slot.id}
                onRespond={respond}
              />
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
