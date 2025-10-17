import { type NextRequest, NextResponse } from "next/server"
import { AdminAuth } from "@/lib/auth/admin-auth"

export async function POST(request: NextRequest) {
  try {
    console.log("Admin login API called")
    const body = await request.json()
    const { username, password } = body

    console.log("Login attempt received for:", { username: username?.slice(0, 3) + "..." })

    if (!username || !password) {
      console.log("Missing credentials")
      return NextResponse.json({ success: false, message: "Username and password are required" }, { status: 400 })
    }

    const isValid = await AdminAuth.authenticate(username, password)
    console.log("Authentication result:", isValid)

    if (isValid) {
      // Create session data
      const session = {
        isAuthenticated: true,
        userId: "admin",
        loginTime: Date.now(),
      }

      const sessionValue = JSON.stringify(session)
      console.log("Creating session with value:", sessionValue)

      const response = NextResponse.json({
        success: true,
        message: "Login successful",
        sessionData: session, // Include session data in response for debugging
      })

      // Set cookie with multiple approaches for better compatibility
      response.cookies.set("admin-session", sessionValue, {
        httpOnly: true,
        secure: false, // Set to false for development
        sameSite: "lax",
        maxAge: 24 * 60 * 60, // 24 hours
        path: "/",
      })

      // Also set a non-httpOnly cookie for client-side verification
      response.cookies.set("admin-logged-in", "true", {
        httpOnly: false,
        secure: false,
        sameSite: "lax",
        maxAge: 24 * 60 * 60,
        path: "/",
      })

      console.log("Login successful, session cookies set")
      console.log("Response headers:", Object.fromEntries(response.headers.entries()))

      return response
    } else {
      console.log("Invalid credentials")
      return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 })
    }
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ success: false, message: "Authentication failed" }, { status: 500 })
  }
}
