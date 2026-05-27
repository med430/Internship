"use client";

import { useCallback, useEffect, useState } from "react";
import { deleteOffer as deleteOfferAction } from "@/lib/api/actions/offer-actions";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

async function getSession(): Promise<{ token: string } | null> {
  try {
    const res = await fetch("/auth/session", { credentials: "include", cache: "no-store" });
    if (!res.ok) return null;
    const data = (await res.json()) as { accessToken?: string };
    if (!data.accessToken) return null;
    return { token: data.accessToken };
  } catch {
    return null;
  }
}

async function gql<T>(query: string, token: string): Promise<T> {
  const res = await fetch(`${API_BASE}/graphql`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query }),
    cache: "no-store",
  });
  const json = await res.json();
  if (json.errors?.length) throw new Error(json.errors[0]?.message ?? "GraphQL error");
  return json.data as T;
}

export function useOffers() {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchOffers = useCallback(async () => {
    setLoading(true);
    try {
      const session = await getSession();
      if (!session) { setOffers([]); return; }

      const data = await gql<{ myOffers: any[] }>(
        `query {
          myOffers {
            id title description company location domain
            startDate endDate type workMode isPaid
          }
        }`,
        session.token,
      );

      setOffers(data.myOffers ?? []);
    } catch (e) {
      console.error(e);
      setOffers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void fetchOffers(); }, [fetchOffers]);

  const removeOffer = useCallback(
    async (id: string) => {
      await deleteOfferAction(id);
      await fetchOffers();
    },
    [fetchOffers],
  );

  return { offers, loading, fetchOffers, removeOffer };
}
