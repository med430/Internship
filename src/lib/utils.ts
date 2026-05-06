import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function formatTag(tag: string | undefined | null): string {
  if (!tag) return "";

  const normalized = tag.toLowerCase().replace(/\s+/g, "");

  const tagMap: Record<string, string> = {
    entrylevel: "Entry level",
    midseniorlevel: "Senior level",
    fulltime: "Full-time",
    parttime: "Part-time",
  };

  return tagMap[normalized] || toTitleCase(tag);
}

export function filterAndDeduplicateTags(
  tags: (string | undefined | null)[],
): string[] {
  const validTags = tags
    .filter((tag): tag is string => !!tag)
    .filter((tag) => tag.toLowerCase().replace(/\s+/g, "") !== "notapplicable");

  const seen = new Set<string>();
  return validTags.filter((tag) => {
    const normalized = tag.toLowerCase().replace(/\s+/g, "");
    if (seen.has(normalized)) {
      return false;
    }
    seen.add(normalized);
    return true;
  });
}
