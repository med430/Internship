"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type RecruiterAuthResult = {
  success: boolean;
  error?: string;
};

function getBackendBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
}

export async function signInRecruiter(
  formData: FormData,
): Promise<RecruiterAuthResult> {
  const email = formData.get("email") as string | null;
  const password = formData.get("password") as string | null;

  if (!email || !password) return { success: false, error: "Missing fields" };

  const resp = await fetch(`${getBackendBaseUrl()}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => "Login failed");
    return { success: false, error: text };
  }

  const payload = (await resp.json()) as { token?: string };
  if (!payload.token) return { success: false, error: "No token returned" };

  const cookieStore = await cookies();
  cookieStore.set("recruiter_token", payload.token, {
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  // Redirect to recruiter offers dashboard
  redirect("/recruiter/offers");
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

  if (!email || !password || !name || !username) return { success: false, error: "Missing fields" };

  const resp = await fetch(`${getBackendBaseUrl()}/auth/register/recruiter`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, name, lastname, username, company, companyDescription, website }),
    cache: "no-store",
  });

  if (!resp.ok) {
    const text = await resp.text().catch(() => "Registration failed");
    return { success: false, error: text };
  }

  // After successful register, sign in
  const signInForm = new FormData();
  signInForm.append('email', email);
  signInForm.append('password', password);
  return signInRecruiter(signInForm as FormData) as Promise<RecruiterAuthResult>;
}

export async function signOutRecruiter(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set("recruiter_token", "", { path: "/", expires: new Date(0) });
  redirect("/recruiter/login");
}
