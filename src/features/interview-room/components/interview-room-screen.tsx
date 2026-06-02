"use client";

import {
  useEffect,
  useRef,
  useState,
  useCallback,
  useSyncExternalStore,
} from "react";
import { useRouter } from "next/navigation";
import {
  Phone,
  PhoneOff,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Building2,
  User,
  Clock,
  Loader2,
  CalendarClock,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/utils/supabase/client";
import { fetchMyInterviewSlots, type InterviewSlot } from "@/lib/api/interview-slots";
import { useCallSocket } from "@/hooks/use-call-socket";
import { useAudio } from "@/hooks/use-audio";
import { useVideo } from "@/hooks/use-video";
import { cn } from "@/lib/utils";

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatTimeRange(startIso: string, endIso: string) {
  const fmt = (iso: string) =>
    new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  return `${fmt(startIso)} – ${fmt(endIso)}`;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function counterpartName(slot: InterviewSlot): string {
  return slot.studentName ?? slot.recruiterName ?? slot.company ?? "Your interviewer";
}

// ── Peer media helpers (same as call-page) ────────────────────────────────────

interface PeerMedia {
  ms: MediaSource | null;
  sb: SourceBuffer | null;
  pending: ArrayBuffer[];
  liveEdgeInterval: ReturnType<typeof setInterval> | null;
}

function createEmptyMedia(): PeerMedia {
  return { ms: null, sb: null, pending: [], liveEdgeInterval: null };
}

// ── Context bar ───────────────────────────────────────────────────────────────

function ContextBar({ slot }: { slot: InterviewSlot }) {
  const today = new Date().toDateString() === new Date(slot.startAt).toDateString();
  return (
    <div className="shrink-0 border-b border-border bg-card/80 backdrop-blur px-5 py-2.5 flex items-center gap-4 flex-wrap">
      <CalendarClock className="h-4 w-4 text-primary shrink-0" />
      <div className="flex-1 min-w-0 flex items-center gap-4 flex-wrap">
        <span className="text-sm font-semibold font-heading text-foreground truncate">
          {slot.offerTitle ?? "Interview"}
          {slot.company && (
            <span className="font-normal text-muted-foreground"> @ {slot.company}</span>
          )}
        </span>
        <span className="flex items-center gap-1 text-xs text-muted-foreground font-label shrink-0">
          <Clock className="h-3 w-3" />
          {today ? "" : `${formatDate(slot.startAt)}, `}
          {formatTimeRange(slot.startAt, slot.endAt)}
        </span>
        <span className="flex items-center gap-1 text-xs text-muted-foreground font-label shrink-0">
          <User className="h-3 w-3" />
          With: {counterpartName(slot)}
        </span>
      </div>
    </div>
  );
}

// ── Lobby ─────────────────────────────────────────────────────────────────────

function LobbyView({
  slot,
  onLeave,
}: {
  slot: InterviewSlot;
  onLeave: () => void;
}) {
  const name = counterpartName(slot);

  return (
    <div className="flex-1 flex flex-col items-center justify-center gap-6 bg-background p-8">
      {/* Pulsing rings */}
      <div className="relative flex items-center justify-center">
        <span className="absolute h-28 w-28 rounded-full bg-primary/10 animate-ping" />
        <span className="absolute h-20 w-20 rounded-full bg-primary/15 animate-pulse" />
        <div className="relative h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
          <Phone className="h-7 w-7 text-primary" />
        </div>
      </div>

      {/* Status text */}
      <div className="text-center space-y-1.5">
        <p className="text-base font-semibold font-heading text-foreground">
          Waiting for {name} to join…
        </p>
        <p className="text-sm text-muted-foreground font-body">
          The room is ready. You&apos;ll be connected automatically.
        </p>
      </div>

      {/* Interview summary */}
      <div className="rounded-xl border border-border bg-card px-5 py-3 flex items-center gap-3 text-sm font-body text-muted-foreground">
        <Building2 className="h-4 w-4 shrink-0 text-primary/60" />
        <span>
          {slot.offerTitle ?? "Interview"}
          {slot.company ? ` · ${slot.company}` : ""}
        </span>
        <span className="text-border">·</span>
        <Clock className="h-4 w-4 shrink-0 text-primary/60" />
        <span>{formatTimeRange(slot.startAt, slot.endAt)}</span>
      </div>

      <Button variant="outline" onClick={onLeave} className="gap-2 font-label">
        <ArrowLeft className="h-4 w-4" />
        Leave
      </Button>
    </div>
  );
}

// ── In-call chat panel ────────────────────────────────────────────────────────

function ChatPanel({
  messages,
  text,
  onTextChange,
  onSend,
}: {
  messages: { text: string; sender: string; time: number }[];
  text: string;
  onTextChange: (v: string) => void;
  onSend: () => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

  return (
    <div className="w-full max-w-md border border-border rounded-xl overflow-hidden bg-card">
      <div
        ref={scrollRef}
        className="h-36 overflow-y-auto px-3 py-2 space-y-1 bg-muted/20"
      >
        {messages.length === 0 ? (
          <p className="text-xs text-muted-foreground font-body py-2 text-center">
            In-call chat
          </p>
        ) : (
          messages.map((m, i) => (
            <div key={i} className="text-sm font-body">
              <span className="font-medium text-muted-foreground">
                {m.sender.slice(0, 6)}:
              </span>{" "}
              {m.text}
            </div>
          ))
        )}
      </div>
      <div className="flex border-t border-border">
        <input
          className="flex-1 px-3 py-2 bg-background text-foreground text-sm outline-none font-body"
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSend()}
          placeholder="Type a message…"
        />
        <button
          onClick={onSend}
          className="px-4 py-2 bg-primary text-primary-foreground text-sm font-label"
        >
          Send
        </button>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

// Hydration guard for MediaSource
const subscribeEmpty = () => () => {};
const getClientTrue = () => true;
const getServerFalse = () => false;

interface InterviewRoomScreenProps {
  slotId: string;
}

export function InterviewRoomScreen({ slotId }: InterviewRoomScreenProps) {
  const router = useRouter();

  const isHydrated = useSyncExternalStore(
    subscribeEmpty,
    getClientTrue,
    getServerFalse,
  );

  // ── Slot context ──
  const [slot, setSlot] = useState<InterviewSlot | null>(null);
  const [slotLoading, setSlotLoading] = useState(true);
  const [slotError, setSlotError] = useState<string | null>(null);

  useEffect(() => {
    fetchMyInterviewSlots()
      .then((all) => {
        const found = all.find((s) => s.id === slotId);
        if (!found) setSlotError("Interview not found. Make sure the link is correct.");
        else setSlot(found);
      })
      .catch(() => setSlotError("Failed to load interview details."))
      .finally(() => setSlotLoading(false));
  }, [slotId]);

  // ── User name ──
  const [userName, setUserName] = useState("");
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      setUserName(
        user.user_metadata?.full_name ||
          user.user_metadata?.name ||
          user.email?.split("@")[0] ||
          "Anonymous",
      );
    });
  }, []);

  // ── Call state ──
  const [peers, setPeers] = useState<string[]>([]);
  const [peerNames, setPeerNames] = useState<Map<string, string>>(new Map());
  const [inCall, setInCall] = useState(false);
  const [chatText, setChatText] = useState("");

  const peerMediaRef = useRef<Map<string, PeerMedia>>(new Map());
  const peerVideoEls = useRef<Map<string, HTMLVideoElement | null>>(new Map());
  const localVideoRef = useRef<HTMLVideoElement>(null);

  // ── MediaSource helpers (identical to call-page) ──

  const attachMediaSource = useCallback(
    (peerId: string, el: HTMLVideoElement) => {
      const media = peerMediaRef.current.get(peerId)!;
      const ms = new MediaSource();
      media.ms = ms;
      el.src = URL.createObjectURL(ms);

      ms.addEventListener("sourceopen", () => {
        const sb = ms.addSourceBuffer("video/webm;codecs=vp8");
        media.sb = sb;
        sb.addEventListener("updateend", () => {
          if (media.pending.length > 0 && !sb.updating) {
            sb.appendBuffer(media.pending.shift()!);
          }
        });
        if (media.pending.length > 0) sb.appendBuffer(media.pending.shift()!);
      });

      if (media.liveEdgeInterval) clearInterval(media.liveEdgeInterval);
      media.liveEdgeInterval = setInterval(() => {
        const sb = media.sb;
        if (!el || el.buffered.length === 0) return;
        const liveEdge = el.buffered.end(el.buffered.length - 1);
        // Pin playback to the live edge so latency can't accumulate.
        if (liveEdge - el.currentTime > 0.4) el.currentTime = liveEdge - 0.15;
        // Drop already-played video so the SourceBuffer stays small and
        // appends stay fast — an ever-growing buffer is what lets pending
        // chunks pile up into multi-second lag. Only removes data >2s behind
        // the playhead, so it never touches what's being played.
        if (sb && !sb.updating) {
          const start = el.buffered.start(0);
          const trimTo = el.currentTime - 2;
          if (trimTo > start + 0.5) {
            try { sb.remove(start, trimTo); } catch { /* ignore */ }
          }
        }
      }, 500);
    },
    [],
  );

  const setupPeerVideo = useCallback(
    (peerId: string, el: HTMLVideoElement) => {
      const media = peerMediaRef.current.get(peerId);
      if (!media || media.ms) return;
      attachMediaSource(peerId, el);
    },
    [attachMediaSource],
  );

  const resetPeerMedia = useCallback(
    (peerId: string, firstChunk?: ArrayBuffer) => {
      const media = peerMediaRef.current.get(peerId);
      const el = peerVideoEls.current.get(peerId);
      if (!media || !el) return;
      if (media.liveEdgeInterval) clearInterval(media.liveEdgeInterval);
      media.ms = null;
      media.sb = null;
      media.pending = firstChunk ? [firstChunk] : [];
      attachMediaSource(peerId, el);
    },
    [attachMediaSource],
  );

  const teardownPeerVideo = useCallback((peerId: string) => {
    const media = peerMediaRef.current.get(peerId);
    if (media?.liveEdgeInterval) clearInterval(media.liveEdgeInterval);
    peerMediaRef.current.delete(peerId);
    peerVideoEls.current.delete(peerId);
  }, []);

  const appendPeerVideo = useCallback(
    (peerId: string, data: ArrayBuffer) => {
      const media = peerMediaRef.current.get(peerId);
      if (!media) return;
      const { sb } = media;
      if (!sb || sb.updating) {
        media.pending.push(data);
        return;
      }
      try {
        sb.appendBuffer(data);
      } catch {
        resetPeerMedia(peerId, data);
      }
    },
    [resetPeerMedia],
  );

  // ── Socket — use slotId as room name ──
  const { isConnected, messages, sendAudio, sendVideo, sendText, sendSignal } =
    useCallSocket(slotId, userName, {
      onAudio: (data) => audio.playChunk(data),
      onVideo: (peerId, data) => appendPeerVideo(peerId, data),
      onPeerJoined: (id, name) => {
        if (!peerMediaRef.current.has(id)) {
          peerMediaRef.current.set(id, createEmptyMedia());
        }
        setPeers((prev) => (prev.includes(id) ? prev : [...prev, id]));
        setPeerNames((prev) => new Map(prev).set(id, name));
        setInCall(true); // ← transition lobby → call
        if (video.cameraOn) video.restartRecorder();
      },
      onPeerLeft: (id) => {
        teardownPeerVideo(id);
        setPeers((prev) => prev.filter((p) => p !== id));
        setPeerNames((prev) => {
          const m = new Map(prev);
          m.delete(id);
          return m;
        });
      },
    });

  const audio = useAudio({ onChunk: sendAudio });
  const video = useVideo({ onChunk: sendVideo, localVideoRef });

  useEffect(() => {
    audio.initPlayback();
    return () => audio.destroy();
  }, []);

  const handleLeave = useCallback(() => {
    audio.stop();
    video.stopCamera();
    sendSignal("hang-up");
    peers.forEach(teardownPeerVideo);
    setPeers([]);
    setPeerNames(new Map());
    setInCall(false);
    router.push("/services/interviews");
  }, [audio, video, sendSignal, peers, teardownPeerVideo, router]);

  const handleSendChat = useCallback(() => {
    if (!chatText.trim()) return;
    sendText(chatText.trim());
    setChatText("");
  }, [chatText, sendText]);

  // ── Render states ──

  if (slotLoading) {
    return (
      <div className="flex flex-col h-[calc(100vh-64px)]">
        <div className="shrink-0 border-b border-border bg-card/80 px-5 py-2.5 flex items-center gap-3">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm font-body">Loading interview…</span>
          </div>
        </div>
      </div>
    );
  }

  if (slotError || !slot) {
    return (
      <div className="flex flex-col h-[calc(100vh-64px)] items-center justify-center gap-4 p-8">
        <p className="text-sm text-destructive font-body">
          {slotError ?? "Interview not found."}
        </p>
        <Button
          variant="outline"
          onClick={() => router.push("/services/interviews")}
          className="gap-2 font-label"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Interviews
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden">
      {/* Context bar always visible */}
      <ContextBar slot={slot} />

      {/* Lobby — waiting for peer */}
      {!inCall && <LobbyView slot={slot} onLeave={handleLeave} />}

      {/* In call */}
      {inCall && isHydrated && (
        <div className="flex-1 flex flex-col items-center justify-center bg-background p-6 gap-4 overflow-y-auto">
          {/* Connection status */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-label">
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                isConnected ? "bg-emerald-500" : "bg-red-500",
              )}
            />
            {isConnected ? "Connected" : "Reconnecting…"}
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
                className="w-64 h-48 rounded-2xl bg-muted object-cover"
              />
              <span className="absolute bottom-2 left-2 text-xs text-white bg-black/50 px-2 py-0.5 rounded-lg font-label">
                {userName || "You"}
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
                  className="w-64 h-48 rounded-2xl bg-muted object-cover"
                />
                <span className="absolute bottom-2 left-2 text-xs text-white bg-black/50 px-2 py-0.5 rounded-lg font-label">
                  {peerNames.get(peerId) ?? counterpartName(slot)}
                </span>
              </div>
            ))}
          </div>

          {/* Controls */}
          <div className="flex gap-3">
            <button
              onClick={() =>
                audio.recording ? audio.stop() : void audio.start()
              }
              className={cn(
                "p-3 rounded-full text-white transition-colors",
                audio.recording ? "bg-red-500" : "bg-muted-foreground/60",
              )}
              title={audio.recording ? "Mute" : "Unmute"}
            >
              {audio.recording ? (
                <MicOff className="w-5 h-5" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={() =>
                video.cameraOn
                  ? video.stopCamera()
                  : void video.startCamera()
              }
              className={cn(
                "p-3 rounded-full text-white transition-colors",
                video.cameraOn ? "bg-red-500" : "bg-muted-foreground/60",
              )}
              title={video.cameraOn ? "Camera off" : "Camera on"}
            >
              {video.cameraOn ? (
                <VideoOff className="w-5 h-5" />
              ) : (
                <Video className="w-5 h-5" />
              )}
            </button>
            <button
              onClick={handleLeave}
              className="p-3 rounded-full bg-red-600 text-white"
              title="End call"
            >
              <PhoneOff className="w-5 h-5" />
            </button>
          </div>

          {/* Chat */}
          <ChatPanel
            messages={messages}
            text={chatText}
            onTextChange={setChatText}
            onSend={handleSendChat}
          />
        </div>
      )}
    </div>
  );
}
