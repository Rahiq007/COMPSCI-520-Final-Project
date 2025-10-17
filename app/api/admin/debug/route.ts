import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET() {
  try {
    const cookieStore = cookies()
    const allCookies = cookieStore.getAll()
    const sessionCookie = cookieStore.get("admin-session")
    const loggedInCookie = cookieStore.get("admin-logged-in")

    let sessionData = null
    if (sessionCookie) {
      try {
        sessionData = JSON.parse(sessionCookie.value)
      } catch (e) {
        sessionData = { error: "Failed to parse session" }
      }
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      cookies: {
        total: allCookies.length,
        names: allCookies.map((c) => c.name),
        sessionExists: !!sessionCookie,
        loggedInExists: !!loggedInCookie,
      },
      sessionData,
      environment: {
        nodeEnv: process.env.NODE_ENV,
      },
    })
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to read cookies",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
