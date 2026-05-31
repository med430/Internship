// Fire-and-forget client for /events/track. Never blocks UI on network failure.

import { getAccessToken } from "@/lib/api/auth";

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
let cachedAccessToken: string | null = null;

// Where the user came from when they opened an offer, plus the rank it held in that list.
interface OfferViewOrigin {
  source: string;
  position?: number;
}

async function postSilently(
  path: string,
  body: unknown,
  opts?: { keepalive?: boolean },
): Promise<void> {
  try {
    const serialized = JSON.stringify(body);

    if (opts?.keepalive && cachedAccessToken) {
      await fetch(`${API_BASE_URL}${path}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cachedAccessToken}`,
        },
        body: serialized,
        credentials: "include",
        keepalive: true,
      });
      return;
    }

    cachedAccessToken = await getAccessToken();
    await fetch(`${API_BASE_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cachedAccessToken}`,
      },
      body: serialized,
      credentials: "include",
      keepalive: opts?.keepalive,
    });
  } catch {
    // intentional: telemetry shouldn't surface errors to users
  }
}

export const tracking = {
  markOfferViewSource(offerId: string, source: string, position?: number) {
    if (typeof window === "undefined") return;
    const origin: OfferViewOrigin = { source, position };
    window.sessionStorage.setItem(`${OFFER_VIEW_SOURCE_PREFIX}${offerId}`, JSON.stringify(origin));
  },

  consumeOfferViewSource(offerId: string, fallback: string = "detail"): OfferViewOrigin {
    if (typeof window === "undefined") return { source: fallback };

    const key = `${OFFER_VIEW_SOURCE_PREFIX}${offerId}`;
    const raw = window.sessionStorage.getItem(key);
    window.sessionStorage.removeItem(key);
    if (!raw) return { source: fallback };
    try {
      const parsed = JSON.parse(raw) as OfferViewOrigin;
      return { source: parsed.source ?? fallback, position: parsed.position };
    } catch {
      return { source: fallback };
    }
  },

  trackView(
    offerId: string,
    source: string = "feed",
    durationMs?: number,
    position?: number,
    opts?: { keepalive?: boolean },
    viewId?: string,
  ) {
    void postSilently(
      "/events/track",
      {
        eventType: "offer_view",
        data: { offerId, viewId, source, durationMs, position },
      } satisfies TrackPayload,
      opts,
    );
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
