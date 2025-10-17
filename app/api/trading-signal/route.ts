import { type NextRequest, NextResponse } from "next/server"
import { groqClient } from "@/lib/ai/groq-client"

export async function POST(request: NextRequest) {
  try {
    const { stockData } = await request.json()

    if (!stockData) {
      return NextResponse.json({ error: "Stock data is required" }, { status: 400 })
    }

    // Generate trading signal using Groq
    const signal = await groqClient.generateTradingSignal(stockData)

    return NextResponse.json({
      success: true,
      signal,
    })
  } catch (error: any) {
    console.error("Trading signal error:", error)

    return NextResponse.json(
      {
        error: "Failed to generate trading signal",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    )
  }
}

