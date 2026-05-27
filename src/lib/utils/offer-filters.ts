import type { OfferFilters } from "@/components/offer-filter-modal";

const OFFER_TYPE_LABELS: Record<string, string> = {
  INTERNSHIP: "Internship",
  PFE: "PFE",
  RESEARCH: "Research",
  PHD: "PhD",
  ALTERNANCE: "Alternance",
};

const OFFER_WORK_MODE_LABELS: Record<string, string> = {
  REMOTE: "Remote",
  ONSITE: "On-site",
  HYBRID: "Hybrid",
};

export function applyOfferFilters<T extends Record<string, any>>(
  offers: T[],
  filters: OfferFilters,
  search: string,
): T[] {
  return offers.filter((o) => {
    if (search) {
      const q = search.toLowerCase();
      if (
        !o.title?.toLowerCase().includes(q) &&
        !o.company?.toLowerCase().includes(q) &&
        !o.location?.toLowerCase().includes(q)
      )
        return false;
    }
    if (filters.types?.length && !filters.types.includes(o.type)) return false;
    if (filters.workModes?.length && !filters.workModes.includes(o.workMode)) return false;
    if (filters.domains?.length && !filters.domains.includes(o.domain)) return false;
    if (filters.locations?.length) {
      const loc = o.location?.toLowerCase() ?? "";
      if (!filters.locations.some((l) => loc.includes(l.toLowerCase()))) return false;
    }
    return true;
  });
}

export function getOfferFilterTags(
  filters: OfferFilters,
): { key: keyof OfferFilters; value: string; label: string }[] {
  const tags: { key: keyof OfferFilters; value: string; label: string }[] = [];
  for (const t of filters.types ?? [])
    tags.push({ key: "types", value: t, label: OFFER_TYPE_LABELS[t] ?? t });
  for (const m of filters.workModes ?? [])
    tags.push({ key: "workModes", value: m, label: OFFER_WORK_MODE_LABELS[m] ?? m });
  for (const d of filters.domains ?? [])
    tags.push({ key: "domains", value: d, label: d });
  for (const l of filters.locations ?? [])
    tags.push({ key: "locations", value: l, label: l });
  return tags;
}
