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
    onVideo?: (peerId: string, data: ArrayBuffer) => void;
    onPeerJoined?: (peerId: string, name: string) => void;
    onPeerLeft?: (peerId: string) => void;
}

export function useCallSocket(
    room: string,
    userName: string,
    options: UseCallSocketOptions = {},
) {
    const socketRef = useRef<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);

    const optionsRef = useRef(options);
    optionsRef.current = options;

    useEffect(() => {
        const socket = io(process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:3000');
        socketRef.current = socket;

        socket.on('connect', () => {
            setIsConnected(true);
            if (room) socket.emit('join-room', { room, name: userName });
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

        socket.on('video', (peerId: string, data: unknown) => {
            if (!optionsRef.current.onVideo) return;
            const raw = Array.isArray(data) ? data[0] : data;
            if (raw instanceof ArrayBuffer) {
                optionsRef.current.onVideo(peerId, raw);
            } else if (raw?.buffer instanceof ArrayBuffer) {
                const ab = raw.buffer.slice(
                    raw.byteOffset,
                    raw.byteOffset + raw.byteLength,
                ) as ArrayBuffer;
                optionsRef.current.onVideo(peerId, ab);
            }
        });

        socket.on('existing-peers', (peers: { peerId: string; name: string }[]) => {
            peers.forEach(({ peerId, name }) =>
                optionsRef.current.onPeerJoined?.(peerId, name),
            );
        });

        socket.on('peer-joined', ({ peerId, name }: { peerId: string; name: string }) => {
            optionsRef.current.onPeerJoined?.(peerId, name);
        });

        socket.on('peer-left', ({ peerId }: { peerId: string }) => {
            optionsRef.current.onPeerLeft?.(peerId);
        });

        return () => {
            socket.emit('leave-room');
            socket.disconnect();
        };
    }, [room, userName]);

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
