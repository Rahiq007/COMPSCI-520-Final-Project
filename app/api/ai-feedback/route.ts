import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  try {
    const { ticker, rating, analysisType } = await request.json()

    if (!ticker || !rating || !analysisType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Update the most recent AI analysis with user feedback
    await sql`
      UPDATE ai_analysis 
      SET user_feedback = ${rating}
      WHERE ticker = ${ticker} 
        AND analysis_type = ${analysisType}
        AND created_at = (
          SELECT MAX(created_at) 
          FROM ai_analysis 
          WHERE ticker = ${ticker} AND analysis_type = ${analysisType}
        )
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Feedback submission error:", error)
    return NextResponse.json({ error: "Failed to submit feedback" }, { status: 500 })
  }
}
