import { type NextRequest, NextResponse } from "next/server"
import { groqClient } from "@/lib/ai/groq-client"

export async function POST(request: NextRequest) {
  try {
    const { ticker, news } = await request.json()

    if (!ticker || !news || news.length === 0) {
      return NextResponse.json({ error: "Ticker and news are required" }, { status: 400 })
    }

    // Generate news summary using Groq
    const summary = await groqClient.generateNewsSummary(ticker, news)

    return NextResponse.json({
      success: true,
      summary,
    })
  } catch (error: any) {
    console.error("News summary error:", error)

    return NextResponse.json(
      {
        error: "Failed to generate news summary",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    )
  }
}

