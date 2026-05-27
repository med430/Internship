import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

// Routes accessible only to authenticated students (+ admins)
const STUDENT_ROUTES = ["/services", "/profile"];

// All recruiter routes except login/signup — require RECRUITER role
const RECRUITER_PROTECTED_ROUTES = ["/recruiter"];

// Auth pages for students — redirect authenticated users away
const STUDENT_AUTH_ROUTES = ["/login", "/signup", "/forgot-password", "/reset-password"];

// Auth pages for recruiters — redirect authenticated users away
const RECRUITER_AUTH_ROUTES = ["/recruiter/login", "/recruiter/signup"];

function getRole(user: { app_metadata?: Record<string, unknown>; user_metadata?: Record<string, unknown> } | null): string {
  if (!user) return "";
  return (
    (user.app_metadata?.role ?? user.user_metadata?.role ?? "") as string
  ).toUpperCase();
}

export const updateSession = async (request: NextRequest) => {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const role = getRole(user);
  const isAuthenticated = !!user;
  const isRecruiter = role === "RECRUITER";
  const isStudent = role === "STUDENT";
  const isAdmin = role === "ADMIN";

  const redirect = (dest: string) =>
    NextResponse.redirect(new URL(dest, request.url));

  // ── 1. Student-only area (/services, /profile) ───────────────────────────
  if (STUDENT_ROUTES.some((r) => path.startsWith(r))) {
    if (!isAuthenticated) {
      const url = new URL("/login", request.url);
      url.searchParams.set("redirectTo", path);
      return NextResponse.redirect(url);
    }
    // Recruiter landed on student area → send to recruiter dashboard
    if (isRecruiter) return redirect("/recruiter/offers");
    // Admin gating for /services/admin is handled in the layout (needs NeonDB call)
  }

  // ── 2. Recruiter-only area (exclude auth pages handled in rule 4) ────────
  const isRecruiterAuthPage = RECRUITER_AUTH_ROUTES.some((r) => path.startsWith(r));
  if (RECRUITER_PROTECTED_ROUTES.some((r) => path.startsWith(r)) && !isRecruiterAuthPage) {
    if (!isAuthenticated) return redirect("/recruiter/login");
    // Student or admin trying to use recruiter area → send back to their space
    if (isStudent || isAdmin) return redirect("/services/dashboard");
  }

  // ── 3. Student auth pages (/login, /signup, …) ──────────────────────────
  if (STUDENT_AUTH_ROUTES.some((r) => path.startsWith(r))) {
    if (isAuthenticated) {
      // Unverified email exception
      const hasEmailProvider = user?.identities?.some((i) => i.provider === "email");
      const isEmailVerified = !!user?.email_confirmed_at;
      if (hasEmailProvider && !isEmailVerified) return supabaseResponse;

      return redirect(isRecruiter ? "/recruiter/offers" : "/services/dashboard");
    }
  }

  // ── 4. Recruiter auth pages (/recruiter/login, /recruiter/signup) ────────
  if (RECRUITER_AUTH_ROUTES.some((r) => path.startsWith(r))) {
    if (isAuthenticated) {
      return redirect(isRecruiter ? "/recruiter/offers" : "/services/dashboard");
    }
  }

  return supabaseResponse;
};
