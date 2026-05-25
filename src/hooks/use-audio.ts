// src/lib/hooks/use-audio.ts
'use client';

import { useRef, useState, useCallback } from 'react';

const SAMPLE_RATE = 44100;
const MAX_LATENCY = 0.3;

// This is your original AudioWorklet code, unchanged
const workletCode = `
class AudioSender extends AudioWorkletProcessor {
  constructor() {
    super();
    this._buffer = [];
    this._bufferSize = 2048;
  }

  process(inputs) {
    const input = inputs[0];
    if (!input || !input[0]) return true;

    const samples = input[0];
    for (let i = 0; i < samples.length; i++) {
      this._buffer.push(samples[i]);
    }

    if (this._buffer.length >= this._bufferSize) {
      const chunk = new Float32Array(this._buffer.splice(0, this._bufferSize));
      this.port.postMessage(chunk.buffer, [chunk.buffer]);
    }

    return true;
  }
}

registerProcessor('audio-sender', AudioSender);
`;

interface UseAudioOptions {
    onChunk: (data: ArrayBuffer) => void;
}

export function useAudio({ onChunk }: UseAudioOptions) {
    const audioContextRef = useRef<AudioContext | null>(null);
    const workletNodeRef = useRef<AudioWorkletNode | null>(null);
    const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const playbackContextRef = useRef<AudioContext | null>(null);
    const nextPlayTimeRef = useRef(0);
    const pendingChunksRef = useRef(0);
    const syncIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const [recording, setRecording] = useState(false);

    // Call this once when the component mounts so playback is ready
    const initPlayback = useCallback(() => {
        if (playbackContextRef.current) return;
        playbackContextRef.current = new AudioContext({ sampleRate: SAMPLE_RATE });

        syncIntervalRef.current = setInterval(() => {
            const ctx = playbackContextRef.current;
            if (!ctx) return;
            const queuedAhead = nextPlayTimeRef.current - ctx.currentTime;
            if (queuedAhead > MAX_LATENCY) {
                nextPlayTimeRef.current = ctx.currentTime + 0.05;
                pendingChunksRef.current = 0;
            }
        }, 1000);
    }, []);

    const playChunk = useCallback((data: ArrayBuffer) => {
        const ctx = playbackContextRef.current;
        if (!ctx) return;

        const float32Array = new Float32Array(data);

        if (ctx.state === 'suspended') void ctx.resume();

        const currentTime = ctx.currentTime;
        const queuedAhead = nextPlayTimeRef.current - currentTime;
        if (queuedAhead > MAX_LATENCY) return;

        if (nextPlayTimeRef.current < currentTime + 0.02) {
            nextPlayTimeRef.current = currentTime + 0.02;
        }

        const audioBuffer = ctx.createBuffer(1, float32Array.length, SAMPLE_RATE);
        audioBuffer.copyToChannel(new Float32Array(data), 0);

        const source = ctx.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(ctx.destination);
        source.start(nextPlayTimeRef.current);

        pendingChunksRef.current++;
        source.onended = () => pendingChunksRef.current--;

        nextPlayTimeRef.current += audioBuffer.duration;
    }, []);

    const start = useCallback(async () => {
        const stream = await navigator.mediaDevices.getUserMedia({
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                sampleRate: SAMPLE_RATE,
            },
        });

        streamRef.current = stream;

        const audioContext = new AudioContext({ sampleRate: SAMPLE_RATE });
        audioContextRef.current = audioContext;

        const blob = new Blob([workletCode], { type: 'application/javascript' });
        const url = URL.createObjectURL(blob);
        await audioContext.audioWorklet.addModule(url);
        URL.revokeObjectURL(url);

        const source = audioContext.createMediaStreamSource(stream);
        sourceNodeRef.current = source;

        const workletNode = new AudioWorkletNode(audioContext, 'audio-sender');
        workletNodeRef.current = workletNode;

        workletNode.port.onmessage = (e: MessageEvent<ArrayBuffer>) => {
            onChunk(e.data);
        };

        source.connect(workletNode);
        setRecording(true);
    }, [onChunk]);

    const stop = useCallback(() => {
        workletNodeRef.current?.disconnect();
        sourceNodeRef.current?.disconnect();
        void audioContextRef.current?.close();
        streamRef.current?.getTracks().forEach((t) => t.stop());

        workletNodeRef.current = null;
        sourceNodeRef.current = null;
        audioContextRef.current = null;
        streamRef.current = null;

        nextPlayTimeRef.current = 0;
        pendingChunksRef.current = 0;

        setRecording(false);
    }, []);

    const destroy = useCallback(() => {
        stop();
        if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
        void playbackContextRef.current?.close();
        playbackContextRef.current = null;
    }, [stop]);

    return { recording, start, stop, initPlayback, playChunk, destroy };
}