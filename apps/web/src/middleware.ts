import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/"];
const LOGIN_API_PATH = "/api/auth/login";

function isPublicPath(pathname: string): boolean {
  if (pathname === LOGIN_API_PATH) return true;
  return PUBLIC_PATHS.includes(pathname);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip Next.js internals and static assets via config.matcher

  const adminSession = request.cookies.get("admin_session")?.value;
  const sessionToken = process.env.ADMIN_SESSION_TOKEN;
  const isLoggedIn = Boolean(adminSession && sessionToken && adminSession === sessionToken);

  // Already logged in: visiting login page redirects to default dashboard
  if (pathname === "/" && isLoggedIn) {
    return NextResponse.redirect(new URL("/account", request.url));
  }

  // Public paths are always allowed
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // For all other routes, require admin session
  if (!isLoggedIn) {
    const loginUrl = new URL("/", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
