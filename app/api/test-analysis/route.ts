import { type NextRequest, NextResponse } from "next/server"
import { MultiSourceStockClient } from "@/lib/api/multi-source-client"

export async function GET(request: NextRequest) {
  const testResults = []
  const stockClient = new MultiSourceStockClient()

  // Test stocks with different characteristics
  const testStocks = [
    { ticker: "AAPL", name: "Apple Inc.", type: "Large Cap Tech" },
    { ticker: "TSLA", name: "Tesla Inc.", type: "High Volatility" },
    { ticker: "SPY", name: "S&P 500 ETF", type: "Index Fund" },
    { ticker: "MSFT", name: "Microsoft Corp.", type: "Blue Chip" },
    { ticker: "NVDA", name: "NVIDIA Corp.", type: "Growth Stock" },
  ]

  for (const stock of testStocks) {
    try {
      console.log(`Testing ${stock.ticker}...`)

      // Test basic quote functionality
      const startTime = Date.now()
      const quote = await stockClient.getQuote(stock.ticker)
      const responseTime = Date.now() - startTime

      testResults.push({
        ticker: stock.ticker,
        name: stock.name,
        type: stock.type,
        status: "success",
        currentPrice: quote.currentPrice,
        responseTime: `${responseTime}ms`,
        dataSource: "multi-source",
        timestamp: new Date().toISOString(),
      })
    } catch (error: any) {
      console.error(`Error testing ${stock.ticker}:`, error)
      testResults.push({
        ticker: stock.ticker,
        name: stock.name,
        type: stock.type,
        status: "error",
        error: error.message,
        timestamp: new Date().toISOString(),
      })
    }
  }

  return NextResponse.json({
    testSummary: {
      total: testStocks.length,
      successful: testResults.filter((r) => r.status === "success").length,
      failed: testResults.filter((r) => r.status === "error").length,
      timestamp: new Date().toISOString(),
    },
    results: testResults,
  })
}
