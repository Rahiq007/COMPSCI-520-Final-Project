import { NextResponse } from "next/server"
import { AdminAuth } from "@/lib/auth/admin-auth"

export async function GET() {
  try {
    const isAdmin = await AdminAuth.isAdmin()
    return NextResponse.json({ isAdmin })
  } catch (error) {
    console.error("Error checking admin status:", error)
    return NextResponse.json({ isAdmin: false })
  }
}
