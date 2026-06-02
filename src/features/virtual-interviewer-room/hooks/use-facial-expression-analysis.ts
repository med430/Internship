"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { RefObject } from "react";
import type { FacialExpressionMetrics } from "@/lib/api/interviews/types";

type BlendshapeCategory = {
  categoryName: string;
  score: number;
};

type BlendshapeResult = {
  categories?: BlendshapeCategory[];
};

type FaceLandmarkerLike = {
  detectForVideo: (
    video: HTMLVideoElement,
    timestampMs: number,
  ) => {
    faceBlendshapes?: BlendshapeResult[];
  };
  close?: () => void;
};

type FaceLandmarkerFactory = {
  createFromOptions: (
    fileset: unknown,
    options: {
      baseOptions: {
        modelAssetPath: string;
        delegate?: "GPU" | "CPU";
      };
      runningMode: "VIDEO";
      numFaces: number;
      outputFaceBlendshapes: boolean;
    },
  ) => Promise<FaceLandmarkerLike>;
};

const MEDIAPIPE_XNNPACK_INFO_PREFIX =
  "INFO: Created TensorFlow Lite XNNPACK delegate for CPU.";

interface UseFacialExpressionAnalysisOptions {
  enabled: boolean;
  videoRef: RefObject<HTMLVideoElement | null>;
}

interface RunningTotals {
  samples: number;
  facePresent: number;
  smile: number;
  positive: number;
  attentive: number;
  smileTotal: number;
  eyeOpenTotal: number;
  browTensionTotal: number;
  mouthMovementTotal: number;
  expressionDeltaTotal: number;
  previousSmile?: number;
  previousBrowTension?: number;
  previousMouthMovement?: number;
  startedAt?: string;
  endedAt?: string;
}

const EMPTY_METRICS: FacialExpressionMetrics = {
  sampleCount: 0,
  facePresentRate: 0,
  smileRate: 0,
  positiveExpressionRate: 0,
  attentionRate: 0,
  expressionStability: 0,
  averageSmile: 0,
  averageEyeOpenness: 0,
  averageBrowTension: 0,
  averageMouthMovement: 0,
};

const MEDIAPIPE_WASM_URL =
  "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm";
const FACE_LANDMARKER_MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task";

