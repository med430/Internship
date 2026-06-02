"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { RefObject } from "react";

interface UseInterviewCameraOptions {
  localVideoRef: RefObject<HTMLVideoElement | null>;
}

export function useInterviewCamera({
  localVideoRef,
}: UseInterviewCameraOptions) {
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraSupported] = useState(
    () => typeof navigator !== "undefined" && Boolean(navigator.mediaDevices?.getUserMedia),
  );
  const [cameraError, setCameraError] = useState<string | null>(null);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    setCameraOn(false);
  }, [localVideoRef]);

  const startCamera = useCallback(async () => {
    setCameraError(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      const message =
        "Camera access is unavailable in this browser or requires https/localhost.";
      setCameraError(message);
      throw new Error(message);
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        frameRate: { ideal: 24, max: 30 },
        facingMode: "user",
      },
      audio: false,
    });

    streamRef.current = stream;

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = stream;
      await localVideoRef.current.play().catch(() => undefined);
    }

    setCameraOn(true);
  }, [localVideoRef]);

  useEffect(() => stopCamera, [stopCamera]);

  return {
    cameraOn,
    cameraSupported,
    cameraError,
    startCamera,
    stopCamera,
  };
}
