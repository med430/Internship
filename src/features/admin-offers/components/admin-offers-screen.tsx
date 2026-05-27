"use client";

import { useState } from "react";
import { Briefcase, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { AdminOffer } from "@/lib/api/admin-client";

function formatDate(iso?: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

interface AdminOffersScreenProps {
  offers: AdminOffer[];
}

export function AdminOffersScreen({ offers }: AdminOffersScreenProps) {
  const [search, setSearch] = useState("");

  const active = offers.filter((o) => !o.deletedAt);
  const filtered = active.filter((o) => {
    const q = search.toLowerCase();
    return (
      o.title.toLowerCase().includes(q) ||
      o.company.toLowerCase().includes(q) ||
      o.domain?.toLowerCase().includes(q) ||
      o.location?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-7xl px-6 py-10 space-y-6">

        <div className="flex items-start gap-4">
          <div className="rounded-xl bg-emerald-500/10 text-emerald-500 p-3">
            <Briefcase className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">
              Offers
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {active.length} active offer{active.length !== 1 ? "s" : ""} on the platform.
            </p>
          </div>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search by title, company or domain…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Domain</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Mode</TableHead>
                <TableHead>Paid</TableHead>
                <TableHead>Start</TableHead>
                <TableHead>End</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    No offers found.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((offer) => (
                  <TableRow key={offer.id}>
                    <TableCell className="font-medium max-w-[200px] truncate">
                      {offer.title}
                    </TableCell>
                    <TableCell className="text-muted-foreground">{offer.company}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{offer.domain}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground capitalize">
                      {offer.type?.toLowerCase()}
                    </TableCell>
                    <TableCell className="text-muted-foreground capitalize">
                      {offer.workMode?.toLowerCase().replace("_", " ")}
                    </TableCell>
                    <TableCell>
                      <Badge variant={offer.isPaid ? "default" : "secondary"}>
                        {offer.isPaid ? "Paid" : "Unpaid"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDate(offer.startDate)}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDate(offer.endDate)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
