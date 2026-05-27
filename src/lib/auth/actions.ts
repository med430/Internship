"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { resolveRequestOrigin } from "./internal/form-origin";
import { validatePasswordPolicy } from "./internal/password-rules";
import {
  getEmailConfirmationRedirectUrl,
  getPasswordResetRedirectUrl,
  getOAuthRedirectUrl,
} from "./redirect-config";

export type AuthResult = {
  success: boolean;
  error?: string;
};

async function getOriginFromRequest(): Promise<string | undefined> {
  const headerList = await headers();
  return resolveRequestOrigin(headerList);
}

async function signInWithOAuthProvider(
  provider: "google" | "linkedin_oidc",
  scopes?: string,
): Promise<{ url: string | null; error?: string }> {
  const supabase = await createClient();
  const redirectUrl = getOAuthRedirectUrl(await getOriginFromRequest());

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: redirectUrl,
      ...(scopes ? { scopes } : {}),
    },
  });

  if (error) {
    return { url: null, error: error.message };
  }

  return { url: data.url };
}

export async function signUp(formData: FormData): Promise<AuthResult> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  const name = formData.get("name") as string;
  const lastname = formData.get("lastname") as string;
  const username = formData.get("username") as string;
  const role = (formData.get("role") as string) || "STUDENT";

  if (!email || !password || !confirmPassword || !name || !lastname || !username) {
    return { success: false, error: "All fields are required" };
  }

  if (!["STUDENT", "RECRUITER"].includes(role)) {
    return { success: false, error: "Invalid role selected" };
  }

  if (password !== confirmPassword) {
    return { success: false, error: "Passwords do not match" };
  }

  const passwordPolicyError = validatePasswordPolicy(password);
  if (passwordPolicyError) {
    return { success: false, error: passwordPolicyError };
  }

  const userMetadata: Record<string, string> = { role, name, lastname, username };
  if (role === "RECRUITER") {
    const company = formData.get("company") as string;
    if (!company?.trim()) {
      return { success: false, error: "Company name is required for recruiters" };
    }
    userMetadata.company = company.trim();
    const companyDescription = formData.get("companyDescription") as string;
    if (companyDescription?.trim()) userMetadata.companyDescription = companyDescription.trim();
    const website = formData.get("website") as string;
    if (website?.trim()) userMetadata.website = website.trim();
  }

  const supabase = await createClient();
  const redirectUrl = getEmailConfirmationRedirectUrl(
    await getOriginFromRequest(),
  );

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: redirectUrl,
      data: userMetadata,
    },
  });

  const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  if (error) {
    if (
      error.message.toLowerCase().includes("already registered") ||
      error.message.toLowerCase().includes("user already exists")
    ) {
      const { error: resendError } = await supabase.auth.resend({
        type: "signup",
        email,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      if (resendError) {
        return {
          success: false,
          error:
            "This email is already registered. Please check your email for a verification link or try logging in.",
        };
      }

      try {
        const retryEndpoint =
          role === "RECRUITER"
            ? `${apiBaseUrl}/auth/register/recruiter`
            : `${apiBaseUrl}/auth/register/student`;

        const retryBody =
          role === "RECRUITER"
            ? {
                email,
                password,
                name,
                lastname,
                username,
                company: (formData.get("company") as string) || "",
                companyDescription: (formData.get("companyDescription") as string) || "",
                website: (formData.get("website") as string) || "",
              }
            : { email, password, name, lastname, username };

        const backendResponse = await fetch(retryEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(retryBody),
          cache: "no-store",
        });

        if (!backendResponse.ok && backendResponse.status !== 409) {
          const text = await backendResponse.text().catch(() => "");
          return {
            success: false,
            error: text || "Failed to register account on backend",
          };
        }
      } catch {
        return {
          success: false,
          error: "Unable to reach backend to complete registration",
        };
      }

      return { success: true };
    }

    return { success: false, error: error.message };
  }

  try {
    const endpoint =
      role === "RECRUITER"
        ? `${apiBaseUrl}/auth/register/recruiter`
        : `${apiBaseUrl}/auth/register/student`;

    const registrationBody =
      role === "RECRUITER"
        ? {
            email,
            password,
            name,
            lastname,
            username,
            company: (formData.get("company") as string) || "",
            companyDescription: (formData.get("companyDescription") as string) || "",
            website: (formData.get("website") as string) || "",
          }
        : { email, password, name, lastname, username };

    const backendResponse = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(registrationBody),
      cache: "no-store",
    });

    if (!backendResponse.ok && backendResponse.status !== 409) {
      const text = await backendResponse.text().catch(() => "");
      return {
        success: false,
        error: text || "Failed to register account on backend",
      };
    }
  } catch {
    return {
      success: false,
      error: "Unable to reach backend to complete registration",
    };
  }

  return { success: true };
}

export async function signIn(formData: FormData): Promise<AuthResult> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { success: false, error: "Email and password are required" };
  }

  const supabase = await createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  const role = (
    data.user?.app_metadata?.role ??
    data.user?.user_metadata?.role ??
    ""
  ).toUpperCase();

  if (role === "RECRUITER") {
    redirect("/recruiter/offers");
  }

  redirect("/services/dashboard");
}

export async function signInWithGoogle(): Promise<{
  url: string | null;
  error?: string;
}> {
  return signInWithOAuthProvider("google");
}

export async function signInWithLinkedIn(): Promise<{
  url: string | null;
  error?: string;
}> {
  return signInWithOAuthProvider("linkedin_oidc", "openid profile email");
}

export async function resetPassword(formData: FormData): Promise<AuthResult> {
  const email = formData.get("email") as string;

  if (!email) {
    return { success: false, error: "Email is required" };
  }

  const supabase = await createClient();
  const redirectUrl = getPasswordResetRedirectUrl(await getOriginFromRequest());

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectUrl,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function updatePassword(formData: FormData): Promise<AuthResult> {
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    return { success: false, error: "All fields are required" };
  }

  if (password !== confirmPassword) {
    return { success: false, error: "Passwords do not match" };
  }

  const passwordPolicyError = validatePasswordPolicy(password);
  if (passwordPolicyError) {
    return { success: false, error: passwordPolicyError };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  redirect("/services/dashboard");
}

export async function signOut(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}

export async function resendConfirmationEmail(
  email: string,
): Promise<AuthResult> {
  const supabase = await createClient();
  const redirectUrl = getEmailConfirmationRedirectUrl(
    await getOriginFromRequest(),
  );

  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo: redirectUrl,
    },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}
