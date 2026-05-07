"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { answerInterview } from "@/lib/api/interviews";
import type { ChatMessage, InterviewState } from "../types";

type LegacyGetUserMedia = (
  constraints: MediaStreamConstraints,
  onSuccess: (stream: MediaStream) => void,
  onError: (error: DOMException) => void,
) => void;

interface NavigatorWithLegacyGetUserMedia extends Navigator {
  getUserMedia?: LegacyGetUserMedia;
  webkitGetUserMedia?: LegacyGetUserMedia;
  mozGetUserMedia?: LegacyGetUserMedia;
}

interface InterviewAudioPayload {
  audioBase64: string;
  audioMime: string;
}

async function getUserMediaCompat(
  constraints: MediaStreamConstraints,
): Promise<MediaStream> {
  if (typeof navigator === "undefined") {
    throw new Error("Microphone access is only available in the browser.");
  }

  const nav = navigator as NavigatorWithLegacyGetUserMedia;
  if (nav.mediaDevices?.getUserMedia) {
    return nav.mediaDevices.getUserMedia(constraints);
  }

  const legacyGetUserMedia =
    nav.getUserMedia || nav.webkitGetUserMedia || nav.mozGetUserMedia;

  if (legacyGetUserMedia) {
    return new Promise((resolve, reject) => {
      legacyGetUserMedia.call(navigator, constraints, resolve, reject);
    });
  }

  throw new Error(
    "Microphone access is unavailable in this browser or requires https/localhost.",
  );
}

async function playInterviewAudio(
  audioBase64?: string,
  audioMime?: string,
): Promise<void> {
  if (!audioBase64 || !audioMime || typeof window === "undefined") {
    return;
  }

  await new Promise<void>((resolve) => {
    const audio = new Audio(`data:${audioMime};base64,${audioBase64}`);

    const cleanup = () => {
      audio.onended = null;
      audio.onerror = null;
      resolve();
    };

    audio.onended = cleanup;
    audio.onerror = cleanup;

    void audio.play().catch(() => {
      cleanup();
    });
  });
}

