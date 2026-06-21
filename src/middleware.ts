import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicPaths = ["/login", "/api/auth", "/_next", "/manifest.webmanifest", "/sw.js"];

export function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  if (
    publicPaths.some((p) => path.startsWith(p)) ||
    path.match(/\.(png|ico|svg|webmanifest)$/) ||
    path.startsWith("/icon")
  ) {
    return NextResponse.next();
  }

  const hasCookie =
    req.cookies.get("__Secure-authjs.session-token")?.value ||
    req.cookies.get("authjs.session-token")?.value;

  if (!hasCookie) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.ico$|manifest\\.webmanifest|sw\\.js).*)",
  ],
};
