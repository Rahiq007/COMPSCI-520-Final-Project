import { type NextRequest, NextResponse } from "next/server"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number(searchParams.get("limit")) || 50

    // Fetch AI insights with only the most recent analysis per ticker
    const insights = await sql`
      WITH latest_ai_analysis AS (
        SELECT 
          id, 
          ticker, 
          analysis_type, 
          ai_recommendation, 
          confidence_score, 
          created_at, 
          model_used, 
          response_time_ms, 
          user_feedback,
          ROW_NUMBER() OVER (PARTITION BY ticker ORDER BY created_at DESC) as rn
        FROM ai_analysis
        WHERE ai_recommendation IS NOT NULL
      )
      SELECT 
        id, 
        ticker, 
        analysis_type, 
        ai_recommendation, 
        confidence_score, 
        created_at, 
        model_used, 
        response_time_ms, 
        user_feedback
      FROM latest_ai_analysis
      WHERE rn = 1
      ORDER BY created_at DESC 
      LIMIT ${limit}
    `

    return NextResponse.json({
      insights,
      total: insights.length,
    })
  } catch (error) {
    console.error("Error fetching AI insights:", error)

    // Fallback to simpler query if the complex one fails
    try {
      const insights = await sql`
        WITH latest_ai_analysis AS (
          SELECT 
            id, ticker, analysis_type, ai_recommendation, 
            confidence_score, created_at, model_used, 
            response_time_ms, user_feedback,
            ROW_NUMBER() OVER (PARTITION BY ticker ORDER BY created_at DESC) as rn
          FROM ai_analysis 
          WHERE ai_recommendation IS NOT NULL
        )
        SELECT 
          id, ticker, analysis_type, ai_recommendation, 
          confidence_score, created_at, model_used, 
          response_time_ms, user_feedback
        FROM latest_ai_analysis
        WHERE rn = 1
        ORDER BY created_at DESC 
        LIMIT 50
      `

      return NextResponse.json({
        insights,
        total: insights.length,
      })
    } catch (fallbackError) {
      console.error("Fallback query also failed:", fallbackError)
      return NextResponse.json(
        {
          insights: [],
          error: "Failed to fetch AI insights",
        },
        { status: 200 },
      ) // Return 200 to prevent UI errors
    }
  }
}
