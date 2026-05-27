"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Briefcase,
  Building2,
  CalendarDays,
  ChevronDown,
  CircleDollarSign,
  Clock,
  Filter,
  Loader2,
  MapPin,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CVSelector, type CVSource } from "@/components/shared/cv-selector";
import {
  CoverLetterSelector,
  type CoverLetterSource,
} from "@/components/shared/cover-letter-selector";
import { fetchOffers, type Offer } from "@/lib/api/offers";
import { createApplication } from "@/lib/api/applications";
import { fetchWithAuth } from "@/lib/api/auth";
import { getClientApiBaseUrl } from "@/lib/api/client-utils";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { uploadCoverLetter } from "@/lib/api/cover-letters";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 9;

/* ─── Helpers ──────────────────────────────────────────────────────── */

function getPaginationItems(currentPage: number, totalPages: number): Array<number | "ellipsis"> {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  if (currentPage <= 3) return [1, 2, 3, 4, "ellipsis", totalPages];
  if (currentPage >= totalPages - 2) return [1, "ellipsis", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  return [1, "ellipsis", currentPage - 1, currentPage, currentPage + 1, "ellipsis", totalPages];
}

function formatDate(iso?: string) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function companyInitials(name: string) {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const TYPE_COLORS: Record<string, string> = {
  INTERNSHIP: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  PFE: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  RESEARCH: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  PHD: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  ALTERNANCE: "bg-teal-500/10 text-teal-600 dark:text-teal-400",
};

const WORKMODE_COLORS: Record<string, string> = {
  REMOTE: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  HYBRID: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
  ONSITE: "bg-slate-500/10 text-slate-600 dark:text-slate-400",
};

const AVATAR_COLORS = [
  "bg-violet-500", "bg-blue-500", "bg-emerald-500",
  "bg-amber-500", "bg-rose-500", "bg-teal-500", "bg-orange-500", "bg-pink-500",
];

function avatarColor(company: string) {
  let hash = 0;
  for (const c of company) hash = (hash * 31 + c.charCodeAt(0)) & 0xffffff;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

/* ─── Upload helpers (unchanged logic) ────────────────────────────── */

async function uploadCoverLetterIfNeeded(source: CoverLetterSource): Promise<string> {
  if (source.type === "database") return source.letter.id;
  const uploaded = await uploadCoverLetter(source.file);
  return uploaded.id;
}

async function uploadCvIfNeeded(source: CVSource): Promise<string> {
  if (source.type === "database") return source.cv.id;
  const apiUrl = getClientApiBaseUrl();
  const form = new FormData();
  form.append("cv", source.file);
  const response = await fetchWithAuth(`${apiUrl}/cvs`, { method: "POST", body: form });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || "Failed to upload CV");
  }
  const payload = (await response.json()) as { id?: string };
  if (!payload.id) throw new Error("Uploaded CV id not returned");
  return payload.id;
}

/* ─── Offer Card ───────────────────────────────────────────────────── */

function OfferCard({ offer, onApply }: { offer: Offer; onApply: (o: Offer) => void }) {
  const color = avatarColor(offer.company);
  const typeLabel = offer.type ? offer.type.charAt(0) + offer.type.slice(1).toLowerCase() : null;
  const modeLabel = offer.workMode ? offer.workMode.charAt(0) + offer.workMode.slice(1).toLowerCase() : null;
  const start = formatDate(offer.startDate);
  const end = formatDate(offer.endDate);

  return (
    <div className="group flex flex-col rounded-2xl border border-border bg-card hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 transition-all duration-200">
      {/* Header */}
      <div className="p-5 pb-3 flex items-start gap-4">
        {/* Company avatar */}
        <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white text-sm font-bold", color)}>
          {companyInitials(offer.company)}
        </div>

        <div className="min-w-0 flex-1">
          <Link
            href={`/services/offers/${offer.id}`}
            className="text-sm font-semibold text-foreground hover:text-primary transition-colors line-clamp-1"
          >
            {offer.title}
          </Link>
          <div className="flex items-center gap-1.5 mt-0.5 text-xs text-muted-foreground">
            <Building2 className="h-3 w-3 shrink-0" />
            <span className="truncate">{offer.company}</span>
            {offer.location && (
              <>
                <span className="text-border">·</span>
                <MapPin className="h-3 w-3 shrink-0" />
                <span className="truncate">{offer.location}</span>
              </>
            )}
          </div>
        </div>

        {/* Paid badge */}
        <span className={cn(
          "shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full",
          offer.isPaid
            ? "bg-green-500/10 text-green-600 dark:text-green-400"
            : "bg-muted text-muted-foreground",
        )}>
          {offer.isPaid ? "Paid" : "Unpaid"}
        </span>
      </div>

      {/* Badges row */}
      <div className="px-5 pb-3 flex flex-wrap gap-1.5">
        {typeLabel && (
          <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", TYPE_COLORS[offer.type] ?? "bg-muted text-muted-foreground")}>
            {typeLabel}
          </span>
        )}
        {modeLabel && (
          <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", WORKMODE_COLORS[offer.workMode] ?? "bg-muted text-muted-foreground")}>
            {modeLabel}
          </span>
        )}
        {offer.domain && (
          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
            {offer.domain}
          </span>
        )}
      </div>

      {/* Description */}
      <div className="px-5 pb-3 flex-1">
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
          {offer.description}
        </p>
      </div>

      {/* Skills */}
      {offer.skillRequirements && offer.skillRequirements.length > 0 && (
        <div className="px-5 pb-3 flex flex-wrap gap-1">
          {offer.skillRequirements.slice(0, 4).map((sr) => (
            <span key={sr.id} className="text-[10px] px-2 py-0.5 rounded-md bg-primary/8 text-primary font-medium border border-primary/10">
              {sr.skill.name}
            </span>
          ))}
          {offer.skillRequirements.length > 4 && (
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
              +{offer.skillRequirements.length - 4}
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="px-5 py-3 border-t border-border flex items-center justify-between gap-3">
        {/* Dates */}
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <CalendarDays className="h-3 w-3 shrink-0" />
          {start && end ? (
            <span>{start} → {end}</span>
          ) : start ? (
            <span>From {start}</span>
          ) : (
            <span className="italic">No date</span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" asChild className="h-7 text-xs px-3">
            <Link href={`/services/offers/${offer.id}`}>Details</Link>
          </Button>
          <Button size="sm" onClick={() => onApply(offer)} className="h-7 text-xs px-3">
            Apply
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ─── Skeleton Card ─────────────────────────────────────────────────── */

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 space-y-3 animate-pulse">
      <div className="flex items-start gap-4">
        <div className="h-11 w-11 rounded-xl bg-muted shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 bg-muted rounded w-3/4" />
          <div className="h-3 bg-muted rounded w-1/2" />
        </div>
      </div>
      <div className="flex gap-2">
        <div className="h-5 w-16 bg-muted rounded-full" />
        <div className="h-5 w-14 bg-muted rounded-full" />
      </div>
      <div className="space-y-1.5">
        <div className="h-3 bg-muted rounded w-full" />
        <div className="h-3 bg-muted rounded w-5/6" />
        <div className="h-3 bg-muted rounded w-4/6" />
      </div>
    </div>
  );
}

/* ─── Main Screen ───────────────────────────────────────────────────── */

type ApplyModalState = { open: boolean; offer: Offer | null };
type CoverLetterSource2 = CoverLetterSource;

const ALL_TYPES = ["INTERNSHIP", "PFE", "RESEARCH", "PHD", "ALTERNANCE"];
const ALL_MODES = ["REMOTE", "HYBRID", "ONSITE"];

export function OffersScreen() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loadingOffers, setLoadingOffers] = useState(true);
  const [applyState, setApplyState] = useState<ApplyModalState>({ open: false, offer: null });
  const [selectedCv, setSelectedCv] = useState<CVSource | null>(null);
  const [selectedCoverLetter, setSelectedCoverLetter] = useState<CoverLetterSource2 | null>(null);
  const [submittingApplication, setSubmittingApplication] = useState(false);
  const [page, setPage] = useState(1);

  /* ── Filters ── */
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [modeFilter, setModeFilter] = useState<string[]>([]);
  const [paidOnly, setPaidOnly] = useState(false);

  useEffect(() => {
    let mounted = true;
    setLoadingOffers(true);
    fetchOffers(1, 100)
      .then((data) => { if (mounted) setOffers(data); })
      .catch((err) => toast.error(err instanceof Error ? err.message : "Failed to load offers"))
      .finally(() => { if (mounted) setLoadingOffers(false); });
    return () => { mounted = false; };
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return offers
      .filter((o) => {
        if (q && !o.title.toLowerCase().includes(q) && !o.company.toLowerCase().includes(q)) return false;
        if (typeFilter.length && !typeFilter.includes(o.type)) return false;
        if (modeFilter.length && !modeFilter.includes(o.workMode)) return false;
        if (paidOnly && !o.isPaid) return false;
        return true;
      })
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [offers, search, typeFilter, modeFilter, paidOnly]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page],
  );

  const hasFilters = typeFilter.length > 0 || modeFilter.length > 0 || paidOnly || search;

  const clearFilters = () => {
    setSearch("");
    setTypeFilter([]);
    setModeFilter([]);
    setPaidOnly(false);
    setPage(1);
  };

  const openApplyModal = (offer: Offer) => {
    setSelectedCv(null);
    setSelectedCoverLetter(null);
    setApplyState({ open: true, offer });
  };

  const closeApplyModal = () => {
    setApplyState({ open: false, offer: null });
    setSubmittingApplication(false);
  };

  const submitApplication = async () => {
    if (!applyState.offer || !selectedCv) {
      toast.error("Please select a CV before applying");
      return;
    }
    setSubmittingApplication(true);
    try {
      const cvId = await uploadCvIfNeeded(selectedCv);
      const coverLetterId = selectedCoverLetter
        ? await uploadCoverLetterIfNeeded(selectedCoverLetter)
        : undefined;
      await createApplication({ offerId: applyState.offer.id, cvId, ...(coverLetterId ? { coverLetterId } : {}) });
      toast.success("Application submitted successfully");
      closeApplyModal();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to submit application");
      setSubmittingApplication(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* ── Page header ── */}
      <div className="border-b border-border bg-gradient-to-r from-background via-muted/30 to-background px-6 py-6">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 rounded-xl bg-primary/10">
              <Briefcase className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Browse Offers</h1>
          </div>
          <p className="text-sm text-muted-foreground ml-[52px]">
            {loadingOffers ? "Loading opportunities…" : `${offers.length} opportunities from top companies`}
          </p>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-6 py-6 space-y-5">
        {/* ── Search & Filters ── */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search by title or company…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9 h-9"
            />
          </div>

          {/* Type filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className={cn("h-9 gap-1.5", typeFilter.length && "border-primary text-primary")}>
                <Filter className="h-3.5 w-3.5" />
                Type
                {typeFilter.length > 0 && <Badge variant="secondary" className="h-4 px-1 text-[10px]">{typeFilter.length}</Badge>}
                <ChevronDown className="h-3.5 w-3.5 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-44">
              <DropdownMenuLabel className="text-xs">Offer type</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {ALL_TYPES.map((t) => (
                <DropdownMenuCheckboxItem
                  key={t}
                  checked={typeFilter.includes(t)}
                  onCheckedChange={(v) => {
                    setTypeFilter((prev) => v ? [...prev, t] : prev.filter((x) => x !== t));
                    setPage(1);
                  }}
                  className="text-xs"
                >
                  {t.charAt(0) + t.slice(1).toLowerCase()}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Work mode filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className={cn("h-9 gap-1.5", modeFilter.length && "border-primary text-primary")}>
                <Clock className="h-3.5 w-3.5" />
                Mode
                {modeFilter.length > 0 && <Badge variant="secondary" className="h-4 px-1 text-[10px]">{modeFilter.length}</Badge>}
                <ChevronDown className="h-3.5 w-3.5 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-40">
              <DropdownMenuLabel className="text-xs">Work mode</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {ALL_MODES.map((m) => (
                <DropdownMenuCheckboxItem
                  key={m}
                  checked={modeFilter.includes(m)}
                  onCheckedChange={(v) => {
                    setModeFilter((prev) => v ? [...prev, m] : prev.filter((x) => x !== m));
                    setPage(1);
                  }}
                  className="text-xs"
                >
                  {m.charAt(0) + m.slice(1).toLowerCase()}
                </DropdownMenuCheckboxItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Paid only */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => { setPaidOnly((v) => !v); setPage(1); }}
            className={cn("h-9 gap-1.5", paidOnly && "border-green-500 text-green-600 dark:text-green-400")}
          >
            <CircleDollarSign className="h-3.5 w-3.5" />
            Paid only
          </Button>

          {/* Clear */}
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-9 gap-1.5 text-muted-foreground">
              <X className="h-3.5 w-3.5" />
              Clear
            </Button>
          )}

          <div className="ml-auto text-xs text-muted-foreground">
            {!loadingOffers && `${filtered.length} result${filtered.length !== 1 ? "s" : ""}`}
          </div>
        </div>

        {/* ── Grid ── */}
        {loadingOffers ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="p-4 rounded-2xl bg-muted mb-4">
              <Sparkles className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-sm font-semibold text-foreground mb-1">No offers found</h3>
            <p className="text-xs text-muted-foreground mb-4">
              {hasFilters ? "Try adjusting your filters." : "No offers available right now."}
            </p>
            {hasFilters && (
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {paginated.map((offer) => (
              <OfferCard key={offer.id} offer={offer} onApply={openApplyModal} />
            ))}
          </div>
        )}

        {/* ── Pagination ── */}
        {!loadingOffers && totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-xl border border-border bg-card/60 px-5 py-3">
            <p className="text-xs text-muted-foreground">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} offers
            </p>
            <Pagination className="w-fit mx-0">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious onClick={() => setPage((p) => Math.max(1, p - 1))} className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"} />
                </PaginationItem>
                {getPaginationItems(page, totalPages).map((item, i) =>
                  item === "ellipsis" ? (
                    <PaginationItem key={"e-" + i}><PaginationEllipsis /></PaginationItem>
                  ) : (
                    <PaginationItem key={item}>
                      <PaginationLink isActive={item === page} onClick={() => setPage(item)} className="cursor-pointer">{item}</PaginationLink>
                    </PaginationItem>
                  ),
                )}
                <PaginationItem>
                  <PaginationNext onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"} />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>

      {/* ── Apply Modal ── */}
      <Dialog open={applyState.open} onOpenChange={(open) => { if (!open) closeApplyModal(); }}>
        <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Apply to {applyState.offer?.title ?? "Offer"}</DialogTitle>
            <DialogDescription>
              Select a CV and optional cover letter to submit your application.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <CVSelector onCVSelect={setSelectedCv} />
            <CoverLetterSelector onSelect={setSelectedCoverLetter} />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={closeApplyModal} disabled={submittingApplication}>
                Cancel
              </Button>
              <Button onClick={submitApplication} disabled={submittingApplication}>
                {submittingApplication ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" />Submitting…</>
                ) : (
                  "Submit Application"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default OffersScreen;
