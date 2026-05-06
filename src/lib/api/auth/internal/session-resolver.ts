import { createClient } from "@/utils/supabase/client";
import {
  inspectAccessToken,
  isExpiringSoon,
  isLegacyAlgorithm,
  pickPreferredToken,
} from "./token-utils";
import { resolveServerSessionSnapshot } from "./session-snapshot";

const SESSION_RETRY_ATTEMPTS = 3;
const SESSION_RETRY_DELAY_MS = 200;

async function sleep(ms: number): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

export async function refreshAccessToken(): Promise<string | null> {
  const supabase = createClient();
  const { data, error } = await supabase.auth.refreshSession();
  if (error || !data.session?.access_token) {
    return null;
  }

  return data.session.access_token;
}

export async function resolveAccessTokenWithRetry(options?: {
  forceRefresh?: boolean;
}): Promise<string | null> {
  if (options?.forceRefresh) {
    const [forcedServerSnapshot, forcedToken] = await Promise.all([
      resolveServerSessionSnapshot(),
      refreshAccessToken(),
    ]);

    const preferredForcedToken = pickPreferredToken([
      forcedServerSnapshot.accessToken,
      forcedToken,
    ]);

    if (preferredForcedToken) {
      return preferredForcedToken;
    }
  }

  const supabase = createClient();

  for (let attempt = 0; attempt < SESSION_RETRY_ATTEMPTS; attempt += 1) {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.access_token) {
      const tokenInfo = inspectAccessToken(session.access_token);
      if (isExpiringSoon(tokenInfo.exp) || isLegacyAlgorithm(tokenInfo.alg)) {
        const [refreshedToken, serverSnapshot] = await Promise.all([
          refreshAccessToken(),
          resolveServerSessionSnapshot(),
        ]);

        const preferredToken = pickPreferredToken([
          refreshedToken,
          serverSnapshot.accessToken,
          session.access_token,
        ]);

        if (preferredToken) {
          return preferredToken;
        }
      }

      return session.access_token;
    }

    if (attempt < SESSION_RETRY_ATTEMPTS - 1) {
      await sleep(SESSION_RETRY_DELAY_MS);
    }
  }

  const [refreshedToken, serverSnapshot] = await Promise.all([
    refreshAccessToken(),
    resolveServerSessionSnapshot(),
  ]);

  return pickPreferredToken([refreshedToken, serverSnapshot.accessToken]);
}
