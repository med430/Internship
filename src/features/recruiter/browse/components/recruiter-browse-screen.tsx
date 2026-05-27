"use client";

import React, { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  BadgeDollarSign,
  Briefcase,
  Building2,
  CalendarDays,
  ChevronRight,
  MapPin,
  Search,
  SlidersHorizontal,
  Sparkles,
  Wifi,
} from "lucide-react";
import OfferFilterModal, { type OfferFilters } from "@/components/offer-filter-modal";
import { applyOfferFilters, getOfferFilterTags } from "@/lib/utils/offer-filters";
import { fetchOffers, type Offer } from "@/lib/api/offers";
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

function fmt(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

function companyInitials(company?: string): string {
  if (!company) return "?";
  return company.split(/\s+/).map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

const WORK_MODE_STYLE: Record<string, string> = {
  REMOTE:  "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  ONSITE:  "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  HYBRID:  "bg-violet-500/10 text-violet-700 dark:text-violet-300",
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

/* ── component ────────────────────────────────────────────────────── */

const PAGE_SIZE = 12;

function getPaginationItems(currentPage: number, totalPages: number): Array<number | "ellipsis"> {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  if (currentPage <= 3) return [1, 2, 3, 4, "ellipsis", totalPages];
  if (currentPage >= totalPages - 2) return [1, "ellipsis", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  return [1, "ellipsis", currentPage - 1, currentPage, currentPage + 1, "ellipsis", totalPages];
}

export function RecruiterBrowseScreen() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<OfferFilters>({});
  const [filterOpen, setFilterOpen] = useState(false);
  const [detailOffer, setDetailOffer] = useState<Offer | null>(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchOffers(1, 500)
      .then(setOffers)
      .catch(() => toast.error("Failed to load offers"))
      .finally(() => setLoading(false));
  }, []);

  const activeFilterTags = useMemo(() => getOfferFilterTags(filters), [filters]);

  const filtered = useMemo(
    () => applyOfferFilters(offers, filters, search),
    [offers, filters, search],
  );

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page],
  );

  const removeFilter = (key: keyof OfferFilters, value: string) => {
    setPage(1);
    setFilters((prev) => {
      const arr = (prev[key] as string[] | undefined) ?? [];
      return { ...prev, [key]: arr.filter((v) => v !== value) };
    });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.14),transparent_28%),radial-gradient(circle_at_top_left,rgba(244,114,182,0.12),transparent_24%),linear-gradient(180deg,rgba(248,250,252,0.88),rgba(255,255,255,1))] dark:bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.18),transparent_28%),radial-gradient(circle_at_top_left,rgba(244,114,182,0.14),transparent_24%),linear-gradient(180deg,rgba(2,6,23,0.92),rgba(2,6,23,1))]">
      <div className="mx-auto max-w-7xl px-6 py-8 space-y-6">

        {/* Header */}
        <div className="flex flex-col gap-4 rounded-3xl border border-white/50 bg-white/75 p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.45)] backdrop-blur dark:border-white/10 dark:bg-slate-950/70 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/15 bg-violet-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-violet-700 dark:text-violet-300">
              <Sparkles className="h-3.5 w-3.5" />
              Browse offers
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
              All offers
            </h1>
            <p className="max-w-2xl text-sm text-slate-600 dark:text-slate-300">
              Browse all published offers — see what candidates see and benchmark your own postings.
            </p>
          </div>
          {!loading && (
            <div className="shrink-0 flex flex-col items-end gap-1">
              <span className="text-3xl font-bold text-slate-900 dark:text-white">{filtered.length}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {filtered.length === offers.length ? "total offers" : `of ${offers.length} offers`}
              </span>
            </div>
          )}
        </div>

        {/* Search + filter */}
        <div className="space-y-3 rounded-2xl border border-white/50 bg-white/75 p-4 shadow backdrop-blur dark:border-white/10 dark:bg-slate-950/70">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                className="pl-9 bg-white/80 dark:bg-slate-900/60"
                placeholder="Search by title, company or location…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
            <Button
              variant="outline"
              className="gap-2 bg-white/80 dark:bg-slate-900/60"
              onClick={() => setFilterOpen(true)}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {activeFilterTags.length > 0 && (
                <Badge variant="secondary" className="h-5 w-5 rounded-full p-0 text-xs">
                  {activeFilterTags.length}
                </Badge>
              )}
            </Button>
          </div>
          {activeFilterTags.length > 0 && (
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs text-slate-500 dark:text-slate-400">Active:</span>
              {activeFilterTags.map((tag) => (
                <Badge
                  key={`${tag.key}-${tag.value}`}
                  variant="secondary"
                  className="gap-1 cursor-pointer pr-1"
                  onClick={() => removeFilter(tag.key, tag.value)}
                >
                  {tag.label}
                  <span className="ml-0.5 rounded-full hover:bg-slate-300/40 p-0.5">✕</span>
                </Badge>
              ))}
              <button
                className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 underline"
                onClick={() => { setFilters({}); setPage(1); }}
              >
                Clear all
              </button>
            </div>
          )}
        </div>

        {/* Skeleton */}
        {loading && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-white/60 bg-white/85 shadow-lg backdrop-blur dark:border-white/10 dark:bg-slate-950/70 p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <Skeleton className="h-10 w-10 rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-36" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-full" />
                </div>
                <Skeleton className="h-12 w-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-300 bg-white/70 py-20 text-center dark:border-white/10 dark:bg-slate-950/60">
            <div className="rounded-full bg-violet-500/10 p-4">
              <Briefcase className="h-6 w-6 text-violet-600 dark:text-violet-300" />
            </div>
            <div className="space-y-1">
              <p className="text-base font-semibold">
                {offers.length === 0 ? "No offers published yet" : "No offers match your filters"}
              </p>
              <p className="text-sm text-muted-foreground">
                {offers.length === 0
                  ? "Offers will appear here once recruiters start posting."
                  : "Try adjusting your search or clearing the filters."}
              </p>
            </div>
          </div>
        )}

        {/* Offer grid */}
        {!loading && filtered.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {paginated.map((o) => (
              <button
                key={o.id}
                type="button"
                onClick={() => setDetailOffer(o)}
                className="group text-left w-full rounded-2xl border border-white/60 bg-white/85 shadow-lg shadow-slate-900/5 backdrop-blur dark:border-white/10 dark:bg-slate-950/70 hover:border-violet-300/60 hover:shadow-violet-500/10 hover:shadow-xl transition-all duration-200 overflow-hidden"
              >
                {/* Card header */}
                <div className="p-5 pb-4">
                  <div className="flex items-start gap-3.5">
                    {/* Company avatar */}
                    <div className="h-10 w-10 flex-shrink-0 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-white/10">
                      {companyInitials(o.company)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate group-hover:text-violet-700 dark:group-hover:text-violet-300 transition-colors">
                        {o.title}
                      </p>
                      <div className="flex items-center gap-1 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        <Building2 className="h-3 w-3 shrink-0" />
                        <span className="truncate">{o.company}</span>
                      </div>
                    </div>
                    {o.isPaid && (
                      <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-300">
                        <BadgeDollarSign className="h-3 w-3" />
                        Paid
                      </span>
                    )}
                  </div>
                </div>

                {/* Badges */}
                <div className="px-5 pb-4 flex flex-wrap gap-1.5">
                  {o.workMode && (
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold ${WORK_MODE_STYLE[o.workMode] ?? "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300"}`}>
                      <Wifi className="h-3 w-3" />
                      {WORK_MODE_LABEL[o.workMode] ?? o.workMode}
                    </span>
                  )}
                  {o.type && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-600 dark:bg-white/10 dark:text-slate-300">
                      <Briefcase className="h-3 w-3" />
                      {OFFER_TYPE_LABEL[o.type] ?? o.type}
                    </span>
                  )}
                  {o.domain && (
                    <span className="rounded-full border border-slate-200 dark:border-white/10 px-2.5 py-1 text-[10px] font-medium text-slate-500 dark:text-slate-400">
                      {o.domain}
                    </span>
                  )}
                </div>

                {/* Description preview */}
                <div className="px-5 pb-4">
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {o.description || "No description provided."}
                  </p>
                </div>

                {/* Footer */}
                <div className="px-5 py-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-[10px] text-slate-400 dark:text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {o.location || "—"}
                    </span>
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-3 w-3" />
                      {fmt(o.startDate)}
                    </span>
                  </div>
                  <span className="text-[10px] font-medium text-violet-600 dark:text-violet-400 flex items-center gap-0.5 group-hover:underline">
                    View <ChevronRight className="h-3 w-3" />
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-2xl border border-white/50 bg-white/75 px-5 py-3 shadow backdrop-blur dark:border-white/10 dark:bg-slate-950/70">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} offers
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

      {/* Filter modal */}
      <OfferFilterModal
        isOpen={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        onApplyFilters={(f) => { setFilters(f); setPage(1); setFilterOpen(false); }}
      />

      {/* Detail dialog */}
      <Dialog open={!!detailOffer} onOpenChange={(open) => { if (!open) setDetailOffer(null); }}>
        <DialogContent className="w-[95vw] sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          {detailOffer && (
            <>
              <DialogHeader className="space-y-3">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 flex-shrink-0 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center text-sm font-bold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10">
                    {companyInitials(detailOffer.company)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <DialogTitle className="text-xl">{detailOffer.title}</DialogTitle>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground mt-1">
                      {detailOffer.company && (
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3.5 w-3.5" />{detailOffer.company}
                        </span>
                      )}
                      {detailOffer.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5" />{detailOffer.location}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-5 pt-2">
                {/* Badges */}
                <div className="flex flex-wrap gap-2">
                  {detailOffer.workMode && (
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${WORK_MODE_STYLE[detailOffer.workMode] ?? "bg-slate-100 text-slate-600"}`}>
                      <Wifi className="h-3.5 w-3.5" />
                      {WORK_MODE_LABEL[detailOffer.workMode] ?? detailOffer.workMode}
                    </span>
                  )}
                  {detailOffer.type && (
                    <Badge variant="secondary" className="gap-1">
                      <Briefcase className="h-3 w-3" />
                      {OFFER_TYPE_LABEL[detailOffer.type] ?? detailOffer.type}
                    </Badge>
                  )}
                  {detailOffer.domain && (
                    <Badge variant="outline">{detailOffer.domain}</Badge>
                  )}
                  {detailOffer.isPaid && (
                    <Badge variant="secondary" className="gap-1 text-emerald-700 dark:text-emerald-400">
                      <BadgeDollarSign className="h-3 w-3" />
                      Paid
                    </Badge>
                  )}
                </div>

                {/* Dates */}
                <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground border-t pt-4">
                  <span className="flex items-center gap-1.5">
                    <CalendarDays className="h-4 w-4" />
                    Start: <strong className="text-foreground">{fmt(detailOffer.startDate)}</strong>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CalendarDays className="h-4 w-4" />
                    End: <strong className="text-foreground">{fmt(detailOffer.endDate)}</strong>
                  </span>
                </div>

                {/* Description */}
                <div className="border-t pt-4">
                  <p className="text-sm font-semibold mb-2">Description</p>
                  <p className="text-sm whitespace-pre-wrap leading-relaxed text-muted-foreground">
                    {detailOffer.description || "No description provided."}
                  </p>
                </div>

                {/* Skills */}
                {detailOffer.skillRequirements && detailOffer.skillRequirements.length > 0 && (
                  <div className="border-t pt-4">
                    <p className="text-sm font-semibold mb-3">Required skills</p>
                    <div className="flex flex-wrap gap-2">
                      {detailOffer.skillRequirements.map((sr) => (
                        <Badge key={sr.id} variant="outline" className="gap-1.5">
                          {sr.skill.name}
                          <span className="text-muted-foreground text-[10px]">{sr.level}</span>
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}