export function getClientApiBaseUrl(): string {
  if (typeof window === "undefined") {
    return process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  }

  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
}

export async function checkApiHealth(
  apiBaseUrl: string,
  timeoutMs: number = 5000,
): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    const response = await fetch(`${apiBaseUrl}/health`, {
      method: "GET",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    return false;
  }
}

export function textToFile(text: string, filename: string): File {
  const blob = new Blob([text], { type: "text/plain" });
  return new File([blob], filename, { type: "text/plain" });
}
