// src/lib/hooks/use-call-socket.ts
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

export interface ChatMessage {
    text: string;
    sender: string;
    time: number;
}

interface UseCallSocketOptions {
    onAudio?: (data: ArrayBuffer) => void;
    onVideo?: (data: ArrayBuffer) => void;
    onPeerJoined?: (peerId: string) => void;
    onPeerLeft?: (peerId: string) => void;
}

export function useCallSocket(
    room: string,
    options: UseCallSocketOptions = {},
) {
    const socketRef = useRef<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);

    // Keep options in a ref so the effect doesn't re-run when they change
    const optionsRef = useRef(options);
    optionsRef.current = options;

    useEffect(() => {
        const socket = io(process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:3000');
        socketRef.current = socket;

        socket.on('connect', () => {
            setIsConnected(true);
            socket.emit('join-room', room);
        });

        socket.on('disconnect', () => {
            setIsConnected(false);
        });

        socket.on('text', (msg: ChatMessage) => {
            setMessages((prev) => [...prev, msg]);
        });

        socket.on('audio', (data: unknown) => {
            if (!optionsRef.current.onAudio) return;
            const raw = Array.isArray(data) ? data[0] : data;
            if (raw instanceof ArrayBuffer) {
                optionsRef.current.onAudio(raw);
            } else if (raw?.buffer instanceof ArrayBuffer) {
                const ab = raw.buffer.slice(
                    raw.byteOffset,
                    raw.byteOffset + raw.byteLength,
                ) as ArrayBuffer;
                optionsRef.current.onAudio(ab);
            }
        });

        socket.on('video', (data: unknown) => {
            if (!optionsRef.current.onVideo) return;
            const raw = Array.isArray(data) ? data[0] : data;
            if (raw instanceof ArrayBuffer) {
                optionsRef.current.onVideo(raw);
            } else if (raw?.buffer instanceof ArrayBuffer) {
                const ab = raw.buffer.slice(
                    raw.byteOffset,
                    raw.byteOffset + raw.byteLength,
                ) as ArrayBuffer;
                optionsRef.current.onVideo(ab);
            }
        });

        socket.on('peer-joined', ({ peerId }: { peerId: string }) => {
            optionsRef.current.onPeerJoined?.(peerId);
        });

        socket.on('peer-left', ({ peerId }: { peerId: string }) => {
            optionsRef.current.onPeerLeft?.(peerId);
        });

        return () => {
            socket.emit('leave-room');
            socket.disconnect();
        };
    }, [room]); // re-runs only if room changes

    const sendAudio = useCallback((data: ArrayBuffer) => {
        socketRef.current?.emit('audio', data);
    }, []);

    const sendVideo = useCallback((data: ArrayBuffer) => {
        socketRef.current?.emit('video', data);
    }, []);

    const sendText = useCallback((text: string) => {
        const socket = socketRef.current;
        if (!socket) return;
        const msg: ChatMessage = {
            text,
            sender: socket.id ?? 'unknown',
            time: Date.now(),
        };
        socket.emit('text', msg);
    }, []);

    const sendSignal = useCallback((type: string, payload?: unknown) => {
        socketRef.current?.emit('call-signal', { type, payload });
    }, []);

    return {
        isConnected,
        messages,
        sendAudio,
        sendVideo,
        sendText,
        sendSignal,
    };
}