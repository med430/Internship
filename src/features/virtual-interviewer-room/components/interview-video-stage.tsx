import { Camera, CameraOff, Loader2, Video } from "lucide-react";
import Image from "next/image";
import type { RefObject } from "react";
import { Button } from "@/components/ui/button";
import type { FacialExpressionMetrics } from "@/lib/api/interviews/types";
import type { InterviewState } from "../types";

const PERSONA_IMAGES: Record<string, string> = {
  alex_chen: "/personas/Alex Chen.png",
  sarah_williams: "/personas/Sarah Williams.png",
  ali_mahmoud: "/personas/Ali Mahmoud.png",
  aisha_obeid: "/personas/Aisha Obeid.png",
  jordan_lee: "/personas/Jordan Lee.png",
  harvey_specter: "/personas/Harvey Specter.png",
  emma_wilson: "/personas/Emma Wilson.png",
  lisa_anderson: "/personas/Lisa Anderson.png",
  michael_rodriguez: "/personas/Michael Rodriguez.png",
  james_thompson: "/personas/James Thompson.png",
};

const PERSONA_NAMES: Record<string, string> = {
  alex_chen: "Alex Chen",
  sarah_williams: "Sarah Williams",
  ali_mahmoud: "Ali Mahmoud",
  aisha_obeid: "Aisha Obeid",
  jordan_lee: "Jordan Lee",
  harvey_specter: "Harvey Specter",
  emma_wilson: "Emma Wilson",
  lisa_anderson: "Lisa Anderson",
  michael_rodriguez: "Michael Rodriguez",
  james_thompson: "James Thompson",
};

interface InterviewVideoStageProps {
  persona: string;
  state: InterviewState;
  localVideoRef: RefObject<HTMLVideoElement | null>;
  cameraOn: boolean;
  cameraSupported: boolean;
  facialAnalysisReady: boolean;
  facialScore: number | null;
  facialMetrics: FacialExpressionMetrics;
  facialAnalysisError: string | null;
  onStartCamera: () => Promise<void>;
  onStopCamera: () => void;
}

function formatState(state: InterviewState) {
  switch (state) {
    case "speaking":
      return "Speaking";
    case "recording":
      return "Recording";
    case "listening":
      return "Processing";
    case "ended":
      return "Completed";
    case "connecting":
      return "Connecting";
    default:
      return "Ready";
  }
}

export function InterviewVideoStage({
  persona,
  state,
  localVideoRef,
  cameraOn,
  cameraSupported,
  facialAnalysisReady,
  facialScore,
  facialMetrics,
  facialAnalysisError,
  onStartCamera,
  onStopCamera,
}: InterviewVideoStageProps) {
  const personaImage = PERSONA_IMAGES[persona] ?? PERSONA_IMAGES.alex_chen;
  const personaName = PERSONA_NAMES[persona] ?? "AI Interviewer";
  const candidateStatus = cameraOn
    ? facialAnalysisReady
      ? "Expression coaching active"
      : "Preparing expression coaching"
    : "Camera off";

  return (
    <section className="border-b border-border/60 bg-slate-950 p-4 sm:p-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="relative min-h-[260px] overflow-hidden rounded-xl border border-white/10 bg-slate-900">
          <Image
            src={personaImage}
            alt={personaName}
            fill
            sizes="(min-width: 1024px) 60vw, 100vw"
            className="object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/20" />
          <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-black/50 px-3 py-1 text-xs font-medium text-white">
            <span
              className={`h-2 w-2 rounded-full ${
                state === "speaking" ? "bg-emerald-400" : "bg-white/50"
              }`}
            />
            {formatState(state)}
          </div>
          <div className="absolute bottom-4 left-4 right-4">
            <p className="text-xs uppercase tracking-wide text-white/65">
              AI interviewer
            </p>
            <h1 className="text-2xl font-semibold text-white">{personaName}</h1>
            <p className="mt-1 text-sm text-white/75">
              Live voice interview simulator
            </p>
          </div>
        </div>

        <div className="flex min-h-[260px] flex-col overflow-hidden rounded-xl border border-white/10 bg-slate-900">
          <div className="relative flex-1 bg-black">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className={`h-full min-h-[210px] w-full object-cover transition-opacity ${
                cameraOn ? "opacity-100" : "opacity-0"
              }`}
            />

            {!cameraOn ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/75">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/10">
                  <Video className="h-7 w-7" />
                </div>
                <p className="text-sm font-medium">Camera preview disabled</p>
              </div>
            ) : null}

            <div className="absolute bottom-3 left-3 rounded-full bg-black/55 px-3 py-1 text-xs font-medium text-white">
              You
            </div>
          </div>

          <div className="space-y-3 border-t border-white/10 bg-slate-950/80 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-white">
                  {candidateStatus}
                </p>
                <p className="text-xs text-white/55">
                  {facialAnalysisError ??
                    "Only aggregate camera-based cues are stored."}
                </p>
              </div>
              <Button
                type="button"
                size="icon"
                variant={cameraOn ? "destructive" : "secondary"}
                disabled={!cameraSupported}
                onClick={() => {
                  if (cameraOn) {
                    onStopCamera();
                    return;
                  }
                  void onStartCamera();
                }}
                title={
                  cameraSupported
                    ? cameraOn
                      ? "Turn camera off"
                      : "Turn camera on"
                    : "Camera unavailable"
                }
              >
                {cameraOn ? (
                  <CameraOff className="h-4 w-4" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-white/5 px-2 py-2">
                <p className="text-[11px] text-white/50">Cue score</p>
                <p className="text-sm font-semibold text-white">
                  {facialScore === null ? "--" : `${facialScore}/100`}
                </p>
              </div>
              <div className="rounded-lg bg-white/5 px-2 py-2">
                <p className="text-[11px] text-white/50">Face present</p>
                <p className="text-sm font-semibold text-white">
                  {facialMetrics.facePresentRate}%
                </p>
              </div>
              <div className="rounded-lg bg-white/5 px-2 py-2">
                <p className="text-[11px] text-white/50">Samples</p>
                <p className="flex items-center justify-center gap-1 text-sm font-semibold text-white">
                  {cameraOn && !facialAnalysisReady ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : null}
                  {facialMetrics.sampleCount}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
