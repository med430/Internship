"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export type RecruiterAuthResult = {
  success: boolean;
  error?: string;
};

function getBackendBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
}

export async function signUpRecruiter(formData: FormData): Promise<RecruiterAuthResult> {
  const email = formData.get("email") as string | null;
  const password = formData.get("password") as string | null;
  const name = formData.get("name") as string | null;
  const lastname = formData.get("lastname") as string | null;
  const username = formData.get("username") as string | null;
  const company = formData.get("company") as string | null;
  const companyDescription = formData.get("companyDescription") as string | null;
  const website = formData.get("website") as string | null;

  if (!email || !password || !name || !username) {
    return { success: false, error: "Missing required fields" };
  }

  const supabase = await createClient();

  // 1. Create Supabase account with recruiter role in metadata
  const { error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role: "RECRUITER",
        name,
        lastname: lastname ?? "",
        username,
      },
    },
  });

  if (signUpError) {
    return { success: false, error: signUpError.message };
  }

  // 2. Create NeonDB user + RecruiterProfile (public endpoint, no auth required)
  const resp = await fetch(`${getBackendBaseUrl()}/auth/register/recruiter`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email,
      password,
      name,
      lastname: lastname ?? "",
      username,
      company: company ?? "",
      companyDescription: companyDescription ?? "",
      ...(website ? { website } : {}),
    }),
    cache: "no-store",
  });

  if (!resp.ok && resp.status !== 409) {
    const text = await resp.text().catch(() => "Registration failed");
    return { success: false, error: text };
  }

  // 3. Auto sign-in after signup
  const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
  if (signInError) {
    return { success: false, error: "Account created — please confirm your email then sign in." };
  }

  redirect("/recruiter/offers");
}

export async function signInRecruiter(formData: FormData): Promise<RecruiterAuthResult> {
  const email = formData.get("email") as string | null;
  const password = formData.get("password") as string | null;

  if (!email || !password) {
    return { success: false, error: "Missing fields" };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { success: false, error: error.message };
  }

  redirect("/recruiter/offers");
}

export async function signOutRecruiter(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/recruiter/login");
}
