import { type NextRequest, NextResponse } from "next/server"
import { groqClient } from "@/lib/ai/groq-client"

export async function POST(request: NextRequest) {
  try {
    const { ticker, prediction, volatility } = await request.json()

    if (!ticker || !prediction) {
      return NextResponse.json({ error: "Ticker and prediction data are required" }, { status: 400 })
    }

    // Generate predictive alert using Groq
    const alert = await groqClient.generatePredictiveAlert(ticker, prediction, volatility || 0.2)

    return NextResponse.json({
      success: true,
      alert,
    })
  } catch (error: any) {
    console.error("Predictive alert error:", error)

    return NextResponse.json(
      {
        error: "Failed to generate predictive alert",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    )
  }
}

