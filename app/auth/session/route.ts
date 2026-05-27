import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { createClient } from "@/utils/supabase/server";

function decodeJwtUserId(token: string): string | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payloadPart = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = payloadPart + "=".repeat((4 - (payloadPart.length % 4)) % 4);
    const payload = JSON.parse(
      Buffer.from(padded, "base64").toString("utf8"),
    ) as { userId?: unknown; sub?: unknown };
    if (typeof payload.userId === "string" && payload.userId.trim()) return payload.userId;
    if (typeof payload.sub === "string" && payload.sub.trim()) return payload.sub;
    return null;
  } catch {
    return null;
  }
}

export async function GET() {
  const cookieStore = await cookies();
  const interviewToken = cookieStore.get("interview_token")?.value;

  if (interviewToken) {
    return NextResponse.json(
      {
        accessToken: interviewToken,
        userId: decodeJwtUserId(interviewToken),
      },
      {
        headers: { "Cache-Control": "no-store" },
      },
    );
  }

  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json(
      { error: "Authentication required" },
      {
        status: 401,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }

  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError || !session?.access_token) {
    return NextResponse.json(
      { error: "Authentication required" },
      {
        status: 401,
        headers: { "Cache-Control": "no-store" },
      },
    );
  }

  return NextResponse.json(
    {
      accessToken: session.access_token,
      userId: user.id,
    },
    {
      headers: { "Cache-Control": "no-store" },
    },
  );
}
