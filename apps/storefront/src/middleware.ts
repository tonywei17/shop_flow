import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { decodeSignedSession, verifySessionPayload } from "@enterprise/auth";

// Routes that require authentication
const protectedRoutes = ["/products", "/cart", "/checkout", "/account"];

// Routes that should redirect to home if already authenticated
const authRoutes = ["/login"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get("storefront_session");
  const sessionSecret = process.env.STOREFRONT_SESSION_SECRET;

  let isAuthenticated = false;

  if (sessionCookie?.value && sessionSecret) {
    const decoded = decodeSignedSession(sessionCookie.value);
    if (decoded && await verifySessionPayload(decoded, sessionSecret)) {
      isAuthenticated = true;
    }
  }

  // Check if trying to access protected route without auth
  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check if trying to access auth route while authenticated
  const isAuthRoute = authRoutes.some((route) => pathname === route);

  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
