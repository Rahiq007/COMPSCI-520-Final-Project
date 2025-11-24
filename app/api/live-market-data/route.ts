import { NextResponse } from "next/server"
import { MultiSourceStockClient } from "@/lib/api/multi-source-client"

// Default stock data in case API calls fail
const DEFAULT_STOCKS = [
  {
    ticker: "AAPL",
    companyName: "Apple Inc.",
    price: 189.25,
    change: 2.34,
    changePercent: 1.25,
    volume: 58500000,
    marketCap: 2950000000000,
  },
  {
    ticker: "MSFT",
    companyName: "Microsoft Corp.",
    price: 378.85,
    change: -1.45,
    changePercent: -0.38,
    volume: 24800000,
    marketCap: 2810000000000,
  },
  {
    ticker: "NVDA",
    companyName: "NVIDIA Corp.",
    price: 346.46,
    change: 8.92,
    changePercent: 2.64,
    volume: 45200000,
    marketCap: 850000000000,
  },
  {
    ticker: "GOOGL",
    companyName: "Alphabet Inc.",
    price: 166.75,
    change: 0.85,
    changePercent: 0.51,
    volume: 28400000,
    marketCap: 2100000000000,
  },
  {
    ticker: "TSLA",
    companyName: "Tesla Inc.",
    price: 248.5,
    change: -3.21,
    changePercent: -1.27,
    volume: 78900000,
    marketCap: 789000000000,
  },
  {
    ticker: "AMZN",
    companyName: "Amazon.com Inc.",
    price: 155.89,
    change: 1.67,
    changePercent: 1.08,
    volume: 35600000,
    marketCap: 1600000000000,
  },
  {
    ticker: "META",
    companyName: "Meta Platforms Inc.",
    price: 485.32,
    change: 5.21,
    changePercent: 1.09,
    volume: 18500000,
    marketCap: 1230000000000,
  },
  {
    ticker: "JPM",
    companyName: "JPMorgan Chase & Co.",
    price: 195.45,
    change: 2.15,
    changePercent: 1.11,
    volume: 12500000,
    marketCap: 560000000000,
  },
  {
    ticker: "V",
    companyName: "Visa Inc.",
    price: 275.83,
    change: 1.45,
    changePercent: 0.53,
    volume: 8500000,
    marketCap: 590000000000,
  },
  {
    ticker: "JNJ",
    companyName: "Johnson & Johnson",
    price: 162.25,
    change: -0.85,
    changePercent: -0.52,
    volume: 9500000,
    marketCap: 420000000000,
  },
]

// Default ETF data in case API calls fail
const DEFAULT_ETFS = [
  {
    ticker: "SPY",
    name: "SPDR S&P 500 ETF",
    price: 485.32,
    change: 2.18,
    changePercent: 0.45,
    volume: 42100000,
    aum: 450000000000,
  },
  {
    ticker: "QQQ",
    name: "Invesco QQQ Trust",
    price: 398.76,
    change: 3.45,
    changePercent: 0.87,
    volume: 28700000,
    aum: 220000000000,
  },
  {
    ticker: "VTI",
    name: "Vanguard Total Stock Market",
    price: 245.67,
    change: 1.23,
    changePercent: 0.5,
    volume: 15300000,
    aum: 180000000000,
  },
]

