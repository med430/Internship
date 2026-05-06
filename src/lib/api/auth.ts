import { createClient } from "@/utils/supabase/client";
import { ERROR_MESSAGES } from "@/lib/errors/messages";
import { normalizeHeaders, debugAuth } from "./auth/internal/request-utils";
import { resolveServerSessionSnapshot } from "./auth/internal/session-snapshot";
import { resolveAccessTokenWithRetry } from "./auth/internal/session-resolver";
import { inspectAccessToken, isLegacyAlgorithm } from "./auth/internal/token-utils";

export async function getAccessToken(options?: {
  forceRefresh?: boolean;
}): Promise<string> {
  const accessToken = await resolveAccessTokenWithRetry(options);
  if (!accessToken) {
    throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
  }

  const tokenInfo = inspectAccessToken(accessToken);
  if (isLegacyAlgorithm(tokenInfo.alg)) {
    debugAuth(
      "Access token uses a legacy signing algorithm; backend may reject it if configured for JWKS-only verification.",
    );
  }

  return accessToken;
}

export async function getCurrentUserId(): Promise<string> {
  const supabase = createClient();
  const accessToken = await getAccessToken();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(accessToken);

  if (!error && user?.id) {
    return user.id;
  }

  const refreshedAccessToken = await getAccessToken({ forceRefresh: true });
  const {
    data: { user: refreshedUser },
    error: refreshedUserError,
  } = await supabase.auth.getUser(refreshedAccessToken);

  if (!refreshedUserError && refreshedUser?.id) {
    return refreshedUser.id;
  }

  const serverSnapshot = await resolveServerSessionSnapshot();
  if (serverSnapshot.userId) {
    return serverSnapshot.userId;
  }

  throw new Error(ERROR_MESSAGES.UNAUTHORIZED);
}

export async function buildAuthHeaders(
  initialHeaders: Record<string, string> = {},
): Promise<Record<string, string>> {
  const accessToken = await getAccessToken();
  return {
    ...initialHeaders,
    Authorization: `Bearer ${accessToken}`,
  };
}

export async function fetchWithAuth(
  input: RequestInfo | URL,
  init: RequestInit = {},
): Promise<Response> {
  const baseHeaders = normalizeHeaders(init.headers);
  const headers = await buildAuthHeaders(baseHeaders);

  const response = await fetch(input, {
    ...init,
    headers,
  });

  if (response.status !== 401) {
    return response;
  }

  debugAuth("Received 401 from backend; attempting forced token refresh.");

  try {
    const refreshedToken = await getAccessToken({ forceRefresh: true });
    let retriedResponse = await fetch(input, {
      ...init,
      headers: {
        ...baseHeaders,
        Authorization: `Bearer ${refreshedToken}`,
      },
    });

    if (retriedResponse.status === 401) {
      debugAuth("Retry after forced refresh also returned 401.");

      const serverSnapshot = await resolveServerSessionSnapshot();
      if (
        serverSnapshot.accessToken &&
        serverSnapshot.accessToken !== refreshedToken
      ) {
        retriedResponse = await fetch(input, {
          ...init,
          headers: {
            ...baseHeaders,
            Authorization: `Bearer ${serverSnapshot.accessToken}`,
          },
        });

        if (retriedResponse.status === 401) {
          debugAuth(
            "Second retry using server session token also returned 401.",
          );
        }
      }
    }

    return retriedResponse;
  } catch {
    return response;
  }
}
