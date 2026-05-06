export type ServerSessionSnapshot = {
  accessToken: string | null;
  userId: string | null;
};

export async function resolveServerSessionSnapshot(): Promise<ServerSessionSnapshot> {
  if (typeof window === "undefined") {
    return { accessToken: null, userId: null };
  }

  try {
    const response = await fetch("/auth/session", {
      method: "GET",
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) {
      return { accessToken: null, userId: null };
    }

    const payload = (await response.json()) as Partial<{
      accessToken: unknown;
      userId: unknown;
    }>;

    return {
      accessToken:
        typeof payload.accessToken === "string" && payload.accessToken
          ? payload.accessToken
          : null,
      userId:
        typeof payload.userId === "string" && payload.userId
          ? payload.userId
          : null,
    };
  } catch {
    return { accessToken: null, userId: null };
  }
}
