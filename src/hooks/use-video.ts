// src/lib/hooks/use-video.ts
'use client';

import { useRef, useState, useCallback } from 'react';

interface UseVideoOptions {
    onChunk: (data: ArrayBuffer) => void;
    localVideoRef: React.RefObject<HTMLVideoElement | null>;
}

export function useVideo({ onChunk, localVideoRef }: UseVideoOptions) {
    const streamRef = useRef<MediaStream | null>(null);
    const recorderRef = useRef<MediaRecorder | null>(null);
    const [cameraOn, setCameraOn] = useState(false);

    const startCamera = useCallback(async () => {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { width: 1280, height: 720, frameRate: 24 },
            audio: false, // audio is handled by useAudio separately
        });

        streamRef.current = stream;

        if (localVideoRef.current) {
            localVideoRef.current.srcObject = stream;
        }

        // Use MediaRecorder to chunk the video stream and send it
        const recorder = new MediaRecorder(stream, {
            mimeType: 'video/webm;codecs=vp8',
            videoBitsPerSecond: 500_000,
        });

        recorder.ondataavailable = async (e) => {
            if (e.data.size === 0) return;
            const buffer = await e.data.arrayBuffer();
            onChunk(buffer);
        };

        // Send a chunk every 100ms
        recorder.start(100);
        recorderRef.current = recorder;
        setCameraOn(true);
    }, [onChunk, localVideoRef]);

    const stopCamera = useCallback(() => {
        recorderRef.current?.stop();
        streamRef.current?.getTracks().forEach((t) => t.stop());

        if (localVideoRef.current) {
            localVideoRef.current.srcObject = null;
        }

        recorderRef.current = null;
        streamRef.current = null;
        setCameraOn(false);
    }, [localVideoRef]);

    const restartRecorder = useCallback(() => {
        const stream = streamRef.current;
        if (!stream) return;

        recorderRef.current?.stop();

        const recorder = new MediaRecorder(stream, {
            mimeType: 'video/webm;codecs=vp8',
            videoBitsPerSecond: 500_000,
        });

        recorder.ondataavailable = async (e) => {
            if (e.data.size === 0) return;
            const buffer = await e.data.arrayBuffer();
            onChunk(buffer);
        };

        recorder.start(100);
        recorderRef.current = recorder;
    }, [onChunk]);

    return { cameraOn, startCamera, stopCamera, restartRecorder };
}