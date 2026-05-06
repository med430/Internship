import { ERROR_MESSAGES } from "@/lib/errors/messages";

type ApiErrorPayload = {
  detail?: unknown;
  error?: unknown;
  message?: unknown;
};

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function fallbackForStatus(status: number, fallback: string): string {
  if (status === 400) return ERROR_MESSAGES.VALIDATION_ERROR;
  if (status === 401) return ERROR_MESSAGES.SESSION_EXPIRED;
  if (status === 403) return ERROR_MESSAGES.FORBIDDEN;
  if (status === 404) return ERROR_MESSAGES.NOT_FOUND;
  if (status === 429) return ERROR_MESSAGES.RATE_LIMIT_EXCEEDED;
  if (status === 503) return ERROR_MESSAGES.SERVICE_UNAVAILABLE;
  if (status >= 500) return ERROR_MESSAGES.INTERNAL_ERROR;
  return fallback;
}

export async function getApiErrorMessage(
  response: Response,
  fallback: string = ERROR_MESSAGES.UNKNOWN_ERROR,
): Promise<string> {
  const statusFallback = fallbackForStatus(response.status, fallback);

  try {
    const payload = (await response.clone().json()) as ApiErrorPayload;
    const backendMessage =
      asString(payload.detail) ||
      asString(payload.error) ||
      asString(payload.message);

    if (backendMessage) {
      return backendMessage === "Authentication required"
        ? ERROR_MESSAGES.SESSION_EXPIRED
        : backendMessage;
    }
  } catch {
    // Ignore JSON parsing errors and fall back to text/status mapping.
  }

  try {
    const text = (await response.clone().text()).trim();
    if (text) {
      return text;
    }
  } catch {
    // Ignore text parsing errors and return fallback.
  }

  return statusFallback;
}
