import { NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET() {
  try {
    const cookieStore = cookies()
    const sessionCookie = cookieStore.get("admin-session")

    return NextResponse.json({
      hasCookie: !!sessionCookie,
      cookieValue: sessionCookie?.value ? "Present" : "Missing",
      allCookies: cookieStore.getAll().map((c) => c.name),
    })
  } catch (error) {
    return NextResponse.json({ error: "Failed to read cookies" }, { status: 500 })
  }
}