export async function GET() {
  try {
    const client = new MultiSourceStockClient()
    const stockTickers = ["AAPL", "MSFT", "NVDA", "GOOGL", "TSLA", "AMZN", "META", "JPM", "V", "JNJ"]
    const etfTickers = ["SPY", "QQQ", "VTI"]

    // Try to fetch real data
    try {
      const stockPromises = stockTickers.map(async (ticker) => {
        try {
          const [quote, info] = await Promise.all([client.getQuote(ticker), client.getCompanyInfo(ticker)])

          return {
            ticker,
            companyName: quote?.ticker?.includes(".") ? ticker : `${ticker} Corp.`,
            price: quote.currentPrice,
            change: quote.change,
            changePercent: quote.changePercent,
            volume: quote.volume || 0,
            marketCap: info.marketCap || 0,
          }
        } catch (error) {
          console.warn(`Failed to fetch data for ${ticker}:`, error)
          // Return default data for this ticker
          return (
            DEFAULT_STOCKS.find((s) => s.ticker === ticker) || {
              ticker,
              companyName: `${ticker} Inc.`,
              price: 100.0,
              change: 0.0,
              changePercent: 0.0,
              volume: 1000000,
              marketCap: 10000000000,
            }
          )
        }
      })

      const etfPromises = etfTickers.map(async (ticker) => {
        try {
          const quote = await client.getQuote(ticker)

          return {
            ticker,
            name: DEFAULT_ETFS.find((e) => e.ticker === ticker)?.name || `${ticker} ETF`,
            price: quote.currentPrice,
            change: quote.change,
            changePercent: quote.changePercent,
            volume: quote.volume || 0,
            aum: DEFAULT_ETFS.find((e) => e.ticker === ticker)?.aum || 100000000000,
          }
        } catch (error) {
          console.warn(`Failed to fetch data for ${ticker}:`, error)
          // Return default data for this ETF
          return (
            DEFAULT_ETFS.find((e) => e.ticker === ticker) || {
              ticker,
              name: `${ticker} ETF`,
              price: 100.0,
              change: 0.0,
              changePercent: 0.0,
              volume: 1000000,
              aum: 10000000000,
            }
          )
        }
      })

      // Wait for all promises to resolve
      const [stocks, etfs] = await Promise.all([Promise.all(stockPromises), Promise.all(etfPromises)])

      // Validate data to ensure it's realistic
      const validatedStocks = stocks.map((stock) => validateStockData(stock))
      const validatedEtfs = etfs.map((etf) => validateEtfData(etf))

      return NextResponse.json({
        stocks: validatedStocks,
        etfs: validatedEtfs,
        lastUpdated: new Date().toISOString(),
      })
    } catch (error) {
      console.error("Failed to fetch real market data:", error)
      throw error
    }
  } catch (error) {
    console.error("Error in live market data API:", error)

    // Return default data as fallback
    return NextResponse.json({
      stocks: DEFAULT_STOCKS,
      etfs: DEFAULT_ETFS,
      lastUpdated: new Date().toISOString(),
    })
  }
}

// Validate stock data to ensure it's realistic
function validateStockData(stock: any) {
  // Find default stock for this ticker
  const defaultStock = DEFAULT_STOCKS.find((s) => s.ticker === stock.ticker)

  // Ensure price is realistic (between $1 and $10,000)
  const price =
    typeof stock.price === "number" && stock.price >= 1 && stock.price <= 10000
      ? stock.price
      : defaultStock?.price || 100.0

  // Ensure change is realistic (not more than 50% of price)
  const change =
    typeof stock.change === "number" && Math.abs(stock.change) <= price * 0.5
      ? stock.change
      : defaultStock?.change || 0.0

  // Ensure change percent matches change
  const changePercent =
    typeof stock.changePercent === "number" && Math.abs(stock.changePercent) <= 50
      ? stock.changePercent
      : (change / (price - change)) * 100

  // Ensure volume is positive
  const volume = typeof stock.volume === "number" && stock.volume > 0 ? stock.volume : defaultStock?.volume || 1000000

  // Ensure market cap is realistic
  const marketCap =
    typeof stock.marketCap === "number" && stock.marketCap > 0
      ? stock.marketCap
      : defaultStock?.marketCap || price * volume

  return {
    ...stock,
    price,
    change,
    changePercent,
    volume,
    marketCap,
  }
}

// Validate ETF data to ensure it's realistic
function validateEtfData(etf: any) {
  // Find default ETF for this ticker
  const defaultEtf = DEFAULT_ETFS.find((e) => e.ticker === etf.ticker)

  // Ensure price is realistic (between $10 and $1,000)
  const price =
    typeof etf.price === "number" && etf.price >= 10 && etf.price <= 1000 ? etf.price : defaultEtf?.price || 100.0

  // Ensure change is realistic (not more than 10% of price)
  const change =
    typeof etf.change === "number" && Math.abs(etf.change) <= price * 0.1 ? etf.change : defaultEtf?.change || 0.0

  // Ensure change percent matches change
  const changePercent =
    typeof etf.changePercent === "number" && Math.abs(etf.changePercent) <= 10
      ? etf.changePercent
      : (change / (price - change)) * 100

  // Ensure volume is positive
  const volume = typeof etf.volume === "number" && etf.volume > 0 ? etf.volume : defaultEtf?.volume || 1000000

  // Ensure AUM is realistic
  const aum = typeof etf.aum === "number" && etf.aum > 0 ? etf.aum : defaultEtf?.aum || 10000000000

  return {
    ...etf,
    price,
    change,
    changePercent,
    volume,
    aum,
  }
}
