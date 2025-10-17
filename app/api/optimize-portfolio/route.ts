import { type NextRequest, NextResponse } from "next/server"
import { groqClient } from "@/lib/ai/groq-client"

export async function POST(request: NextRequest) {
  try {
    const { portfolio } = await request.json()

    if (!portfolio || portfolio.length === 0) {
      return NextResponse.json({ error: "Portfolio data is required" }, { status: 400 })
    }

    // Generate portfolio optimization using Groq
    const optimization = await groqClient.generatePortfolioOptimization(portfolio)

    return NextResponse.json({
      success: true,
      optimization,
    })
  } catch (error: any) {
    console.error("Portfolio optimization error:", error)

    return NextResponse.json(
      {
        error: "Failed to optimize portfolio",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    )
  }
}

