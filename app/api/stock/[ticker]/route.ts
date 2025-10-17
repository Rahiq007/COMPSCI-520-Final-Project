import { type NextRequest, NextResponse } from "next/server"

// This would be replaced with actual API integrations in production
export async function GET(request: NextRequest, { params }: { params: { ticker: string } }) {
  const ticker = params.ticker.toUpperCase()

  try {
    // In production, this would call actual financial APIs
    // For now, we'll return mock data
    const mockData = {
      ticker,
      currentPrice: Math.random() * 200 + 50,
      change: (Math.random() - 0.5) * 10,
      changePercent: (Math.random() - 0.5) * 0.1,
      volume: Math.floor(Math.random() * 10000000),
      marketCap: Math.random() * 1000000000000,
      pe: Math.random() * 30 + 5,
      eps: Math.random() * 10,
      dividend: Math.random() * 5,
      beta: Math.random() * 2 + 0.5,
    }

    return NextResponse.json(mockData)
  } catch (error) {
    console.error("Error fetching stock data:", error)
    return NextResponse.json({ error: "Failed to fetch stock data" }, { status: 500 })
  }
}
