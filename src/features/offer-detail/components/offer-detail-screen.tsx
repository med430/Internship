"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(relativeTime);
import {
  ArrowLeft,
  Bookmark,
  Building2,
  CalendarClock,
  CalendarRange,
  Globe2,
  Languages,
  Loader2,
  MapPin,
  Send,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CVSelector, type CVSource } from "@/components/shared/cv-selector";
import {
  CoverLetterSelector,
  type CoverLetterSource,
} from "@/components/shared/cover-letter-selector";
import { fetchOfferDetail } from "@/lib/api/offer-detail-client";
import { createApplication } from "@/lib/api/applications";
import { fetchWithAuth } from "@/lib/api/auth";
import { getClientApiBaseUrl } from "@/lib/api/client-utils";
import { tracking } from "@/lib/api/tracking-client";
import { cn, formatTag, toTitleCase } from "@/lib/utils";
import type { OfferDetailDocument, OfferSkill } from "@/types/job-matcher";

interface OfferDetailScreenProps {
  offerId: string;
}

export function OfferDetailScreen({ offerId }: OfferDetailScreenProps) {
  const router = useRouter();
  const [offer, setOffer] = useState<OfferDetailDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false);
  const [selectedCv, setSelectedCv] = useState<CVSource | null>(null);
  const [selectedCoverLetter, setSelectedCoverLetter] =
    useState<CoverLetterSource | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [now] = useState(() => Date.now());
  const trackedViewRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const data = await fetchOfferDetail(offerId);
      if (cancelled) return;
      if (!data) {
        setNotFound(true);
      } else {
        setOffer(data);
        setIsSaved(data.bookmarked);
        if (trackedViewRef.current !== offerId) {
          trackedViewRef.current = offerId;
          tracking.trackView(offerId, tracking.consumeOfferViewSource(offerId));
        }
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [offerId]);

  const toggleSave = useCallback(() => {
    setIsSaved((prev) => {
      const next = !prev;
      if (next) tracking.trackBookmark(offerId);
      else tracking.trackUnbookmark(offerId);
      return next;
    });
  }, [offerId]);

  const applicationDeadline = offer?.application_deadline ?? null;
  const daysLeft = useMemo(() => {
    if (!applicationDeadline) return null;
    return Math.ceil(
      (new Date(applicationDeadline).getTime() - now) /
        86_400_000,
    );
  }, [applicationDeadline, now]);

  const handleApply = useCallback(async () => {
    if (!offer || !selectedCv) {
      toast.error("Select a CV to apply");
      return;
    }
    setSubmitting(true);
    try {
      const cvId = await resolveCvId(selectedCv);
      const coverLetterId = resolveCoverLetterId(selectedCoverLetter);
      await createApplication({ offerId: offer.id, cvId, coverLetterId });
      toast.success("Application submitted");
      setApplyOpen(false);
    } catch (err) {
      toast.error((err as Error).message || "Failed to submit application");
    } finally {
      setSubmitting(false);
    }
  }, [offer, selectedCv, selectedCoverLetter]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (notFound || !offer) {
    return (
      <div className="container mx-auto max-w-2xl px-6 py-20 text-center space-y-4">
        <h1 className="text-2xl font-semibold">Offer not found</h1>
        <p className="text-muted-foreground">
          This offer may have been removed or the link is no longer valid.
        </p>
        <Button asChild>
          <Link href="/services/jobmatcher">Back to feed</Link>
        </Button>
      </div>
    );
  }

  const matchScore = offer.match_score ?? 0;
  const breakdownItems = getBreakdownItems(offer.score_breakdown, offer.skills.length > 0);
  const matchTone =
    matchScore >= 80
      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:text-emerald-400"
      : matchScore >= 65
        ? "bg-blue-500/10 text-blue-600 border-blue-500/30 dark:text-blue-400"
        : matchScore >= 50
          ? "bg-violet-500/10 text-violet-600 border-violet-500/30 dark:text-violet-400"
          : "bg-orange-500/10 text-orange-600 border-orange-500/30 dark:text-orange-400";
  const isUrgent = daysLeft !== null && daysLeft > 0 && daysLeft <= 3;

  return (
    <div className="container mx-auto max-w-6xl px-6 py-10">
      {/* Back link */}
      <Button
        variant="ghost"
        size="sm"
        className="mb-6 -ml-2 text-muted-foreground"
        onClick={() => router.back()}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>

      {/* Hero */}
      <header className="rounded-2xl border border-border bg-gradient-to-br from-primary/5 via-card to-card p-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 border border-border flex items-center justify-center flex-shrink-0">
              <Building2 className="w-7 h-7 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-muted-foreground font-medium mb-1">
                {offer.company}
              </p>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground leading-tight">
                {offer.title}
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  {toTitleCase(offer.location)}
                </span>
                <span className="text-border">·</span>
                <span>{formatTag(offer.employment_type)}</span>
                <span className="text-border">·</span>
                <span className="inline-flex items-center gap-1.5">
                  <Globe2 className="w-4 h-4" />
                  {formatTag(offer.work_model)}
                </span>
              </div>
            </div>
          </div>

          {offer.match_score !== null && (
            <div
              className={cn(
                "shrink-0 self-start rounded-xl border px-4 py-3 text-center",
                matchTone,
              )}
            >
              <div className="text-2xl font-bold tabular-nums leading-none">
                {matchScore}%
              </div>
              <div className="text-[11px] font-medium uppercase tracking-wider mt-1 inline-flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                match
              </div>
            </div>
          )}
        </div>

        {/* Status chip row */}
        <div className="flex flex-wrap items-center gap-2 mt-6">
          <Badge
            variant="outline"
            className={cn(
              "gap-1 border",
              offer.is_paid
                ? "border-emerald-500/30 text-emerald-700 dark:text-emerald-400 bg-emerald-500/5"
                : "border-border text-muted-foreground bg-muted/30",
            )}
          >
            <Wallet className="w-3.5 h-3.5" />
            {offer.is_paid ? "Paid" : "Unpaid"}
          </Badge>
          {daysLeft !== null && daysLeft > 0 && (
            <Badge
              variant="outline"
              className={cn(
                "gap-1 border",
                isUrgent
                  ? "border-orange-500/30 text-orange-600 dark:text-orange-400 bg-orange-500/10"
                  : "border-border text-muted-foreground bg-muted/30",
              )}
            >
              <CalendarClock className="w-3.5 h-3.5" />
              {daysLeft} days left to apply
            </Badge>
          )}
          {offer.positions_count > 1 && (
            <Badge variant="outline" className="gap-1 border-border">
              <Users className="w-3.5 h-3.5" />
              {offer.positions_count} positions
            </Badge>
          )}
        </div>

        {/* Action row */}
        <div className="flex flex-wrap items-center gap-3 mt-6 pt-6 border-t border-border/60">
          <Button
            size="lg"
            className="gap-2 px-6"
            onClick={() => setApplyOpen(true)}
          >
            <Send className="w-4 h-4" />
            Apply now
          </Button>
          <Button
            variant={isSaved ? "secondary" : "outline"}
            size="lg"
            className="gap-2"
            onClick={toggleSave}
          >
            <Bookmark className={cn("w-4 h-4", isSaved && "fill-current")} />
            {isSaved ? "Saved" : "Save"}
          </Button>
        </div>
      </header>

      {/* Two-column body */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 mt-8">
        {/* Main column */}
        <main className="space-y-8 min-w-0">
          <Section title="About this role">
            <p className="text-foreground/90 leading-relaxed whitespace-pre-line">
              {offer.description || "No description provided."}
            </p>
          </Section>

          {offer.skills.length > 0 && (
            <Section title="Skills required">
              <ul className="space-y-2.5">
                {offer.skills.map((skill) => (
                  <SkillRow key={skill.id} skill={skill} />
                ))}
              </ul>
            </Section>
          )}

          {offer.languages_required.length > 0 && (
            <Section title="Languages">
              <div className="flex flex-wrap gap-2">
                {offer.languages_required.map((lang) => (
                  <Badge
                    key={lang}
                    variant="outline"
                    className="gap-1 border-border"
                  >
                    <Languages className="w-3.5 h-3.5" />
                    {toTitleCase(lang)}
                  </Badge>
                ))}
              </div>
            </Section>
          )}

          {(offer.start_date || offer.end_date) && (
            <Section title="Timeline">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarRange className="w-4 h-4" />
                {offer.start_date && (
                  <span>
                    Starts {dayjs(offer.start_date).format("MMM D, YYYY")}
                  </span>
                )}
                {offer.start_date && offer.end_date && (
                  <span className="text-border">·</span>
                )}
                {offer.end_date && (
                  <span>
                    Ends {dayjs(offer.end_date).format("MMM D, YYYY")}
                  </span>
                )}
              </div>
            </Section>
          )}
        </main>

        {/* Sidebar */}
        <aside className="space-y-6 lg:sticky lg:top-24 self-start">
          <SidebarCard title="At a glance">
            <SidebarRow label="Posted" value={dayjs(offer.posted_date).fromNow()} />
            {offer.application_deadline && (
              <SidebarRow
                label="Deadline"
                value={dayjs(offer.application_deadline).format("MMM D")}
              />
            )}
            <SidebarRow
              label="Positions"
              value={String(offer.positions_count)}
            />
            <SidebarRow label="Domain" value={toTitleCase(offer.domain || "—")} />
            <SidebarRow
              label="Compensation"
              value={offer.salary || (offer.is_paid ? "Paid" : "Unpaid")}
            />
          </SidebarCard>

          {breakdownItems.length > 0 && (
            <SidebarCard title="Why we matched you">
              <div className="space-y-2.5">
                {breakdownItems.map((item) => (
                  <ScoreBar
                    key={item.key}
                    label={item.label}
                    value={item.value}
                  />
                ))}
              </div>
            </SidebarCard>
          )}
        </aside>
      </div>

      {/* Apply dialog */}
      <Dialog open={applyOpen} onOpenChange={setApplyOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Apply to {offer.title}</DialogTitle>
            <DialogDescription>
              Pick the CV (and optional cover letter) you want to send to {offer.company}.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-2">
            <div>
              <h4 className="text-sm font-medium mb-2">CV</h4>
              <CVSelector onCVSelect={(cv) => setSelectedCv(cv)} />
            </div>
            <div>
              <h4 className="text-sm font-medium mb-2">Cover letter (optional)</h4>
              <CoverLetterSelector
                onSelect={(letter) => setSelectedCoverLetter(letter)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setApplyOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button onClick={handleApply} disabled={submitting || !selectedCv}>
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting…
                </>
              ) : (
                "Submit application"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="text-base font-semibold text-foreground mb-3">{title}</h2>
      {children}
    </section>
  );
}

function SkillRow({ skill }: { skill: OfferSkill }) {
  return (
    <li className="flex items-center justify-between rounded-lg border border-border/60 bg-card/50 px-3.5 py-2.5">
      <div className="flex items-center gap-2 min-w-0">
        <span className="font-medium text-sm text-foreground truncate">
          {skill.name}
        </span>
        {skill.mandatory && (
          <Badge
            variant="outline"
            className="text-[10px] border-red-500/30 text-red-600 dark:text-red-400 bg-red-500/5 ml-1"
          >
            required
          </Badge>
        )}
      </div>
      <span className="text-xs text-muted-foreground font-medium">
        {toTitleCase(skill.level)}
      </span>
    </li>
  );
}

function SidebarCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h3 className="text-sm font-semibold text-foreground mb-3">{title}</h3>
      <div className="space-y-2.5 text-sm">{children}</div>
    </div>
  );
}

function SidebarRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground text-right">{value}</span>
    </div>
  );
}

