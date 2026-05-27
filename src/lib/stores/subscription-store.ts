"use client";

import { create } from "zustand";
import { getSubscriptionStatus, type SubscriptionType } from "@/lib/api/subscription";

interface SubscriptionStore {
  type: SubscriptionType | null;
  isPro: boolean;
  isLoading: boolean;
  /** Call on app mount and after a successful payment. */
  fetchStatus: () => Promise<void>;
}

export const useSubscriptionStore = create<SubscriptionStore>((set) => ({
  type: null,
  isPro: false,
  isLoading: false,

  fetchStatus: async () => {
    set({ isLoading: true });
    try {
      const { type } = await getSubscriptionStatus();
      set({ type, isPro: type === "PAID", isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },
}));
