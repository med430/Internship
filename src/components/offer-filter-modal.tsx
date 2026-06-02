"use client";

import { useState } from "react";
import { X, MapPin, Briefcase, Wifi, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CAREER_DOMAINS } from "@/lib/constants/domains";

export interface OfferFilters {
  types?: string[];
  workModes?: string[];
  domains?: string[];
  locations?: string[];
}

const OFFER_TYPE_OPTIONS = [
  { value: "INTERNSHIP", label: "Internship (Stage)" },
  { value: "PFE", label: "PFE" },
  { value: "RESEARCH", label: "Research" },
  { value: "PHD", label: "PhD / Thèse" },
  { value: "ALTERNANCE", label: "Alternance" },
];

const WORK_MODE_OPTIONS = [
  { value: "REMOTE", label: "Remote" },
  { value: "ONSITE", label: "On-site" },
  { value: "HYBRID", label: "Hybrid" },
];

const COMMON_LOCATIONS = ["Tunis", "Sfax", "Sousse", "Bizerte", "Remote", "Casablanca", "Paris", "Berlin"];

interface OfferFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: OfferFilters;
  onApplyFilters: (filters: OfferFilters) => void;
}

export default function OfferFilterModal({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
}: OfferFilterModalProps) {
  const [local, setLocal] = useState<OfferFilters>(filters);
  const [customLocation, setCustomLocation] = useState("");

  const toggle = (key: keyof OfferFilters, value: string) => {
    setLocal((prev) => {
      const arr = (prev[key] as string[] | undefined) ?? [];
      return {
        ...prev,
        [key]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
      };
    });
  };

  const addLocation = () => {
    const loc = customLocation.trim();
    if (loc) { toggle("locations", loc); setCustomLocation(""); }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building className="w-5 h-5" />
            Filter offers
          </DialogTitle>
          <DialogDescription className="sr-only">
            Choose offer type, work mode, domain, and location filters.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Offer type */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Briefcase className="w-4 h-4" />
              Offer type
            </Label>
            <div className="flex flex-wrap gap-2">
              {OFFER_TYPE_OPTIONS.map((t) => (
                <Badge
                  key={t.value}
                  variant={local.types?.includes(t.value) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggle("types", t.value)}
                >
                  {t.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Work mode */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Wifi className="w-4 h-4" />
              Work mode
            </Label>
            <div className="flex flex-wrap gap-2">
              {WORK_MODE_OPTIONS.map((m) => (
                <Badge
                  key={m.value}
                  variant={local.workModes?.includes(m.value) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggle("workModes", m.value)}
                >
                  {m.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Domain */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <Briefcase className="w-4 h-4" />
              Domain
            </Label>
            <div className="flex flex-wrap gap-2">
              {CAREER_DOMAINS.map((d) => (
                <Badge
                  key={d}
                  variant={local.domains?.includes(d) ? "default" : "outline"}
                  className="cursor-pointer text-xs"
                  onClick={() => toggle("domains", d)}
                >
                  {d}
                </Badge>
              ))}
            </div>
          </div>

          {/* Location */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2 text-sm font-medium">
              <MapPin className="w-4 h-4" />
              Location
            </Label>
            <div className="flex gap-2 mb-2">
              <Input
                placeholder="Add a city…"
                value={customLocation}
                onChange={(e) => setCustomLocation(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addLocation()}
              />
              <Button size="sm" onClick={addLocation}>Add</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {COMMON_LOCATIONS.map((loc) => (
                <Badge
                  key={loc}
                  variant={local.locations?.includes(loc) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggle("locations", loc)}
                >
                  {loc}
                </Badge>
              ))}
              {local.locations
                ?.filter((l) => !COMMON_LOCATIONS.includes(l))
                .map((loc) => (
                  <Badge key={loc} variant="default" className="cursor-pointer gap-1">
                    {loc}
                    <X className="w-3 h-3" onClick={() => toggle("locations", loc)} />
                  </Badge>
                ))}
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={() => setLocal({})}>Clear all</Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={() => { onApplyFilters(local); onClose(); }}>Apply filters</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
