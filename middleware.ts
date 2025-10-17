import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for API routes and login page
  if (pathname.startsWith("/api/") || pathname === "/admin/login") {
    return NextResponse.next()
  }

  // Only run on admin routes
  if (
    pathname.startsWith("/admin") ||
    ["/monitor", "/testing", "/sources", "/settings", "/ai-insights"].includes(pathname)
  ) {
    const sessionCookie = request.cookies.get("admin-session")
    const loggedInCookie = request.cookies.get("admin-logged-in")

    console.log("Middleware checking admin route:", pathname)
    console.log("Session cookie exists:", !!sessionCookie)
    console.log("Logged-in cookie exists:", !!loggedInCookie)

    // If no session cookie, redirect to login
    if (!sessionCookie) {
      console.log("No session cookie, redirecting to login")
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }

    try {
      const session = JSON.parse(sessionCookie.value)
      const isExpired = Date.now() - session.loginTime > 24 * 60 * 60 * 1000

      console.log("Session check:", {
        isAuthenticated: session.isAuthenticated,
        isExpired,
        age: Date.now() - session.loginTime,
      })

      if (!session.isAuthenticated || isExpired) {
        console.log("Invalid or expired session, redirecting to login")
        return NextResponse.redirect(new URL("/admin/login", request.url))
      }

      console.log("Session valid, allowing access to:", pathname)
    } catch (error) {
      console.error("Error parsing session cookie:", error)
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/monitor", "/testing", "/sources", "/settings", "/ai-insights"],
}
