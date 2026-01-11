import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decodeSignedSession, verifySessionPayload } from "@enterprise/auth";
import { isRouteEnabled, isApiRouteEnabled } from "@enterprise/config";

const PUBLIC_PATHS = ["/"];
const LOGIN_API_PATH = "/api/auth/login";

function isPublicPath(pathname: string): boolean {
  if (pathname === LOGIN_API_PATH) return true;
  return PUBLIC_PATHS.includes(pathname);
}

/**
 * Check if a route is allowed based on enabled modules.
 * Returns true if the route belongs to an enabled module.
 */
function isModuleRouteAllowed(pathname: string): boolean {
  // Always allow public paths, auth, and profile
  if (isPublicPath(pathname)) return true;
  if (pathname === "/profile") return true;

  // Check API routes
  if (pathname.startsWith("/api/")) {
    return isApiRouteEnabled(pathname);
  }

  // Check page routes
  return isRouteEnabled(pathname);
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip Next.js internals and static assets via config.matcher

  const adminSession = request.cookies.get("admin_session")?.value;
  const adminAccountId = request.cookies.get("admin_account_id")?.value;
  const sessionSecret = process.env.ADMIN_SESSION_SECRET;

  let isLoggedIn = false;

  if (adminSession && adminAccountId && sessionSecret) {
    const decoded = decodeSignedSession(adminSession);
    if (decoded && await verifySessionPayload(decoded, sessionSecret)) {
      try {
        const payload = JSON.parse(decoded.payload) as { admin_account_id?: string };
        isLoggedIn = payload.admin_account_id === adminAccountId;
      } catch {
        isLoggedIn = false;
      }
    }
  }

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

  // Check module access
  if (!isModuleRouteAllowed(pathname)) {
    // For API routes, return 404
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Module not enabled" },
        { status: 404 }
      );
    }
    // For page routes, redirect to home or show 404
    return NextResponse.redirect(new URL("/account", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files (images, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$|.*\\.ico$|.*\\.webp$).*)",
  ],
};
