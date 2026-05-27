// Fire-and-forget client for /events/track. Never blocks UI on network failure.

import { fetchWithAuth } from "@/lib/api/auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

type EventType =
  | "offer_view"
  | "offer_bookmark"
  | "offer_unbookmark"
  | "offer_impression"
  | "search_query"
  | "profile_view";

interface TrackPayload {
  eventType: EventType;
  data: Record<string, unknown>;
}

const OFFER_VIEW_SOURCE_PREFIX = "offer-view-source:";

async function postSilently(path: string, body: unknown): Promise<void> {
  try {
    await fetchWithAuth(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    // intentional: telemetry shouldn't surface errors to users
  }
}

export const tracking = {
  markOfferViewSource(offerId: string, source: string) {
    if (typeof window === "undefined") return;
    window.sessionStorage.setItem(`${OFFER_VIEW_SOURCE_PREFIX}${offerId}`, source);
  },

  consumeOfferViewSource(offerId: string, fallback: string = "detail") {
    if (typeof window === "undefined") return fallback;

    const key = `${OFFER_VIEW_SOURCE_PREFIX}${offerId}`;
    const source = window.sessionStorage.getItem(key);
    window.sessionStorage.removeItem(key);
    return source ?? fallback;
  },

  trackView(offerId: string, source: string = "feed", durationMs?: number) {
    void postSilently("/events/track", {
      eventType: "offer_view",
      data: { offerId, source, durationMs },
    } satisfies TrackPayload);
  },

  trackBookmark(offerId: string) {
    void postSilently("/events/track", {
      eventType: "offer_bookmark",
      data: { offerId },
    } satisfies TrackPayload);
  },

  trackUnbookmark(offerId: string) {
    void postSilently("/events/track", {
      eventType: "offer_unbookmark",
      data: { offerId },
    } satisfies TrackPayload);
  },

  trackSearch(query: string, filters: Record<string, unknown>, resultsCount: number) {
    void postSilently("/events/track", {
      eventType: "search_query",
      data: { query, filters, resultsCount },
    } satisfies TrackPayload);
  },

  trackImpressions(items: Array<{ offerId: string; position: number; source?: string }>) {
    if (items.length === 0) return;
    void postSilently("/events/track/batch", {
      events: items.map((item) => ({
        eventType: "offer_impression",
        data: { offerId: item.offerId, position: item.position, source: item.source ?? "feed" },
      })),
    });
  },
};