function ScoreBar({ label, value }: { label: string; value: number }) {
  const normalized = value > 1 ? value / 100 : value;
  const pct = Math.round(Math.max(0, Math.min(1, normalized)) * 100);
  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium tabular-nums text-foreground">{pct}%</span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

const BREAKDOWN_LABELS = [
  { key: "skillMatch", label: "Required skills" },
  { key: "domainMatch", label: "Domain preference" },
  { key: "locationMatch", label: "Location preference" },
  { key: "workModeMatch", label: "Work mode" },
  { key: "availabilityScore", label: "Availability" },
  { key: "languageMatch", label: "Languages" },
  { key: "offerTypeMatch", label: "Offer type" },
] as const;

function getBreakdownItems(
  breakdown: Record<string, number | undefined> | null,
  hasRequiredSkills: boolean,
) {
  if (!breakdown) return [];

  return BREAKDOWN_LABELS.flatMap(({ key, label }) => {
    if (key === "skillMatch" && !hasRequiredSkills) return [];

    const value = breakdown[key];
    if (typeof value !== "number" || !Number.isFinite(value)) return [];

    return [{ key, label, value }];
  });
}

async function resolveCvId(source: CVSource): Promise<string> {
  if (source.type === "database") return source.cv.id;
  const apiUrl = getClientApiBaseUrl();
  const form = new FormData();
  form.append("cv", source.file);
  const response = await fetchWithAuth(`${apiUrl}/cvs`, {
    method: "POST",
    body: form,
  });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || "Failed to upload CV");
  }
  const payload = (await response.json()) as { id?: string };
  if (!payload.id) throw new Error("Uploaded CV id not returned");
  return payload.id;
}

function resolveCoverLetterId(source: CoverLetterSource | null): string | undefined {
  if (!source || source.type !== "database") return undefined;
  return source.letter.id;
}
