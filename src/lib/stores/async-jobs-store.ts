"use client";

import { create } from "zustand";
import type {
  AsyncJobFeature,
  AsyncJobOperation,
  AsyncJobSnapshot,
  JobAcceptedResponse,
} from "@/lib/api/async-jobs";

type StreamStatus = "idle" | "connecting" | "connected" | "error";

type AcceptedWithResource = JobAcceptedResponse & {
  resource_id?: string;
  resource_type?: string;
  message?: string;
  progress?: number;
  phase?: string;
};

interface AsyncJobsStore {
  jobs: Record<string, AsyncJobSnapshot>;
  streamStatus: StreamStatus;
  streamError: string | null;
  startStream: () => Promise<void>;
  stopStream: () => void;
  refreshActiveJobs: () => Promise<void>;
  trackAcceptedJob: (accepted: AcceptedWithResource) => Promise<AsyncJobSnapshot>;
  upsertJob: (job: AsyncJobSnapshot) => void;
  clearJob: (jobId: string) => void;
  clearJobsForFeature: (feature: AsyncJobFeature) => void;
  isFeatureLoading: (feature: AsyncJobFeature) => boolean;
  getLatestJobForFeature: (
    feature: AsyncJobFeature,
    operation?: AsyncJobOperation,
  ) => AsyncJobSnapshot | null;
}

export const useAsyncJobsStore = create<AsyncJobsStore>((set, get) => ({
  jobs: {},
  streamStatus: "idle",
  streamError: null,
  startStream: async () => {
    set({ streamStatus: "connected", streamError: null });
  },
  stopStream: () => {
    set({ streamStatus: "idle", streamError: null });
  },
  refreshActiveJobs: async () => undefined,
  trackAcceptedJob: async (accepted) => {
    const snapshot: AsyncJobSnapshot = {
      job_id: accepted.job_id,
      feature: accepted.feature,
      operation: accepted.operation,
      status: accepted.status,
      phase: accepted.phase || "COMPLETED",
      progress: accepted.progress ?? 100,
      message: accepted.message || "Completed",
      resource_type: accepted.resource_type ?? null,
      resource_id: accepted.resource_id ?? null,
      error_code: null,
      error_message: null,
      created_at: accepted.created_at,
      updated_at: accepted.created_at,
    };

    set((state) => ({
      jobs: {
        ...state.jobs,
        [snapshot.job_id]: snapshot,
      },
    }));

    return snapshot;
  },
  upsertJob: (job) => {
    set((state) => ({
      jobs: {
        ...state.jobs,
        [job.job_id]: job,
      },
    }));
  },
  clearJob: (jobId) => {
    set((state) => {
      const jobs = { ...state.jobs };
      delete jobs[jobId];
      return { jobs };
    });
  },
  clearJobsForFeature: (feature) => {
    set((state) => ({
      jobs: Object.fromEntries(
        Object.entries(state.jobs).filter(([, job]) => job.feature !== feature),
      ),
    }));
  },
  isFeatureLoading: (feature) =>
    Object.values(get().jobs).some(
      (job) =>
        job.feature === feature &&
        (job.status === "PENDING" || job.status === "PROCESSING"),
    ),
  getLatestJobForFeature: (feature, operation) => {
    const jobs = Object.values(get().jobs)
      .filter(
        (job) =>
          job.feature === feature &&
          (operation ? job.operation === operation : true),
      )
      .sort(
        (left, right) =>
          new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime(),
      );

    return jobs[0] || null;
  },
}));

export async function waitForTerminalJob(
  jobId: string,
): Promise<AsyncJobSnapshot> {
  const job = useAsyncJobsStore.getState().jobs[jobId];
  if (!job) {
    throw new Error("Job not found.");
  }
  return job;
}

export function getAsyncFeatureStatus(feature: AsyncJobFeature) {
  return useAsyncJobsStore.getState().getLatestJobForFeature(feature)?.status || null;
}
