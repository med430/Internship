export function getEmailConfirmationRedirectUrl(origin?: string): string {
  const envUrl =
    process.env.NEXT_PUBLIC_SUPABASE_REDIRECT_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.NEXT_PUBLIC_VERCEL_URL
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
      : undefined) ||
    (process.env.NEXT_PUBLIC_HOST
      ? `http://${process.env.NEXT_PUBLIC_HOST}`
      : undefined);
  if (envUrl) {
    return envUrl;
  }

  if (origin) {
    return `${origin}/auth/callback`;
  }

  throw new Error(
    "NEXT_PUBLIC_SUPABASE_REDIRECT_URL is not configured. " +
      "Please set it in .env.local or provide the origin parameter.",
  );
}

export function getPasswordResetRedirectUrl(origin?: string): string {
  const envUrl =
    process.env.NEXT_PUBLIC_SUPABASE_PASSWORD_RESET_REDIRECT_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.NEXT_PUBLIC_VERCEL_URL
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
      : undefined) ||
    (process.env.NEXT_PUBLIC_HOST
      ? `http://${process.env.NEXT_PUBLIC_HOST}`
      : undefined);
  if (envUrl) {
    return envUrl;
  }

  if (origin) {
    return `${origin}/auth/callback?next=/reset-password`;
  }

  throw new Error(
    "NEXT_PUBLIC_SUPABASE_PASSWORD_RESET_REDIRECT_URL is not configured. " +
      "Please set it in .env.local or provide the origin parameter.",
  );
}

export function getOAuthRedirectUrl(origin?: string): string {
  const envUrl =
    process.env.NEXT_PUBLIC_SUPABASE_REDIRECT_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.NEXT_PUBLIC_VERCEL_URL
      ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
      : undefined) ||
    (process.env.NEXT_PUBLIC_HOST
      ? `http://${process.env.NEXT_PUBLIC_HOST}`
      : undefined);
  if (envUrl) {
    return envUrl;
  }

  if (origin) {
    return `${origin}/auth/callback`;
  }

  throw new Error(
    "NEXT_PUBLIC_SUPABASE_REDIRECT_URL is not configured. " +
      "Please set it in .env.local or provide the origin parameter.",
  );
}
