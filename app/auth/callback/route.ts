import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import { getProfileWithAccessToken } from "@/lib/profile/backend";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  const forwardedHost =
    request.headers.get("x-forwarded-host") || request.headers.get("host");
  const forwardedProto =
    request.headers.get("x-forwarded-proto") ||
    request.headers.get("x-forwarded-protocol") ||
    request.headers.get("x-forwarded-scheme");
  const origin = forwardedHost
    ? `${forwardedProto ?? "https"}://${forwardedHost}`
    : new URL(request.url).origin;
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/services/dashboard";
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  if (error) {
    console.error("OAuth provider error:", error, errorDescription);
    return NextResponse.redirect(
      `${origin}/auth/auth-error?error=${encodeURIComponent(
        error,
      )}&description=${encodeURIComponent(
        errorDescription || "Authentication failed",
      )}`,
    );
  }

  if (code) {
    const supabase = await createClient();
    const { error: exchangeError } =
      await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error("Code exchange error:", exchangeError);
      return NextResponse.redirect(
        `${origin}/auth/auth-error?error=${encodeURIComponent(
          exchangeError.message,
        )}`,
      );
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const profile = session?.access_token
        ? await getProfileWithAccessToken(session.access_token)
        : null;

      if (profile?.is_deactivated) {
        return NextResponse.redirect(
          `${origin}/complete-profile?reactivate=true`,
        );
      }

      if (!profile) {
        return NextResponse.redirect(`${origin}/complete-profile`);
      }

      if (!profile.profile_completed) {
        return NextResponse.redirect(`${origin}/complete-profile`);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/auth-error`);
}
