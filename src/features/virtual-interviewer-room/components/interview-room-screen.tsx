"use client";

import { useInterviewRoomController } from "../hooks/use-interview-room-controller";
import { InterviewOrb } from "./interview-orb";
import { InterviewChat } from "./interview-chat";
import { InterviewControls } from "./interview-controls";

export function InterviewRoomScreen() {
  const {
    state,
    messages,
    inputText,
    setInputText,
    isRecording,
    micSupported,
    latestQuestionAudio,
    messagesEndRef,
    startRecording,
    stopRecording,
    sendMessage,
    handleKeyPress,
    replayLatestAudio,
  } = useInterviewRoomController();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background px-6 py-10">
      <div className="container mx-auto max-w-5xl">
        <div className="rounded-2xl border border-border/60 bg-card/80 backdrop-blur-md overflow-hidden">
          <InterviewOrb
            state={state}
            canReplayAudio={Boolean(latestQuestionAudio)}
            replayDisabled={state !== "ready" && state !== "ended"}
            onReplayAudio={() => {
              void replayLatestAudio();
            }}
          />

          <InterviewChat
            state={state}
            messages={messages}
            messagesEndRef={messagesEndRef}
          />

          <InterviewControls
            state={state}
            inputText={inputText}
            isRecording={isRecording}
            micSupported={micSupported}
            onInputTextChange={setInputText}
            onSendMessage={sendMessage}
            onKeyPress={handleKeyPress}
            onStartRecording={startRecording}
            onStopRecording={stopRecording}
          />
        </div>
      </div>

      <style jsx global>{`
        @keyframes orb-float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes orb-pulse {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.15);
          }
        }

        @keyframes orb-listening {
          0%,
          100% {
            transform: scale(0.95);
          }
          50% {
            transform: scale(1);
          }
        }

        @keyframes orb-glow {
          0%,
          100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.1);
          }
        }

        @keyframes orb-recording {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }
      `}</style>
    </div>
  );
}
