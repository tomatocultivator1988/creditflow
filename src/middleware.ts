import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicPaths = ["/login", "/api/auth", "/_next", "/manifest.webmanifest", "/sw.js"];
const adminOnly = ["/capital", "/expenses", "/reports", "/admin"];

function getTokenCookie(req: NextRequest): string | undefined {
  return (
    req.cookies.get("__Secure-authjs.session-token")?.value ||
    req.cookies.get("authjs.session-token")?.value
  );
}

function decodeRole(token: string): string | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = JSON.parse(
      Buffer.from(parts[1], "base64url").toString("utf-8"),
    );
    return payload.role ?? null;
  } catch {
    return null;
  }
}

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  if (
    publicPaths.some((p) => path.startsWith(p)) ||
    path.match(/\.(png|ico|svg|webmanifest)$/) ||
    path.startsWith("/icon")
  ) {
    return NextResponse.next();
  }

  const token = getTokenCookie(req);

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const role = decodeRole(token);

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
