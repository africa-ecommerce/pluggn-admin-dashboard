import { type NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "JWT_SECRET"
);

// Public routes that don't require authentication
const publicRoutes = ["/", "/login"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip all API routes
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Allow public routes
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Allow static files and Next.js internals
  if (pathname.startsWith("/_next/") || pathname.includes(".")) {
    return NextResponse.next();
  }

  // Get session cookie
  const sessionCookie = request.cookies.get("session");

  if (!sessionCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    // Verify JWT token (will throw if expired)
    await jwtVerify(sessionCookie.value, JWT_SECRET);
    return NextResponse.next();
  } catch (error) {
    // Invalid or expired token
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("session");
    return response;
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
