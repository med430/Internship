export type InterviewState =
  | "connecting"
  | "ready"
  | "listening"
  | "speaking"
  | "recording"
  | "ended";

export type InputMode = "text" | "voice";

export interface ChatMessage {
  role: string;
  content: string;
}
