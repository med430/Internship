// Client for GET /offers/:id — fetches the rich offer detail used by the dedicated detail page.

import { fetchWithAuth } from "@/lib/api/auth";
import type { OfferDetailDocument } from "@/types/job-matcher";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export async function fetchOfferDetail(id: string): Promise<OfferDetailDocument | null> {
  const response = await fetchWithAuth(`${API_BASE_URL}/offers/${id}`, {
    method: "GET",
  });
  if (!response.ok) return null;
  return (await response.json()) as OfferDetailDocument;
}