export function useInterviewRoomController() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const persona = searchParams.get("persona") || "alex_chen";
  const interviewId = searchParams.get("interviewId");
  const initialQuestion = searchParams.get("question");

  const [state, setState] = useState<InterviewState>("connecting");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [micSupported, setMicSupported] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [latestQuestionAudio, setLatestQuestionAudio] =
    useState<InterviewAudioPayload | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    if (!interviewId) {
      toast.error("Interview session not found. Please start a new one.");
      setState("ended");
      router.replace("/services/virtual-interviewer");
      return;
    }

    if (!initialQuestion) {
      toast.error("Interview session could not be restored. Please start again.");
      setState("ended");
      router.replace("/services/virtual-interviewer");
      return;
    }

    setMessages([
      {
        role: "interviewer",
        content: initialQuestion,
      },
    ]);

    void (async () => {
      const storageKey = `interview-audio:${interviewId}`;
      const storedAudio = sessionStorage.getItem(storageKey);

      if (!storedAudio) {
        setState("ready");
        return;
      }

      sessionStorage.removeItem(storageKey);

      try {
        const payload = JSON.parse(storedAudio) as {
          audioBase64?: string;
          audioMime?: string;
        };

        if (payload.audioBase64 && payload.audioMime) {
          setLatestQuestionAudio({
            audioBase64: payload.audioBase64,
            audioMime: payload.audioMime,
          });
          setState("speaking");
          await playInterviewAudio(payload.audioBase64, payload.audioMime);
        }
      } catch {
        // Ignore invalid cached audio payloads and continue the interview.
      }

      setState("ready");
    })();
  }, [initialQuestion, interviewId, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    try {
      const nav = navigator as NavigatorWithLegacyGetUserMedia;
      const supported = Boolean(
        (nav.mediaDevices && nav.mediaDevices.getUserMedia) ||
          nav.getUserMedia ||
          nav.webkitGetUserMedia ||
          nav.mozGetUserMedia,
      );
      setMicSupported(supported);
    } catch {
      setMicSupported(false);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state === "recording"
      ) {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const submitInterviewResponse = useCallback(
    async (input: {
      text?: string;
      audio?: Blob;
      audioFilename?: string;
      userContent: string;
    }) => {
      if (!interviewId || isSubmitting || state === "ended") {
        return;
      }

      setMessages((previous) => [
        ...previous,
        { role: "user", content: input.userContent },
      ]);
      setState("listening");
      setIsSubmitting(true);

      try {
        const response = await answerInterview(interviewId, {
          text: input.text,
          audio: input.audio,
          audioFilename: input.audioFilename,
        });

        setMessages((previous) => {
          const next = [...previous];

          if (response.done) {
            next.push({
              role: "interviewer",
              content:
                response.summary || response.feedback || "Interview completed.",
            });
            return next;
          }

          if (response.feedback?.trim()) {
            next.push({
              role: "interviewer",
              content: response.feedback.trim(),
            });
          }

          if (response.questionText?.trim()) {
            next.push({
              role: "interviewer",
              content: response.questionText.trim(),
            });
          }

          return next;
        });

        if (response.done) {
          setLatestQuestionAudio(null);
          setState("ended");
          toast.success("Interview saved. Redirecting to report...");

          window.setTimeout(() => {
            if (response.reportId) {
              router.push(
                `/services/virtual-interviewer/database/${response.reportId}`,
              );
              return;
            }

            router.push("/services/virtual-interviewer/database");
          }, 900);
          return;
        }

        if (response.audioBase64 && response.audioMime) {
          setLatestQuestionAudio({
            audioBase64: response.audioBase64,
            audioMime: response.audioMime,
          });
          setState("speaking");
          await playInterviewAudio(response.audioBase64, response.audioMime);
        } else if (response.questionText?.trim()) {
          setLatestQuestionAudio(null);
        }

        setState("ready");
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to submit your answer. Please try again.",
        );
        setState("ready");
      } finally {
        setIsSubmitting(false);
      }
    },
    [interviewId, isSubmitting, router, state],
  );

  const sendMessage = useCallback(() => {
    const trimmedInput = inputText.trim();
    if (!trimmedInput || state !== "ready") {
      return;
    }

    setInputText("");
    void submitInterviewResponse({
      text: trimmedInput,
      userContent: trimmedInput,
    });
  }, [inputText, state, submitInterviewResponse]);

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
      }
    },
    [sendMessage],
  );

  const startRecording = useCallback(async () => {
    try {
      if (!micSupported) {
        const secure = window.isSecureContext === true;
        throw new Error(
          secure
            ? "Your browser does not allow microphone access. Try Chrome or Edge and check permissions."
            : "Microphone access requires a secure connection (https) or localhost.",
        );
      }

      if (state !== "ready" || isSubmitting) {
        return;
      }

      const stream = await getUserMediaCompat({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        stream.getTracks().forEach((track) => track.stop());
        setIsRecording(false);

        void submitInterviewResponse({
          audio: audioBlob,
          audioFilename: "response.webm",
          userContent: "[Voice response]",
        });
      };

      mediaRecorder.start();
      setIsRecording(true);
      setState("recording");
      toast.info("Recording...");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to access microphone.",
      );
    }
  }, [isSubmitting, micSupported, state, submitInterviewResponse]);

  const stopRecording = useCallback(() => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
      setState("listening");
    }
  }, []);

  const replayLatestAudio = useCallback(async () => {
    if (!latestQuestionAudio) {
      return;
    }

    if (state !== "ready" && state !== "ended") {
      return;
    }

    const nextState = state;
    setState("speaking");
    await playInterviewAudio(
      latestQuestionAudio.audioBase64,
      latestQuestionAudio.audioMime,
    );
    setState(nextState === "ended" ? "ended" : "ready");
  }, [latestQuestionAudio, state]);

  return {
    persona,
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
  };
}
