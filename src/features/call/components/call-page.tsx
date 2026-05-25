// src/features/call/components/call-page.tsx (or wherever your routing puts it)
'use client';

import { useEffect, useRef, useState } from 'react';
import { useCallSocket } from '@/hooks/use-call-socket';
import { useAudio } from '@/hooks/use-audio';
import { useVideo } from '@/hooks/use-video';

export default function CallPage() {
    const [room, setRoom] = useState('room1');
    const [joined, setJoined] = useState(false);
    const [text, setText] = useState('');
    const [muted, setMuted] = useState(false);

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const remoteMediaSourceRef = useRef<MediaSource | null>(null);
    const remoteSourceBufferRef = useRef<SourceBuffer | null>(null);

    // ---- hooks ----
    const { isConnected, messages, sendAudio, sendVideo, sendText, sendSignal } =
        useCallSocket(joined ? room : '', {
            onAudio: (data) => audio.playChunk(data),
            onVideo: (data) => appendRemoteVideo(data),
            onPeerJoined: (id) => console.log('peer joined:', id),
            onPeerLeft: (id) => console.log('peer left:', id),
        });

    const audio = useAudio({ onChunk: sendAudio });

    const video = useVideo({
        onChunk: sendVideo,
        localVideoRef,
    });

    // ---- remote video playback setup ----
    useEffect(() => {
        if (!remoteVideoRef.current) return;

        const ms = new MediaSource();
        remoteMediaSourceRef.current = ms;
        remoteVideoRef.current.src = URL.createObjectURL(ms);

        ms.addEventListener('sourceopen', () => {
            const sb = ms.addSourceBuffer('video/webm;codecs=vp8');
            remoteSourceBufferRef.current = sb;
        });
    }, []);

    const appendRemoteVideo = (data: ArrayBuffer) => {
        const sb = remoteSourceBufferRef.current;
        if (!sb || sb.updating) return;
        try {
            sb.appendBuffer(data);
        } catch {
            // Buffer full or codec mismatch — safe to ignore
        }
    };

    // ---- init audio playback context on mount ----
    useEffect(() => {
        audio.initPlayback();
        return () => audio.destroy();
    }, []);

    // ---- handlers ----
    const handleJoin = () => setJoined(true);

    const handleHangUp = () => {
        audio.stop();
        video.stopCamera();
        sendSignal('hang-up');
        setJoined(false);
    };

    const handleToggleMute = () => {
        if (muted) {
            void audio.start();
        } else {
            audio.stop();
        }
        setMuted((prev) => !prev);
        sendSignal(muted ? 'unmute' : 'mute');
    };

    const handleSendMessage = () => {
        if (!text.trim()) return;
        sendText(text.trim());
        setText('');
    };

    // ---- render ----
    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 gap-4">

            {/* Connection status */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                {isConnected ? 'Connected' : 'Disconnected'}
            </div>

            {/* Room join */}
            {!joined && (
                <div className="flex gap-2">
                    <input
                        className="border border-border rounded-md px-3 py-2 bg-background text-foreground text-sm"
                        value={room}
                        onChange={(e) => setRoom(e.target.value)}
                        placeholder="Room name"
                    />
                    <button
                        className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm"
                        onClick={handleJoin}
                    >
                        Join
                    </button>
                </div>
            )}

            {/* Video tiles */}
            {joined && (
                <div className="flex gap-4">
                    <div className="relative">
                        <video
                            ref={localVideoRef}
                            autoPlay
                            muted
                            playsInline
                            className="w-64 h-48 rounded-xl bg-muted object-cover"
                        />
                        <span className="absolute bottom-2 left-2 text-xs text-white bg-black/50 px-2 py-0.5 rounded">
              You
            </span>
                    </div>
                    <div className="relative">
                        <video
                            ref={remoteVideoRef}
                            autoPlay
                            playsInline
                            className="w-64 h-48 rounded-xl bg-muted object-cover"
                        />
                        <span className="absolute bottom-2 left-2 text-xs text-white bg-black/50 px-2 py-0.5 rounded">
              Remote
            </span>
                    </div>
                </div>
            )}

            {/* Controls */}
            {joined && (
                <div className="flex gap-3">
                    <button
                        onClick={() => (audio.recording ? audio.stop() : void audio.start())}
                        className={`px-4 py-2 rounded-md text-sm text-white ${audio.recording ? 'bg-red-500' : 'bg-green-600'}`}
                    >
                        {audio.recording ? '🔇 Mute' : '🎤 Unmute'}
                    </button>
                    <button
                        onClick={() => (video.cameraOn ? video.stopCamera() : void video.startCamera())}
                        className={`px-4 py-2 rounded-md text-sm text-white ${video.cameraOn ? 'bg-red-500' : 'bg-blue-600'}`}
                    >
                        {video.cameraOn ? '📷 Camera off' : '📷 Camera on'}
                    </button>
                    <button
                        onClick={handleHangUp}
                        className="px-4 py-2 bg-red-600 text-white rounded-md text-sm"
                    >
                        ✕ Hang up
                    </button>
                </div>
            )}

            {/* Chat */}
            {joined && (
                <div className="w-full max-w-md border border-border rounded-xl overflow-hidden">
                    <div className="h-40 overflow-y-auto p-3 space-y-1 bg-muted/30">
                        {messages.map((m, i) => (
                            <div key={i} className="text-sm">
                <span className="font-medium text-muted-foreground">
                  {m.sender.slice(0, 6)}:
                </span>{' '}
                                {m.text}
                            </div>
                        ))}
                    </div>
                    <div className="flex border-t border-border">
                        <input
                            className="flex-1 px-3 py-2 bg-background text-foreground text-sm outline-none"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                            placeholder="Type a message..."
                        />
                        <button
                            onClick={handleSendMessage}
                            className="px-4 py-2 bg-primary text-primary-foreground text-sm"
                        >
                            Send
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}