"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

async function getSupabaseToken(): Promise<string | null> {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token ?? null;
}

export function useOffers() {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchOffers = useCallback(async () => {
    setLoading(true);
    try {
      const token = await getSupabaseToken();
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
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
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
    const token = await getSupabaseToken();
    if (!token) throw new Error('Not authenticated');
    const resp = await fetch(`${API_BASE}/offers/${id}/delete`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!resp.ok) throw new Error('Delete failed');
    await fetchOffers();
  }, [fetchOffers]);

  return { offers, loading, fetchOffers, removeOffer };
}
