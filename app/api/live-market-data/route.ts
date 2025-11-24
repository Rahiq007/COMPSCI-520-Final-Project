import { NextResponse } from "next/server"
import { MultiSourceStockClient } from "@/lib/api/multi-source-client"

// Default stock data in case API calls fail
const DEFAULT_STOCKS = [
  {
    ticker: "AAPL",
    companyName: "Apple Inc.",
    price: 271.49,
    change: 5.24,
    changePercent: 1.97,
    volume: 59030832,
    marketCap: 4029000000000,
  },
  {
    ticker: "MSFT",
    companyName: "Microsoft Corporation",
    price: 472.12,
    change: -6.31,
    changePercent: -1.32,
    volume: 31769248,
    marketCap: 3509000000000,
  },
  {
    ticker: "NVDA",
    companyName: "NVIDIA Corporation",
    price: 178.88,
    change: -1.76,
    changePercent: -0.97,
    volume: 346926153,
    marketCap: 4362000000000,
  },
  {
    ticker: "GOOGL",
    companyName: "Alphabet Inc.",
    price: 299.66,
    change: 10.21,
    changePercent: 3.53,
    volume: 74137697,
    marketCap: 3630000000000,
  },
  {
    ticker: "TSLA",
    companyName: "Tesla, Inc",
    price: 391.09,
    change: -3.95,
    changePercent: -1.00,
    volume: 100460633,
    marketCap: 1301000000000,
  },
  {
    ticker: "AMZN",
    companyName: "Amazon.com, Inc.",
    price: 220.69,
    change: 3.55,
    changePercent: 1.63,
    volume: 68490464,
    marketCap: 2359000000000,
  },
  {
    ticker: "META",
    companyName: "Meta Platforms, Inc.",
    price: 594.25,
    change: 5.03,
    changePercent: 0.85,
    volume: 21052624,
    marketCap: 1498000000000,
  },
  {
    ticker: "JPM",
    companyName: "JPMorgan Chase & Co.",
    price: 298.02,
    change: -0.36,
    changePercent: -0.12,
    volume: 11742526,
    marketCap: 819482000000,
  },
  {
    ticker: "V",
    companyName: "Visa Inc.",
    price: 327.98,
    change: 4.21,
    changePercent: 1.30,
    volume: 8832314,
    marketCap: 636590000000,
  },
  {
    ticker: "JNJ",
    companyName: "Johnson & Johnson",
    price: 203.09,
    change: 0.83,
    changePercent: 0.41,
    volume: 13172196,
    marketCap: 491255000000,
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

          // Log API values for debugging
          console.log(`[${ticker}] API Data Received:`, {
            volume: quote?.volume,
            volumeFormatted: quote?.volume ? `${(quote.volume / 1e6).toFixed(2)}M` : "N/A",
            marketCap: info?.marketCap,
            marketCapFormatted: info?.marketCap 
              ? (info.marketCap >= 1e12 
                  ? `${(info.marketCap / 1e12).toFixed(3)}T` 
                  : info.marketCap >= 1e9 
                    ? `${(info.marketCap / 1e9).toFixed(3)}B`
                    : `${info.marketCap}`)
              : "N/A",
            source: "Yahoo Finance API"
          })

          const stockData = {
            ticker,
            companyName: DEFAULT_STOCKS.find(s => s.ticker === ticker)?.companyName || quote?.ticker || `${ticker} Corp.`,
            price: info.price || quote.currentPrice,
            change: info.change || quote.change,
            changePercent: info.changePercent || quote.changePercent,
            // Use volume from quote, fallback to volume from company info, then avgVolume
            volume: (quote.volume && quote.volume > 0) ? quote.volume : (info.volume || info.avgVolume || 0),
            marketCap: info.marketCap || 0,
          }

          console.log(`[${ticker}] Stock data before validation:`, {
            volume: stockData.volume,
            marketCap: stockData.marketCap,
            marketCapFormatted: stockData.marketCap >= 1e12 
              ? `${(stockData.marketCap / 1e12).toFixed(3)}T` 
              : stockData.marketCap >= 1e9 
                ? `${(stockData.marketCap / 1e9).toFixed(3)}B`
                : `${stockData.marketCap}`
          })

          return stockData
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

  // Preserve volume from API if valid, otherwise use default
  // Volume should be at least thousands (>= 1000) for realistic stock data
  const volume =
    typeof stock.volume === "number" && stock.volume >= 1000
      ? stock.volume
      : defaultStock?.volume || 1000000

  // Ensure market cap is realistic and preserve API values
  // Market cap for large caps should be in billions (>= 1B) or trillions
  // Only use default if API value is missing or clearly invalid (too small)
  
  // List of known large cap stocks that should have market cap in billions/trillions
  const largeCapStocks = ["AAPL", "MSFT", "NVDA", "GOOGL", "AMZN", "TSLA", "META", "JPM", "V", "JNJ"]
  const isLargeCap = largeCapStocks.includes(stock.ticker)
  
  let marketCap = stock.marketCap

  if (typeof marketCap !== "number" || marketCap <= 0) {
    // API didn't provide valid market cap, use default
    marketCap = defaultStock?.marketCap || 0
    if (marketCap > 0) {
      console.log(`[${stock.ticker}] Using default market cap: ${marketCap}`)
    }
  } else if (marketCap < 1000000000) {
    // Market cap is less than 1B
    if (isLargeCap) {
      // If market cap is suspiciously small (likely in millions), try scaling it
      // Yahoo Finance sometimes returns market cap in millions
      if (marketCap > 100000 && marketCap < 10000000) { // 100k to 10m range
         const scaledMarketCap = marketCap * 1000000;
         if (scaledMarketCap > 100000000000) { // If scaled is > 100B
            console.log(`[${stock.ticker}] ⚠️ Market cap seems scaled in millions (${marketCap}), scaling up to ${scaledMarketCap}`);
            marketCap = scaledMarketCap;
         } else {
            console.warn(`[${stock.ticker}] ⚠️ Large cap stock but market cap too small (${marketCap}), using default instead`)
            marketCap = defaultStock?.marketCap || 0
         }
      } else {
        console.warn(`[${stock.ticker}] ⚠️ Large cap stock but market cap too small (${marketCap}), using default instead`)
        marketCap = defaultStock?.marketCap || 0
      }
    } else if (marketCap < 1000000) {
      // For other stocks, less than 1M is definitely wrong, use default
      console.warn(`[${stock.ticker}] Market cap too small (${marketCap}), using default`)
      marketCap = defaultStock?.marketCap || marketCap
    }
    // Otherwise, preserve the value (could be a valid small/mid cap)
  }

  // Log if we're preserving API market cap
  if (typeof stock.marketCap === "number" && stock.marketCap > 0 && marketCap >= 1000000000) {
    console.log(`[${stock.ticker}] ✅ Using API market cap: ${marketCap} (${(marketCap / 1e12).toFixed(3)}T)`)
  } else if (marketCap < 1000000000 && marketCap > 0) {
    console.warn(`[${stock.ticker}] ⚠️ Market cap suspiciously low: ${marketCap} (${(marketCap / 1e6).toFixed(2)}M)`)
  }

  const validatedData = {
    ...stock,
    price,
    change,
    changePercent,
    volume,
    marketCap,
  }

  console.log(`[${stock.ticker}] Final validated data:`, {
    volume: validatedData.volume,
    volumeFormatted: `${(validatedData.volume / 1e6).toFixed(2)}M`,
    marketCap: validatedData.marketCap,
    marketCapFormatted: validatedData.marketCap >= 1e12 
      ? `${(validatedData.marketCap / 1e12).toFixed(3)}T` 
      : validatedData.marketCap >= 1e9 
        ? `${(validatedData.marketCap / 1e9).toFixed(3)}B`
        : `${(validatedData.marketCap / 1e6).toFixed(2)}M`
  })

  return validatedData
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
