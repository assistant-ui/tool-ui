import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware to block sandbox routes in production.
 * Sandbox pages are development-only tools for tuning weather effects, etc.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Block /sandbox/* routes in production
  if (
    process.env.NODE_ENV === "production" &&
    pathname.startsWith("/sandbox")
  ) {
    return NextResponse.rewrite(new URL("/404", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/sandbox/:path*",
};
