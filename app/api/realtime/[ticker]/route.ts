import { type NextRequest, NextResponse } from "next/server"
import { MultiSourceStockClient } from "@/lib/api/multi-source-client"

export async function GET(request: NextRequest, { params }: { params: { ticker: string } }) {
  try {
    const ticker = params.ticker.toUpperCase()
    const stockClient = new MultiSourceStockClient()

    const quote = await stockClient.getQuote(ticker)

    return NextResponse.json({
      ticker,
      price: quote.currentPrice,
      change: quote.change,
      changePercent: quote.changePercent,
      volume: quote.volume,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error fetching real-time price:", error)
    return NextResponse.json({ error: "Failed to fetch real-time price" }, { status: 500 })
  }
}
