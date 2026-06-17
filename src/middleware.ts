import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const adminOnly = ["/loans/new", "/admin", "/reports"];
const publicPaths = ["/login", "/api/auth"];

function getTokenPayload(req: NextRequest): Record<string, unknown> | null {
  const cookieName = "authjs.session-token";
  const secureCookieName = "__Secure-authjs.session-token";
  const cookie = req.cookies.get(secureCookieName)?.value || req.cookies.get(cookieName)?.value;
  if (!cookie) return null;
  try {
    const parts = cookie.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
    if (payload.exp && payload.exp * 1000 < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  if (publicPaths.some((p) => path.startsWith(p))) {
    return NextResponse.next();
  }

  const token = getTokenPayload(req);

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const role = token.role as string | undefined;
  if (adminOnly.some((p) => path.startsWith(p)) && role !== "ADMIN") {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.ico$|manifest\\.webmanifest|sw\\.js).*)",
  ],
};
