export const APP_NAME = "OnBoard";
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export const API_WS_BASE_URL = (
  (process.env.NEXT_PUBLIC_API_URL_WS && process.env.NEXT_PUBLIC_API_URL_WS) ||
  API_BASE_URL.replace(
    /^https?/,
    API_BASE_URL.startsWith("https") ? "wss" : "ws",
  )
).replace(/\/+$/, "");

export const API_WS_ENV_DEFINED = Boolean(process.env.NEXT_PUBLIC_API_URL_WS);

export const VIRTUAL_INTERVIEWER_WS_AGENT_PATH =
  "/virtual-interviewer/ws/agent";
export const VIRTUAL_INTERVIEWER_WS_VOICE_PATH =
  "/virtual-interviewer/ws/voice";

export const INPUT_MAX_LENGTHS = {
  DEFAULT: 255,
  SHORT: 100,
  EMAIL: 254,
  URL: 2048,
  PASSWORD: 128,
  SEARCH: 200,
  TEXTAREA_DEFAULT: 5000,
  TEXTAREA_LONG: 10000,
  TEXTAREA_EXTENDED: 50000,
} as const;
