"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useOffers } from "../hooks/use-offers";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Briefcase, CalendarDays, MapPin, Search, Sparkles, X } from "lucide-react";
import { CAREER_DOMAINS } from "@/lib/constants/domains";

export function RecruiterOffersScreen() {
  const { offers, loading, removeOffer } = useOffers();
  const [search, setSearch] = useState("");
  const [domainFilter, setDomainFilter] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return offers.filter((o: any) => {
      const matchSearch =
        !q ||
        o.title?.toLowerCase().includes(q) ||
        o.company?.toLowerCase().includes(q) ||
        o.location?.toLowerCase().includes(q);
      const matchDomain = !domainFilter || o.domain === domainFilter;
      return matchSearch && matchDomain;
    });
  }, [offers, search, domainFilter]);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.14),transparent_28%),radial-gradient(circle_at_top_left,rgba(244,114,182,0.12),transparent_24%),linear-gradient(180deg,rgba(248,250,252,0.88),rgba(255,255,255,1))] dark:bg-[radial-gradient(circle_at_top_right,rgba(14,165,233,0.18),transparent_28%),radial-gradient(circle_at_top_left,rgba(244,114,182,0.14),transparent_24%),linear-gradient(180deg,rgba(2,6,23,0.92),rgba(2,6,23,1))]">
      <div className="mx-auto max-w-7xl px-6 py-8 space-y-6">

        {/* Header */}
        <div className="flex flex-col gap-4 rounded-3xl border border-white/50 bg-white/75 p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.45)] backdrop-blur dark:border-white/10 dark:bg-slate-950/70 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/15 bg-sky-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-700 dark:text-sky-300">
              <Sparkles className="h-3.5 w-3.5" />
              Recruiter workspace
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">Offers</h1>
            <p className="max-w-2xl text-sm text-slate-600 dark:text-slate-300">
              Create and manage the positions students see, then review the applications that come in.
            </p>
          </div>
          <Link href="/recruiter/offers/new">
            <Button>Create offer</Button>
          </Link>
        </div>

        {/* Search + filter bar */}
        <div className="flex flex-col gap-3 rounded-2xl border border-white/50 bg-white/75 p-4 shadow backdrop-blur dark:border-white/10 dark:bg-slate-950/70 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              className="pl-9 bg-white/80 dark:bg-slate-900/60"
              placeholder="Search by title, company or location…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="relative">
            <select
              className="h-10 w-full appearance-none rounded-md border border-input bg-white/80 px-3 pr-8 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-500 dark:bg-slate-900/60 dark:border-white/10 dark:text-white sm:w-56"
              value={domainFilter}
              onChange={(e) => setDomainFilter(e.target.value)}
            >
              <option value="">All domains</option>
              {CAREER_DOMAINS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {(search || domainFilter) && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-slate-500"
              onClick={() => { setSearch(""); setDomainFilter(""); }}
            >
              <X className="h-3.5 w-3.5" /> Clear
            </Button>
          )}

          <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
            {filtered.length} / {offers.length} offer{offers.length !== 1 ? "s" : ""}
          </span>
        </div>

        {loading && <div className="text-sm text-slate-600 dark:text-slate-300">Loading...</div>}

        {!loading && filtered.length === 0 && (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">
              {offers.length === 0 ? "No offers yet. Create your first one." : "No offers match your search."}
            </CardContent>
          </Card>
        )}

        <div className="grid gap-4 xl:grid-cols-2">
          {filtered.map((o: any) => (
            <Card key={o.id} className="overflow-hidden border-white/60 bg-white/85 shadow-lg shadow-slate-900/5 backdrop-blur dark:border-white/10 dark:bg-slate-950/70">
              <CardHeader className="border-b border-slate-200/70 dark:border-white/10">
                <CardTitle className="text-xl">{o.title}</CardTitle>
                <CardDescription>{o.company} {o.domain ? `· ${o.domain}` : ""}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 py-5">
                <div className="grid gap-3 text-sm sm:grid-cols-2">
                  <InfoLine icon={<MapPin className="h-4 w-4" />} label="Location" value={o.location || "Unknown"} />
                  <InfoLine icon={<CalendarDays className="h-4 w-4" />} label="Dates" value={`${fmt(o.startDate)} → ${fmt(o.endDate)}`} />
                  {o.type && <InfoLine icon={<Briefcase className="h-4 w-4" />} label="Type" value={o.type} />}
                </div>
                <p className="text-sm leading-6 text-slate-600 dark:text-slate-300 line-clamp-3">{o.description}</p>
                <div className="flex justify-end gap-2">
                  <Link href={`/recruiter/offers/${o.id}`}><Button variant="outline">Edit</Button></Link>
                  <Button
                    variant="destructive"
                    onClick={async () => { if (confirm("Delete this offer?")) await removeOffer(o.id); }}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function fmt(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
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