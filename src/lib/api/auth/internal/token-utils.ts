const TOKEN_EXPIRY_BUFFER_SECONDS = 60;

function decodeBase64Url(value: string): string | null {
  try {
    const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
    const padding = "=".repeat((4 - (normalized.length % 4)) % 4);
    return atob(normalized + padding);
  } catch {
    return null;
  }
}

export type AccessTokenInfo = {
  alg: string | null;
  exp: number | null;
};

export function inspectAccessToken(token: string): AccessTokenInfo {
  const [encodedHeader, encodedPayload] = token.split(".");
  if (!encodedHeader || !encodedPayload) {
    return { alg: null, exp: null };
  }

  const decodedHeader = decodeBase64Url(encodedHeader);
  const decodedPayload = decodeBase64Url(encodedPayload);

  if (!decodedHeader || !decodedPayload) {
    return { alg: null, exp: null };
  }

  try {
    const header = JSON.parse(decodedHeader) as { alg?: unknown };
    const payload = JSON.parse(decodedPayload) as { exp?: unknown };

    return {
      alg: typeof header.alg === "string" ? header.alg : null,
      exp: typeof payload.exp === "number" ? payload.exp : null,
    };
  } catch {
    return { alg: null, exp: null };
  }
}

export function isLegacyAlgorithm(alg: string | null): boolean {
  if (!alg) {
    return false;
  }

  return alg.toUpperCase().startsWith("HS") || alg.toLowerCase() === "none";
}

export function isExpiringSoon(exp: number | null): boolean {
  if (!exp) {
    return false;
  }

  const nowSeconds = Math.floor(Date.now() / 1000);
  return exp <= nowSeconds + TOKEN_EXPIRY_BUFFER_SECONDS;
}

export function isBackendCompatibleToken(token: string): boolean {
  const tokenInfo = inspectAccessToken(token);
  return !isLegacyAlgorithm(tokenInfo.alg);
}

export function pickPreferredToken(
  tokens: Array<string | null | undefined>,
): string | null {
  const availableTokens = tokens.filter(
    (token): token is string => typeof token === "string" && token.length > 0,
  );

  if (!availableTokens.length) {
    return null;
  }

  const compatibleToken = availableTokens.find((token) =>
    isBackendCompatibleToken(token),
  );

  return compatibleToken ?? availableTokens[0];
}
