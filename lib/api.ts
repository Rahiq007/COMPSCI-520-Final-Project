/**
 * API utility functions for stock analysis
 */

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || ""

export interface StockAnalysis {
  ticker: string
  currentPrice: number
  prediction: {
    targetPrice: number
    confidence: number
    direction: "up" | "down" | "neutral"
    recommendation: "BUY" | "SELL" | "HOLD" | "TRIM"
    timeframe: string
  }
  technicalIndicators: {
    rsi: number
    macd: {
      value: number
      signal: number
      histogram: number
    }
    movingAverages: {
      sma20: number
      sma50: number
      sma200: number
    }
    bollingerBands: {
      upper: number
      middle: number
      lower: number
    }
  }
  sentiment: {
    score: number
    label: string
    sources: {
      news: number
      social: number
      analyst: number
    }
  }
  risk: {
    riskScore: number
    volatility: number
    beta: number
    maxDrawdown: number
  }
  news: Array<{
    title: string
    source: string
    sentiment: number
    timestamp: string
    url: string
  }>
  fundamentals: {
    peRatio: number
    eps: number
    marketCap: number
    dividend: number
  }
}

export interface CryptoData {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap: number
  high24h: number
  low24h: number
  rank: number
}

export interface CryptoNews {
  id: string
  title: string
  summary: string
  category: string
  sentiment: "positive" | "negative" | "neutral"
  timestamp: string
  source: string
}

export interface TrendingTopic {
  topic: string
  mentions: number
  trend: "up" | "down" | "stable"
}

export interface LiveCryptoData {
  cryptos: CryptoData[]
  lastUpdated: string
  success: boolean
}

export interface CryptoNewsData {
  news: CryptoNews[]
  trendingTopics: TrendingTopic[]
  lastUpdated: string
  success: boolean
}

/**
 * Fetches stock analysis data for a given ticker
 * @param ticker Stock ticker symbol
 * @returns Promise with stock analysis data
 */
export async function fetchStockAnalysis(ticker: string): Promise<StockAnalysis> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

  try {
    const response = await fetch(`/api/analyze`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ ticker }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    // Check content type
    const contentType = response.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text()
      console.error("Non-JSON response:", text.substring(0, 200))
      throw new Error("Server returned an invalid response format")
    }

    if (!response.ok) {
      let errorMessage = "Failed to analyze stock"

      try {
        const errorData = await response.json()
        errorMessage = errorData.error || errorData.message || errorMessage
      } catch (parseError) {
        console.error("Failed to parse error response:", parseError)
      }

      throw new Error(errorMessage)
    }

    const data = await response.json()

    if (!data || typeof data !== "object") {
      throw new Error("Invalid response data format")
    }

    return data
  } catch (error: any) {
    clearTimeout(timeoutId)

    if (error.name === "AbortError") {
      throw new Error("Request timeout - the service is taking too long to respond")
    }

    console.error("Fetch error:", error)
    throw error
  }
}

/**
 * Fetches live market data
 * @returns Promise with live market data
 */
export async function fetchLiveMarketData() {
  try {
    const response = await fetch("/api/live-market-data", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error: any) {
    console.error("Failed to fetch live market data:", error)
    throw new Error(error.message || "Failed to fetch live market data")
  }
}

/**
 * Fetches live cryptocurrency data
 * @returns Promise with live crypto data
 */
export async function fetchLiveCryptoData(): Promise<LiveCryptoData> {
  try {
    const response = await fetch("/api/live-crypto-data", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error: any) {
    console.error("Failed to fetch live crypto data:", error)
    throw new Error(error.message || "Failed to fetch live crypto data")
  }
}

/**
 * Fetches cryptocurrency news and trending topics
 * @returns Promise with crypto news data
 */
export async function fetchCryptoNews(): Promise<CryptoNewsData> {
  try {
    const response = await fetch("/api/crypto-news", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data
  } catch (error: any) {
    console.error("Failed to fetch crypto news:", error)
    throw new Error(error.message || "Failed to fetch crypto news")
  }
}
