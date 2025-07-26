// import { type NextRequest, NextResponse } from "next/server";
// import { jwtVerify } from "jose";

// const JWT_SECRET = new TextEncoder().encode(
//   process.env.JWT_SECRET || "your-secret-key"
// );

// // Public routes that don't require authentication
// const publicRoutes = ["/", "/login", "/dashboard/suppliers"];

// // API routes that don't require authentication

// export async function middleware(request: NextRequest) {
//   const { pathname } = request.nextUrl;

//   // Allow public routes
//   if (publicRoutes.includes(pathname)) {
//     return NextResponse.next();
//   }

 
//   // Allow static files and Next.js internals
//   if (
//     pathname.startsWith("/_next/") ||
//     pathname.startsWith("/api/_next/") ||
//     pathname.includes(".") // Static files (images, css, js, etc.)
//   ) {
//     return NextResponse.next();
//   }

//   // Get session cookie
//   const sessionCookie = request.cookies.get("session");

//   if (!sessionCookie) {
//     // No session cookie, redirect to login
//     return NextResponse.redirect(new URL("/login", request.url));
//   }

//   try {
//     // Verify JWT token
//     const { payload } = await jwtVerify(sessionCookie.value, JWT_SECRET);

//     // Check if token is still valid (additional check)
//     const loginTime = payload.loginTime as number;
//     const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000;

//     if (loginTime < thirtyMinutesAgo) {
//       // Token is older than 30 minutes, redirect to login
//       const response = NextResponse.redirect(new URL("/login", request.url));
//       response.cookies.delete("session");
//       return response;
//     }

//     // Session is valid, allow access
//     return NextResponse.next();
//   } catch (error) {
//     // Invalid token, redirect to login
//     const response = NextResponse.redirect(new URL("/login", request.url));
//     response.cookies.delete("session");
//     return response;
//   }
// }

// export const config = {
//   matcher: [
//     /*
//      * Match all request paths except for the ones starting with:
//      * - api (API routes)
//      * - _next/static (static files)
//      * - _next/image (image optimization files)
//      * - favicon.ico (favicon file)
//      */
//     "/((?!_next/static|_next/image|favicon.ico).*)",
//   ],
// };




import { type NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key"
);

// Public routes that don't require authentication
const publicRoutes = ["/", "/login"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip all API routes - no authentication required
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Allow public routes
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // Allow static files and Next.js internals
  if (
    pathname.startsWith("/_next/") ||
    pathname.includes(".") // Static files (images, css, js, etc.)
  ) {
    return NextResponse.next();
  }

  // Get session cookie
  const sessionCookie = request.cookies.get("session");

  if (!sessionCookie) {
    // No session cookie, redirect to login
    return NextResponse.redirect(new URL("/login", request.url));
  }

  try {
    // Verify JWT token
    const { payload } = await jwtVerify(sessionCookie.value, JWT_SECRET);

    // Check if token is still valid (additional check)
    const loginTime = payload.loginTime as number;
    const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000;

    if (loginTime < thirtyMinutesAgo) {
      // Token is older than 30 minutes, redirect to login
      const response = NextResponse.redirect(new URL("/login", request.url));
      response.cookies.delete("session");
      return response;
    }

    // Session is valid, allow access
    return NextResponse.next();
  } catch (error) {
    // Invalid token, redirect to login
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete("session");
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};