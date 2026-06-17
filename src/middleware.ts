import { jwtDecrypt } from "jose";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const adminOnly = ["/loans/new", "/admin", "/reports"];
const publicPaths = ["/login", "/api/auth"];

async function getTokenPayload(req: NextRequest) {
  const cookieName = "__Secure-authjs.session-token";
  const cookie = req.cookies.get(cookieName)?.value;
  if (!cookie) return null;
  try {
    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!);
    const { payload } = await jwtDecrypt(cookie, secret);
    return payload;
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  if (publicPaths.some((p) => path.startsWith(p))) {
    return NextResponse.next();
  }

  const token = await getTokenPayload(req);

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
