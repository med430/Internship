"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useOffers } from "../hooks/use-offers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  BadgeDollarSign,
  Briefcase,
  Building2,
  CalendarDays,
  MapPin,
  Pencil,
  PlusCircle,
  Search,
  SlidersHorizontal,
  Sparkles,
  Trash2,
  Wifi,
} from "lucide-react";
import OfferFilterModal, { type OfferFilters } from "@/components/offer-filter-modal";
import { applyOfferFilters, getOfferFilterTags } from "@/lib/utils/offer-filters";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const WORK_MODE_LABEL: Record<string, string> = {
  REMOTE: "Remote",
  ONSITE: "On-site",
  HYBRID: "Hybrid",
};

const WORK_MODE_STYLE: Record<string, string> = {
  REMOTE: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  ONSITE: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  HYBRID: "bg-violet-500/10 text-violet-700 dark:text-violet-300",
};

const OFFER_TYPE_LABEL: Record<string, string> = {
  INTERNSHIP: "Internship",
  PFE: "PFE",
  RESEARCH: "Research",
  PHD: "PhD",
  ALTERNANCE: "Alternance",
};

const PAGE_SIZE = 12;

function getPaginationItems(currentPage: number, totalPages: number): Array<number | "ellipsis"> {
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
  if (currentPage <= 3) return [1, 2, 3, 4, "ellipsis", totalPages];
  if (currentPage >= totalPages - 2) return [1, "ellipsis", totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  return [1, "ellipsis", currentPage - 1, currentPage, currentPage + 1, "ellipsis", totalPages];
}

function companyInitials(company?: string): string {
  if (!company) return "?";
  return company.split(/\s+/).map((w) => w[0]).join("").toUpperCase().slice(0, 2);
}

export function RecruiterOffersScreen() {
  const { offers, loading, removeOffer } = useOffers();
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<OfferFilters>({});
  const [filterOpen, setFilterOpen] = useState(false);
  const [page, setPage] = useState(1);

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
        <div className="flex flex-col gap-4 rounded-3xl border border-white/50 bg-white/75 p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.45)] backdrop-blur dark:border-white/10 dark:bg-slate-950/70 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/15 bg-sky-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-700 dark:text-sky-300">
              <Sparkles className="h-3.5 w-3.5" />
              My offers
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
              Manage your offers
            </h1>
            <p className="max-w-2xl text-sm text-slate-600 dark:text-slate-300">
              Create and manage the positions students see, then review the applications that come in.
            </p>
          </div>
          <Link href="/recruiter/offers/new">
            <Button className="gap-2">
              <PlusCircle className="h-4 w-4" />
              Post an offer
            </Button>
          </Link>
        </div>

        {/* Search + filter bar */}
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
            <span className="flex items-center text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap px-1">
              {filtered.length} / {offers.length}
            </span>
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
                <Skeleton className="h-10 w-full" />
                <div className="flex justify-between gap-2">
                  <Skeleton className="h-4 w-24" />
                  <div className="flex gap-2">
                    <Skeleton className="h-8 w-16 rounded-md" />
                    <Skeleton className="h-8 w-16 rounded-md" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-300 bg-white/70 py-20 text-center dark:border-white/10 dark:bg-slate-950/60">
            <div className="rounded-full bg-sky-500/10 p-4">
              <Briefcase className="h-6 w-6 text-sky-600 dark:text-sky-300" />
            </div>
            <div className="space-y-1">
              <p className="text-base font-semibold text-slate-900 dark:text-white">
                {offers.length === 0 ? "No offers yet" : "No offers match your filters"}
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {offers.length === 0
                  ? "Post your first offer and start receiving applications from talented students."
                  : "Try adjusting your search or clearing the filters."}
              </p>
            </div>
            {offers.length === 0 && (
              <Link href="/recruiter/offers/new">
                <Button className="mt-2 gap-2">
                  <PlusCircle className="h-4 w-4" />
                  Post your first offer
                </Button>
              </Link>
            )}
          </div>
        )}

        {/* Offer cards */}
        {!loading && filtered.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {paginated.map((o: any) => (
              <div
                key={o.id}
                className="rounded-2xl border border-white/60 bg-white/85 shadow-lg shadow-slate-900/5 backdrop-blur dark:border-white/10 dark:bg-slate-950/70 overflow-hidden flex flex-col"
              >
                {/* Card header */}
                <div className="p-5 pb-4">
                  <div className="flex items-start gap-3.5">
                    <div className="h-10 w-10 flex-shrink-0 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-white/10">
                      {companyInitials(o.company)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
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
                <div className="px-5 pb-4 flex-1">
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                    {o.description || "No description provided."}
                  </p>
                </div>

                {/* Footer */}
                <div className="px-5 py-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 text-[10px] text-slate-400 dark:text-slate-500 min-w-0">
                    <span className="flex items-center gap-1 truncate">
                      <MapPin className="h-3 w-3 shrink-0" />
                      {o.location || "—"}
                    </span>
                    <span className="flex items-center gap-1 shrink-0">
                      <CalendarDays className="h-3 w-3" />
                      {fmt(o.startDate)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Link href={`/recruiter/offers/${o.id}`}>
                      <Button size="sm" variant="outline" className="h-7 gap-1.5 text-xs">
                        <Pencil className="h-3 w-3" />
                        Edit
                      </Button>
                    </Link>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="h-7 gap-1.5 text-xs"
                      onClick={async () => {
                        if (confirm("Delete this offer?")) await removeOffer(o.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
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

      <OfferFilterModal
        isOpen={filterOpen}
        onClose={() => setFilterOpen(false)}
        filters={filters}
        onApplyFilters={(f) => { setFilters(f); setPage(1); setFilterOpen(false); }}
      />
    </div>
  );
}

function fmt(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