function clampScore(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function categoryScore(categories: BlendshapeCategory[], names: string[]) {
  const scores = names
    .map((name) => categories.find((item) => item.categoryName === name)?.score)
    .filter((value): value is number => typeof value === "number");

  if (!scores.length) return 0;
  return scores.reduce((sum, value) => sum + value, 0) / scores.length;
}

function toMetrics(totals: RunningTotals): FacialExpressionMetrics {
  if (!totals.samples) {
    return {
      ...EMPTY_METRICS,
      startedAt: totals.startedAt,
      endedAt: totals.endedAt,
    };
  }

  const expressionDeltaAverage =
    totals.samples > 1 ? totals.expressionDeltaTotal / (totals.samples - 1) : 0;

  return {
    sampleCount: totals.samples,
    facePresentRate: clampScore((totals.facePresent / totals.samples) * 100),
    smileRate: clampScore((totals.smile / totals.samples) * 100),
    positiveExpressionRate: clampScore((totals.positive / totals.samples) * 100),
    attentionRate: clampScore((totals.attentive / totals.samples) * 100),
    expressionStability: clampScore(100 - expressionDeltaAverage * 180),
    averageSmile: clampScore((totals.smileTotal / totals.samples) * 100),
    averageEyeOpenness: clampScore(
      (totals.eyeOpenTotal / totals.samples) * 100,
    ),
    averageBrowTension: clampScore(
      (totals.browTensionTotal / totals.samples) * 100,
    ),
    averageMouthMovement: clampScore(
      (totals.mouthMovementTotal / totals.samples) * 100,
    ),
    startedAt: totals.startedAt,
    endedAt: totals.endedAt,
  };
}

function createTotals(): RunningTotals {
  return {
    samples: 0,
    facePresent: 0,
    smile: 0,
    positive: 0,
    attentive: 0,
    smileTotal: 0,
    eyeOpenTotal: 0,
    browTensionTotal: 0,
    mouthMovementTotal: 0,
    expressionDeltaTotal: 0,
  };
}

function safeCloseLandmarker(landmarker: FaceLandmarkerLike | null) {
  try {
    landmarker?.close?.();
  } catch {
    // MediaPipe can throw if cleanup races with an in-flight video detection.
  }
}

export function summarizeFacialMetrics(
  metrics?: FacialExpressionMetrics | null,
) {
  if (!metrics || metrics.sampleCount < 3 || metrics.facePresentRate < 15) {
    return "Camera-based communication cues were unavailable for this interview.";
  }

  const cues: string[] = [];
  if (metrics.attentionRate >= 75) {
    cues.push("steady camera presence");
  } else if (metrics.attentionRate < 45) {
    cues.push("limited camera presence");
  }

  if (metrics.smileRate >= 35 || metrics.positiveExpressionRate >= 40) {
    cues.push("positive facial engagement");
  }

  if (metrics.expressionStability >= 70) {
    cues.push("stable expression control");
  } else if (metrics.expressionStability < 45) {
    cues.push("noticeable expression variation");
  }

  if (!cues.length) {
    return "Camera-based communication cues were neutral and should be used only as coaching context.";
  }

  return `Camera-based communication cues showed ${cues.join(", ")}. Treat this as coaching context, not an emotion certainty.`;
}

export function computeFacialExpressionScore(
  metrics?: FacialExpressionMetrics | null,
) {
  if (!metrics || metrics.sampleCount < 3 || metrics.facePresentRate < 15) {
    return null;
  }

  return clampScore(
    metrics.facePresentRate * 0.25 +
      metrics.attentionRate * 0.25 +
      metrics.positiveExpressionRate * 0.2 +
      metrics.expressionStability * 0.2 +
      metrics.averageEyeOpenness * 0.1,
  );
}

export function useFacialExpressionAnalysis({
  enabled,
  videoRef,
}: UseFacialExpressionAnalysisOptions) {
  const landmarkerRef = useRef<FaceLandmarkerLike | null>(null);
  const intervalRef = useRef<number | null>(null);
  const disposedRef = useRef(false);
  const totalsRef = useRef<RunningTotals>(createTotals());
  const [modelReady, setModelReady] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [metrics, setMetrics] =
    useState<FacialExpressionMetrics>(EMPTY_METRICS);

  const reset = useCallback(() => {
    totalsRef.current = {
      ...createTotals(),
      startedAt: new Date().toISOString(),
    };
    setMetrics(toMetrics(totalsRef.current));
  }, []);

  const getMetrics = useCallback(() => {
    const next = {
      ...toMetrics(totalsRef.current),
      endedAt: new Date().toISOString(),
    };
    totalsRef.current.endedAt = next.endedAt;
    return next;
  }, []);

  useEffect(() => {
    let disposed = false;
    disposedRef.current = false;

    const originalConsoleError = console.error;
    const filteredConsoleError: typeof console.error = (...args) => {
      const first = args[0];
      if (
        typeof first === "string" &&
        first.startsWith(MEDIAPIPE_XNNPACK_INFO_PREFIX)
      ) {
        return;
      }
      originalConsoleError(...args);
    };

    console.error = filteredConsoleError;

    async function loadModel() {
      try {
        const { FaceLandmarker, FilesetResolver } = await import(
          "@mediapipe/tasks-vision"
        );
        const fileset = await FilesetResolver.forVisionTasks(MEDIAPIPE_WASM_URL);
        const faceLandmarkerFactory =
          FaceLandmarker as unknown as FaceLandmarkerFactory;
        const createLandmarker = (delegate: "GPU" | "CPU") =>
          faceLandmarkerFactory.createFromOptions(fileset, {
            baseOptions: {
              modelAssetPath: FACE_LANDMARKER_MODEL_URL,
              delegate,
            },
            runningMode: "VIDEO",
            numFaces: 1,
            outputFaceBlendshapes: true,
          });
        const landmarker = await createLandmarker("GPU").catch(() =>
          createLandmarker("CPU"),
        );

        if (disposed) {
          safeCloseLandmarker(landmarker);
          return;
        }

        landmarkerRef.current = landmarker;
        setModelReady(true);
      } catch {
        if (!disposed) {
          setAnalysisError("Facial expression analysis is unavailable.");
        }
      }
    }

    void loadModel();

    return () => {
      disposed = true;
      disposedRef.current = true;
      if (console.error === filteredConsoleError) {
        console.error = originalConsoleError;
      }
      safeCloseLandmarker(landmarkerRef.current);
      landmarkerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!enabled || !modelReady) {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    if (!totalsRef.current.startedAt) {
      reset();
    }

    intervalRef.current = window.setInterval(() => {
      const video = videoRef.current;
      const landmarker = landmarkerRef.current;
      if (!video || !landmarker || disposedRef.current || video.readyState < 2) {
        return;
      }

      const totals = totalsRef.current;
      totals.samples += 1;

      try {
        if (disposedRef.current || landmarkerRef.current !== landmarker) {
          return;
        }
        const result = landmarker.detectForVideo(video, performance.now());
        const categories = result.faceBlendshapes?.[0]?.categories ?? [];

        if (!categories.length) {
          setMetrics(toMetrics(totals));
          return;
        }

        totals.facePresent += 1;

        const smile = categoryScore(categories, [
          "mouthSmileLeft",
          "mouthSmileRight",
        ]);
        const eyeSquint = categoryScore(categories, [
          "eyeSquintLeft",
          "eyeSquintRight",
        ]);
        const eyeWide = categoryScore(categories, ["eyeWideLeft", "eyeWideRight"]);
        const browTension = categoryScore(categories, [
          "browDownLeft",
          "browDownRight",
          "browInnerUp",
        ]);
        const mouthMovement = categoryScore(categories, [
          "jawOpen",
          "mouthFunnel",
          "mouthPucker",
          "mouthPressLeft",
          "mouthPressRight",
        ]);
        const eyeOpenness = Math.max(0, Math.min(1, 0.55 + eyeWide - eyeSquint));

        totals.smileTotal += smile;
        totals.eyeOpenTotal += eyeOpenness;
        totals.browTensionTotal += browTension;
        totals.mouthMovementTotal += mouthMovement;

        if (smile > 0.25) totals.smile += 1;
        if (smile > 0.2 && browTension < 0.45) totals.positive += 1;
        if (eyeOpenness > 0.35) totals.attentive += 1;

        if (typeof totals.previousSmile === "number") {
          totals.expressionDeltaTotal +=
            Math.abs(smile - totals.previousSmile) +
            Math.abs(browTension - (totals.previousBrowTension ?? 0)) +
            Math.abs(mouthMovement - (totals.previousMouthMovement ?? 0));
        }

        totals.previousSmile = smile;
        totals.previousBrowTension = browTension;
        totals.previousMouthMovement = mouthMovement;
      } catch {
        setAnalysisError("Facial expression analysis paused.");
      }

      setMetrics(toMetrics(totals));
    }, 400);

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, modelReady, reset, videoRef]);

  const facialScore = useMemo(
    () => computeFacialExpressionScore(metrics),
    [metrics],
  );

  return {
    metrics,
    facialScore,
    modelReady,
    analysisError,
    reset,
    getMetrics,
  };
}
