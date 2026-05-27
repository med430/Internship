// Thin wrapper around the admin-only recommendation control endpoints.

import { API_BASE_URL } from "@/lib/constants";
import { fetchWithAuth } from "@/lib/api/auth";

export interface ComputeResult {
  studentsProcessed: number;
  offersConsidered: number;
  pairsWritten: number;
  durationMs: number;
  modelVersion: string;
}

export interface MlHealth {
  reachable: boolean;
  status?: string;
  modelVersion?: string;
  modelsLoaded?: string[];
}

export interface CleanupResult {
  offerViewsDeleted: number;
  offerImpressionsDeleted: number;
  searchQueriesDeleted: number;
  durationMs: number;
}

// Triggers a full rebuild of the recommendation score table; optional studentUserId narrows it to one student.
export async function triggerRecompute(studentUserId?: string): Promise<ComputeResult> {
  const response = await fetchWithAuth(`${API_BASE_URL}/admin/recommendations/compute`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(studentUserId ? { studentUserId } : {}),
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`compute failed: ${response.status} ${text}`);
  }
  return response.json() as Promise<ComputeResult>;
}

// Runs the weekly retention cleanup on demand. Drops aged OfferView / OfferImpression / SearchQuery rows.
export async function triggerCleanup(): Promise<CleanupResult> {
  const response = await fetchWithAuth(`${API_BASE_URL}/admin/recommendations/cleanup`, {
    method: "POST",
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`cleanup failed: ${response.status} ${text}`);
  }
  return response.json() as Promise<CleanupResult>;
}

// Pings the ML sidecar via the backend and returns reachability + model identity.
export async function checkMlHealth(): Promise<MlHealth> {
  const response = await fetchWithAuth(`${API_BASE_URL}/admin/recommendations/ml-health`, {
    method: "POST",
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`health failed: ${response.status} ${text}`);
  }
  return response.json() as Promise<MlHealth>;
}