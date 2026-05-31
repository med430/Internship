import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  console.log("[MW] →", request.method, request.nextUrl.pathname);
  return NextResponse.next();
}

export const config = {
  matcher: "/(.*)",
};
