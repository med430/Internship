'use client';

import { useEffect, useRef, useState, useCallback, useSyncExternalStore } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Copy, Check, Phone, PhoneOff, Video, VideoOff, Mic, MicOff } from 'lucide-react';
import { useCallSocket } from '@/hooks/use-call-socket';
import { useAudio } from '@/hooks/use-audio';
import { useVideo } from '@/hooks/use-video';
import { createClient } from '@/utils/supabase/client';

interface PeerMedia {
    ms: MediaSource | null;
    sb: SourceBuffer | null;
    pending: ArrayBuffer[];
    liveEdgeInterval: ReturnType<typeof setInterval> | null;
}

function createEmptyMedia(): PeerMedia {
    return { ms: null, sb: null, pending: [], liveEdgeInterval: null };
}

function subscribeToLocationChange() {
    return () => {};
}

function getLocationOrigin() {
    return window.location.origin;
}

function getServerLocationOrigin() {
    return '';
}

export default function CallPage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const roomFromUrl = searchParams.get('room') ?? '';
    const locationOrigin = useSyncExternalStore(
        subscribeToLocationChange,
        getLocationOrigin,
        getServerLocationOrigin,
    );
    const [joined, setJoined] = useState(false);
    const [text, setText] = useState('');
    const [peers, setPeers] = useState<string[]>([]);
    const [peerNames, setPeerNames] = useState<Map<string, string>>(new Map());
    const [userName, setUserName] = useState('');
    const [copied, setCopied] = useState(false);

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const peerMediaRef = useRef<Map<string, PeerMedia>>(new Map());
    const peerVideoEls = useRef<Map<string, HTMLVideoElement | null>>(new Map());

    useEffect(() => {
        const supabase = createClient();
        supabase.auth.getUser().then(({ data: { user } }) => {
            if (!user) return;
            const name =
                user.user_metadata?.full_name ||
                user.user_metadata?.name ||
                user.email?.split('@')[0] ||
                'Anonymous';
            setUserName(name);
        });
    }, []);

    const callLink = roomFromUrl && locationOrigin
        ? `${locationOrigin}/services/call?room=${roomFromUrl}`
        : '';

    const handleNewCall = () => {
        const id = crypto.randomUUID();
        router.push(`/services/call?room=${id}`);
    };

    const handleCopyLink = async () => {
        if (!callLink) return;
        await navigator.clipboard.writeText(callLink);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // ---- media source helpers ----

    const attachMediaSource = useCallback((peerId: string, el: HTMLVideoElement) => {
        const media = peerMediaRef.current.get(peerId)!;
        const ms = new MediaSource();
        media.ms = ms;
        el.src = URL.createObjectURL(ms);

        ms.addEventListener('sourceopen', () => {
            const sb = ms.addSourceBuffer('video/webm;codecs=vp8');
            media.sb = sb;

            sb.addEventListener('updateend', () => {
                if (media.pending.length > 0 && !sb.updating) {
                    sb.appendBuffer(media.pending.shift()!);
                }
            });

            if (media.pending.length > 0) {
                sb.appendBuffer(media.pending.shift()!);
            }
        });

        if (media.liveEdgeInterval) clearInterval(media.liveEdgeInterval);
        media.liveEdgeInterval = setInterval(() => {
            if (!el || el.buffered.length === 0) return;
            const liveEdge = el.buffered.end(el.buffered.length - 1);
            if (liveEdge - el.currentTime > 0.5) el.currentTime = liveEdge - 0.1;
        }, 500);
    }, []);

    const setupPeerVideo = useCallback((peerId: string, el: HTMLVideoElement) => {
        const media = peerMediaRef.current.get(peerId);
        if (!media || media.ms) return;
        attachMediaSource(peerId, el);
    }, [attachMediaSource]);

    const resetPeerMedia = useCallback((peerId: string, firstChunk?: ArrayBuffer) => {
        const media = peerMediaRef.current.get(peerId);
        const el = peerVideoEls.current.get(peerId);
        if (!media || !el) return;
        if (media.liveEdgeInterval) clearInterval(media.liveEdgeInterval);
        media.ms = null;
        media.sb = null;
        media.pending = firstChunk ? [firstChunk] : [];
        attachMediaSource(peerId, el);
    }, [attachMediaSource]);

    const teardownPeerVideo = useCallback((peerId: string) => {
        const media = peerMediaRef.current.get(peerId);
        if (media?.liveEdgeInterval) clearInterval(media.liveEdgeInterval);
        peerMediaRef.current.delete(peerId);
        peerVideoEls.current.delete(peerId);
    }, []);

    const appendPeerVideo = useCallback((peerId: string, data: ArrayBuffer) => {
        const media = peerMediaRef.current.get(peerId);
        if (!media) return;
        const { sb } = media;
        if (!sb || sb.updating) { media.pending.push(data); return; }
        try {
            sb.appendBuffer(data);
        } catch {
            resetPeerMedia(peerId, data);
        }
    }, [resetPeerMedia]);

    // ---- socket ----

    const { isConnected, messages, sendAudio, sendVideo, sendText, sendSignal } =
        useCallSocket(joined ? roomFromUrl : '', userName, {
            onAudio: (data) => audio.playChunk(data),
            onVideo: (peerId, data) => appendPeerVideo(peerId, data),
            onPeerJoined: (id, name) => {
                if (!peerMediaRef.current.has(id)) {
                    peerMediaRef.current.set(id, createEmptyMedia());
                }
                setPeers((prev) => (prev.includes(id) ? prev : [...prev, id]));
                setPeerNames((prev) => new Map(prev).set(id, name));
                if (video.cameraOn) video.restartRecorder();
            },
            onPeerLeft: (id) => {
                teardownPeerVideo(id);
                setPeers((prev) => prev.filter((p) => p !== id));
                setPeerNames((prev) => { const m = new Map(prev); m.delete(id); return m; });
            },
        });

    const audio = useAudio({ onChunk: sendAudio });
    const video = useVideo({ onChunk: sendVideo, localVideoRef });

    useEffect(() => {
        audio.initPlayback();
        return () => audio.destroy();
    }, []);

    const handleJoin = () => setJoined(true);

    const handleHangUp = () => {
        audio.stop();
        video.stopCamera();
        sendSignal('hang-up');
        peers.forEach(teardownPeerVideo);
        setPeers([]);
        setPeerNames(new Map());
        setJoined(false);
    };

    const handleSendMessage = () => {
        if (!text.trim()) return;
        sendText(text.trim());
        setText('');
    };

    // ---- no room in URL → landing ----
    if (!roomFromUrl) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6">
                <h1 className="text-2xl font-semibold text-foreground">Start a Call</h1>
                <p className="text-sm text-muted-foreground">
                    Create a room and share the link with anyone you want to call.
                </p>
                <button
                    onClick={handleNewCall}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-medium"
                >
                    <Phone className="w-4 h-4" />
                    New Call
                </button>
            </div>
        );
    }

    // ---- room in URL but not yet joined → lobby ----
    if (!joined) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6">
                <h1 className="text-2xl font-semibold text-foreground">You have a call waiting</h1>

                {/* Copyable link */}
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-muted/40 max-w-md w-full">
                    <span className="flex-1 text-xs text-muted-foreground truncate">{callLink}</span>
                    <button onClick={handleCopyLink} className="shrink-0 text-muted-foreground hover:text-foreground transition-colors">
                        {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                    </button>
                </div>

                <p className="text-xs text-muted-foreground">
                    Share the link above with whoever you want to invite.
                </p>

                <button
                    onClick={handleJoin}
                    className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-medium"
                >
                    <Phone className="w-4 h-4" />
                    Join Call
                </button>
            </div>
        );
    }

    // ---- in call ----
    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 gap-4">

            {/* Top bar: status + link */}
            <div className="flex items-center gap-4 flex-wrap justify-center">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                    {isConnected ? 'Connected' : 'Disconnected'}
                </div>

                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-muted/40">
                    <span className="text-xs text-muted-foreground truncate max-w-[220px]">{callLink}</span>
                    <button onClick={handleCopyLink} className="shrink-0 text-muted-foreground hover:text-foreground transition-colors">
                        {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                </div>
            </div>

            {/* Video tiles */}
            <div className="flex flex-wrap gap-4 justify-center">
                {/* Local tile */}
                <div className="relative">
                    <video
                        ref={localVideoRef}
                        autoPlay
                        muted
                        playsInline
                        className="w-64 h-48 rounded-xl bg-muted object-cover"
                    />
                    <span className="absolute bottom-2 left-2 text-xs text-white bg-black/50 px-2 py-0.5 rounded">
                        {userName || 'You'}
                    </span>
                </div>

                {/* Remote peer tiles */}
                {peers.map((peerId) => (
                    <div key={peerId} className="relative">
                        <video
                            ref={(el) => {
                                peerVideoEls.current.set(peerId, el);
                                if (el) setupPeerVideo(peerId, el);
                            }}
                            autoPlay
                            playsInline
                            className="w-64 h-48 rounded-xl bg-muted object-cover"
                        />
                        <span className="absolute bottom-2 left-2 text-xs text-white bg-black/50 px-2 py-0.5 rounded">
                            {peerNames.get(peerId) ?? peerId.slice(0, 6)}
                        </span>
                    </div>
                ))}
            </div>

            {/* Controls */}
            <div className="flex gap-3">
                <button
                    onClick={() => (audio.recording ? audio.stop() : void audio.start())}
                    className={`p-3 rounded-full text-white ${audio.recording ? 'bg-red-500' : 'bg-muted-foreground/60'}`}
                    title={audio.recording ? 'Mute' : 'Unmute'}
                >
                    {audio.recording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                </button>
                <button
                    onClick={() => (video.cameraOn ? video.stopCamera() : void video.startCamera())}
                    className={`p-3 rounded-full text-white ${video.cameraOn ? 'bg-red-500' : 'bg-muted-foreground/60'}`}
                    title={video.cameraOn ? 'Camera off' : 'Camera on'}
                >
                    {video.cameraOn ? <VideoOff className="w-5 h-5" /> : <Video className="w-5 h-5" />}
                </button>
                <button
                    onClick={handleHangUp}
                    className="p-3 rounded-full bg-red-600 text-white"
                    title="Hang up"
                >
                    <PhoneOff className="w-5 h-5" />
                </button>
            </div>

            {/* Chat */}
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
        </div>
    );
}
