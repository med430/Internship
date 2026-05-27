import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const updateSession = async (request: NextRequest) => {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(supabaseUrl!, supabaseKey!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Accept backend-issued JWT stored in cookie as an authentication signal
  // so pages protected by the middleware don't force a Supabase login when
  // the backend token is present (interview_token).
  const interviewToken = request.cookies.get("interview_token")?.value;

  const protectedRoutes = ["/services", "/profile", "/settings"];
  const authRoutes = ["/login", "/signup", "/forgot-password"];

  const isProtectedRoute = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route),
  );
  const isAuthRoute = authRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route),
  );

  if (isProtectedRoute && !user && !interviewToken) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirectTo", request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (user && isAuthRoute) {
    const hasEmailProvider = user.identities?.some(
      (identity) => identity.provider === "email",
    );
    const isEmailVerified = user.email_confirmed_at !== null;

    if (
      hasEmailProvider &&
      !isEmailVerified &&
      !request.nextUrl.pathname.startsWith("/auth")
    ) {
      return NextResponse.redirect(
        new URL("/login?message=verify-email", request.url),
      );
    }

    return NextResponse.redirect(new URL("/services/dashboard", request.url));
  }

  return supabaseResponse;
};
