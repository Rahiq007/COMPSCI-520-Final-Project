import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const errorData = await request.json()

    // Store error in database for analysis
    await sql`
      INSERT INTO error_logs (
        error_type, message, details, timestamp, request_id, 
        user_message, retryable, stack_trace
      ) VALUES (
        ${errorData.type},
        ${errorData.message},
        ${JSON.stringify(errorData.details)},
        ${errorData.timestamp},
        ${errorData.requestId},
        ${errorData.userMessage},
        ${errorData.retryable},
        ${errorData.stack}
      )
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to log error:", error)
    return NextResponse.json({ success: false }, { status: 500 })
  }
}
