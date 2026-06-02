"use client";

import { useInterviewRoomController } from "../hooks/use-interview-room-controller";
import { InterviewChat } from "./interview-chat";
import { InterviewControls } from "./interview-controls";
import { InterviewMilestoneStatus } from "./interview-milestone-status";
import { InterviewVideoStage } from "./interview-video-stage";

export function InterviewRoomScreen() {
  const {
    state,
    persona,
    messages,
    inputText,
    setInputText,
    isRecording,
    micSupported,
    latestQuestionAudio,
    messagesEndRef,
    localVideoRef,
    cameraOn,
    cameraSupported,
    facialMetrics,
    facialScore,
    facialAnalysisReady,
    facialAnalysisError,
    currentMilestone,
    isPersonalized,
    latestVoiceMetrics,
    isFollowUp,
    startCamera,
    stopCamera,
    startRecording,
    stopRecording,
    sendMessage,
    handleKeyPress,
    replayLatestAudio,
  } = useInterviewRoomController();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background px-6 py-10">
      <div className="container mx-auto max-w-6xl">
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card/80 backdrop-blur-md">
          <InterviewVideoStage
            persona={persona}
            state={state}
            localVideoRef={localVideoRef}
            cameraOn={cameraOn}
            cameraSupported={cameraSupported}
            facialAnalysisReady={facialAnalysisReady}
            facialScore={facialScore}
            facialMetrics={facialMetrics}
            facialAnalysisError={facialAnalysisError}
            onStartCamera={startCamera}
            onStopCamera={stopCamera}
          />

          <InterviewMilestoneStatus
            milestone={currentMilestone}
            isPersonalized={isPersonalized}
            voiceMetrics={latestVoiceMetrics}
            isFollowUp={isFollowUp}
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
            canReplayAudio={Boolean(latestQuestionAudio)}
            replayDisabled={state !== "ready" && state !== "ended"}
            onReplayAudio={() => {
              void replayLatestAudio();
            }}
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
