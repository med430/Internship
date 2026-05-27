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

  const protectedRoutes = ["/services", "/profile", "/settings"];
  const recruiterRoutes = ["/recruiter/offers", "/recruiter/applications"];
  const authRoutes = ["/login", "/signup", "/forgot-password"];
  const adminRoutes = ["/services/admin"];

  const isProtectedRoute = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route),
  );
  const isRecruiterRoute = recruiterRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route),
  );
  const isAuthRoute = authRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route),
  );
  const isAdminRoute = adminRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route),
  );

  const userRole = (
    (user?.app_metadata?.role ?? user?.user_metadata?.role) as string | undefined ?? ""
  ).toUpperCase();
  const isRecruiter = userRole === "RECRUITER";

  if (isProtectedRoute && !user) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirectTo", request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Recruiter logged in as student → send to recruiter area
  if (isProtectedRoute && user && isRecruiter) {
    return NextResponse.redirect(new URL("/recruiter/offers", request.url));
  }

  if (isRecruiterRoute && !user) {
    return NextResponse.redirect(new URL("/recruiter/login", request.url));
  }

  if (isAdminRoute && user?.app_metadata?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/services/dashboard", request.url));
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

    const dest = isRecruiter ? "/recruiter/offers" : "/services/dashboard";
    return NextResponse.redirect(new URL(dest, request.url));
  }

  return supabaseResponse;
};
