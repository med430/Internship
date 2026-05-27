"use client";

import { useCallback, useEffect, useState } from "react";
import { deleteOffer as deleteOfferAction } from "@/lib/api/actions/offer-actions";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export function useOffers() {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchOffers = useCallback(async () => {
    setLoading(true);
    try {
      const query = `
        query Offers($pageNumber: Int, $pageSize: Int) {
          offers(pageNumber: $pageNumber, pageSize: $pageSize) {
            id
            title
            description
            company
            location
            domain
            startDate
            endDate
            type
          }
        }
      `;
      const resp = await fetch(`${API_BASE}/graphql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, variables: { pageNumber: 1, pageSize: 200 } }),
      });
      const json = await resp.json();
      if (json.errors?.length) {
        throw new Error(json.errors[0]?.message || 'Failed to load offers');
      }
      setOffers(json.data?.offers || []);
    } catch (e) {
      console.error(e);
      setOffers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchOffers(); }, [fetchOffers]);

  const removeOffer = useCallback(async (id: string) => {
    await deleteOfferAction(id);
    await fetchOffers();
  }, [fetchOffers]);

  return { offers, loading, fetchOffers, removeOffer };
}
