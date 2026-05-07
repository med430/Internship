import { Mic, MicOff, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { InterviewState } from "../types";

interface InterviewControlsProps {
  state: InterviewState;
  inputText: string;
  isRecording: boolean;
  micSupported: boolean;
  onInputTextChange: (value: string) => void;
  onSendMessage: () => void;
  onKeyPress: (event: React.KeyboardEvent) => void;
  onStartRecording: () => Promise<void>;
  onStopRecording: () => void;
}

export function InterviewControls({
  state,
  inputText,
  isRecording,
  micSupported,
  onInputTextChange,
  onSendMessage,
  onKeyPress,
  onStartRecording,
  onStopRecording,
}: InterviewControlsProps) {
  return (
    <div className="p-6 border-t border-border/60 bg-card/40">
      <div className="space-y-5">
        <div className="flex gap-3">
          <Textarea
            value={inputText}
            onChange={(event) => onInputTextChange(event.target.value)}
            onKeyDown={onKeyPress}
            placeholder="Type your response..."
            disabled={state !== "ready"}
            className="flex-1 min-h-[60px] max-h-[120px] resize-none"
          />

          <Button
            onClick={onSendMessage}
            disabled={!inputText.trim() || state !== "ready"}
            size="icon"
            className="flex-shrink-0 h-[60px] w-[60px]"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Press Enter to send. Shift + Enter for new line.
        </p>

        <div className="rounded-2xl border border-border/60 bg-background/70 px-4 py-5">
          <div className="flex gap-3 items-center justify-center">
            <Button
              onClick={isRecording ? onStopRecording : onStartRecording}
              disabled={(state !== "ready" && !isRecording) || !micSupported}
              title={
                !micSupported
                  ? "Microphone unavailable. Use https or localhost and allow microphone permissions."
                  : undefined
              }
              size="lg"
              className={`relative flex-shrink-0 h-[90px] w-[90px] rounded-full transition-all duration-300 ${
                isRecording
                  ? "bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/50"
                  : "bg-primary hover:bg-primary/90 shadow-lg shadow-primary/50"
              }`}
            >
              {isRecording ? (
                <div className="flex flex-col items-center gap-1">
                  <MicOff className="h-8 w-8" />
                  <span className="text-[10px] font-medium">Stop</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-1">
                  <Mic className="h-8 w-8" />
                  <span className="text-[10px] font-medium">Speak</span>
                </div>
              )}

              {isRecording && (
                <span className="absolute -inset-2 rounded-full border-4 border-red-500 animate-ping opacity-75" />
              )}
            </Button>
          </div>

          <div className="text-center space-y-1">
            <p className="text-sm font-medium text-foreground">
              {isRecording
                ? "Recording..."
                : state === "listening"
                  ? "Processing..."
                  : "Tap to speak"}
            </p>
            <p className="text-xs text-muted-foreground">
              {isRecording
                ? "Tap the red button to finish"
                : state === "listening"
                  ? "Transcribing and analyzing your response"
                  : "Speak your answer clearly"}
            </p>
            {!micSupported && (
              <p className="mt-1 text-xs text-rose-500">
                Microphone access unavailable. Ensure you are using https or
                localhost and allow browser microphone permission.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
