import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow the gate page, API routes, and static assets through
  if (
    pathname.startsWith("/gate") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Check for the access cookie
  const hasAccess = request.cookies.get("gate_access")?.value === "granted";

  if (!hasAccess) {
    return NextResponse.redirect(new URL("/gate", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
