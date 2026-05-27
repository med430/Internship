import { fetchWithAuth } from "@/lib/api/auth";
import { getClientApiBaseUrl } from "@/lib/api/client-utils";

export type SubscriptionType = "FREE" | "PAID";

export interface SubscriptionStatus {
  type: SubscriptionType;
}

export async function getSubscriptionStatus(): Promise<SubscriptionStatus> {
  const api = getClientApiBaseUrl();
  const res = await fetchWithAuth(`${api}/subscription/status`);
  if (!res.ok) return { type: "FREE" };
  return res.json() as Promise<SubscriptionStatus>;
}

export async function createCheckoutSession(): Promise<string> {
  const api = getClientApiBaseUrl();
  const res = await fetchWithAuth(`${api}/subscription/checkout`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to create checkout session");
  const { url } = (await res.json()) as { url: string };
  return url;
}

export async function createPortalSession(): Promise<string> {
  const api = getClientApiBaseUrl();
  const res = await fetchWithAuth(`${api}/subscription/portal`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to create portal session");
  const { url } = (await res.json()) as { url: string };
  return url;
}
