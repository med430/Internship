import type { InterviewState } from "../types";

interface InterviewOrbProps {
  state: InterviewState;
}

export function InterviewOrb({ state }: InterviewOrbProps) {
  return (
    <div className="relative h-80 bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center overflow-hidden">
      <div className="relative">
        <div
          className={`
            w-32 h-32 rounded-full transition-all duration-500 ease-in-out
            ${
              state === "speaking"
                ? "scale-110 animate-pulse shadow-2xl shadow-primary/50"
                : state === "listening"
                  ? "scale-95 shadow-lg shadow-accent/30"
                  : state === "recording"
                    ? "scale-105 shadow-xl shadow-red-500/50"
                    : "scale-100 shadow-xl shadow-primary/40"
            }
            bg-gradient-to-br ${
              state === "recording"
                ? "from-red-500 via-red-400 to-red-500"
                : "from-primary via-accent to-primary"
            }
            backdrop-blur-lg
          `}
          style={{
            animation:
              state === "speaking"
                ? "orb-pulse 1.5s ease-in-out infinite"
                : state === "listening"
                  ? "orb-listening 2s ease-in-out infinite"
                  : state === "recording"
                    ? "orb-recording 1s ease-in-out infinite"
                    : "orb-float 3s ease-in-out infinite",
          }}
        />

        <div
          className={`
            absolute inset-0 rounded-full transition-all duration-500
            ${state === "speaking" ? "opacity-60" : "opacity-30"}
            bg-gradient-to-br from-primary/40 to-accent/40 blur-2xl
          `}
          style={{ animation: "orb-glow 2s ease-in-out infinite" }}
        />
      </div>

      <div className="absolute bottom-8 text-center">
        <p className="text-sm font-medium text-foreground/80">
          {state === "connecting" && "Connecting to interviewer..."}
          {state === "ready" && "Ready"}
          {state === "recording" && "Recording your response..."}
          {state === "listening" && "Processing your response..."}
          {state === "speaking" && "Interviewer is speaking"}
          {state === "ended" && "Interview completed"}
        </p>
      </div>
    </div>
  );
}
