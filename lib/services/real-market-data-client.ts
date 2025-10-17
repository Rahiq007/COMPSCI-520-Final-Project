import { MultiSourceStockClient } from "@/lib/api/multi-source-client"

export interface RealMarketData {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap: number
  lastUpdated: string
  source: string
}

// Stock market data for common stocks (for fallback)
const MOCK_STOCK_DATA = {
  AAPL: { name: "Apple Inc.", basePrice: 201.7, marketCap: 3100000000000 },
  MSFT: { name: "Microsoft Corporation", basePrice: 461.97, marketCap: 3420000000000 },
  GOOGL: { name: "Alphabet Inc.", basePrice: 169.03, marketCap: 2060000000000 },
  AMZN: { name: "Amazon.com Inc.", basePrice: 206.65, marketCap: 2180000000000 },
  TSLA: { name: "Tesla, Inc.", basePrice: 342.69, marketCap: 1100000000000 },
  NVDA: { name: "NVIDIA Corporation", basePrice: 137.38, marketCap: 3340000000000 },
  META: { name: "Meta Platforms, Inc.", basePrice: 525.87, marketCap: 1340000000000 },
  NFLX: { name: "Netflix, Inc.", basePrice: 687.45, marketCap: 298000000000 },
  COST: { name: "Costco Wholesale Corporation", basePrice: 889.25, marketCap: 394000000000 },
  DIS: { name: "The Walt Disney Company", basePrice: 112.73, marketCap: 206000000000 },
}

export class RealMarketDataClient {
  private static instance: RealMarketDataClient
  private multiSourceClient: MultiSourceStockClient
  private cache: Map<string, { data: RealMarketData; timestamp: number }> = new Map()
  private readonly CACHE_DURATION = 60000 // 1 minute cache for real market data
  private isPreviewMode: boolean

  static getInstance(): RealMarketDataClient {
    if (!RealMarketDataClient.instance) {
      RealMarketDataClient.instance = new RealMarketDataClient()
    }
    return RealMarketDataClient.instance
  }

  private constructor() {
    this.multiSourceClient = new MultiSourceStockClient()

    // Check if we're in preview mode (no API keys available)
    this.isPreviewMode =
      !process.env.ALPHA_VANTAGE_API_KEY && !process.env.POLYGON_API_KEY && !process.env.TWELVE_DATA_API_KEY

    console.log(`RealMarketDataClient initialized in ${this.isPreviewMode ? "PREVIEW" : "PRODUCTION"} mode`)
  }

  async getRealMarketData(symbol: string): Promise<RealMarketData> {
    const upperSymbol = symbol.toUpperCase()

    // Check cache first
    const cached = this.cache.get(upperSymbol)
    const now = Date.now()

    if (cached && now - cached.timestamp < this.CACHE_DURATION) {
      return cached.data
    }

    try {
      console.log(`Fetching market data for ${upperSymbol}...`)

      // If in preview mode, immediately use mock data
      if (this.isPreviewMode) {
        console.log(`Using mock data for ${upperSymbol} (preview mode)`)
        const mockData = this.generateMockData(upperSymbol)
        this.cache.set(upperSymbol, { data: mockData, timestamp: now })
        return mockData
      }

      // Try to fetch real data with timeout
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("API timeout")), 10000),
      )

      const dataPromise = this.fetchFromAPIs(upperSymbol)
      const result = await Promise.race([dataPromise, timeoutPromise])

      // Cache the result
      this.cache.set(upperSymbol, { data: result, timestamp: now })
      console.log(`Successfully fetched data for ${upperSymbol}:`, result)
      return result
    } catch (error) {
      console.error(`Failed to fetch market data for ${upperSymbol}:`, error)

      // Return cached data if available, even if expired
      if (cached) {
        console.log(`Using expired cache for ${upperSymbol}`)
        return cached.data
      }

      // Generate mock data as last resort
      console.log(`Generating mock data for ${upperSymbol} as fallback`)
      const mockData = this.generateMockData(upperSymbol)
      this.cache.set(upperSymbol, { data: mockData, timestamp: now })
      return mockData
    }
  }

  private async fetchFromAPIs(symbol: string): Promise<RealMarketData> {
    const errors: string[] = []

    // Try each API source in order
    const apiSources = [
      () => this.fetchFromAlphaVantage(symbol),
      () => this.fetchFromPolygon(symbol),
      () => this.fetchFromTwelveData(symbol),
      () => this.fetchFromMultiSource(symbol),
    ]

    for (const [index, apiCall] of apiSources.entries()) {
      try {
        const result = await apiCall()
        if (this.isValidMarketData(result)) {
          return result
        }
      } catch (error) {
        errors.push(`API ${index + 1}: ${error.message}`)
        continue
      }
    }

    throw new Error(`All APIs failed: ${errors.join(", ")}`)
  }

  private async fetchFromMultiSource(symbol: string): Promise<RealMarketData> {
    try {
      const [quote, info] = await Promise.all([
        this.multiSourceClient.getQuote(symbol),
        this.multiSourceClient.getCompanyInfo(symbol).catch(() => null),
      ])

      if (!quote || !quote.currentPrice) {
        throw new Error("Invalid quote data from MultiSource")
      }

      return {
        symbol: symbol.toUpperCase(),
        name: info?.companyName || `${symbol} Corp.`,
        price: Number(quote.currentPrice),
        change: Number(quote.change || 0),
        changePercent: Number(quote.changePercent || 0),
        volume: Number(quote.volume || 0),
        marketCap: Number(info?.marketCap || 0),
        lastUpdated: new Date().toISOString(),
        source: "MultiSource",
      }
    } catch (error) {
      throw new Error(`MultiSource error: ${error.message}`)
    }
  }

  private async fetchFromAlphaVantage(symbol: string): Promise<RealMarketData> {
    const apiKey = process.env.ALPHA_VANTAGE_API_KEY
    if (!apiKey) throw new Error("Alpha Vantage API key not configured")

    try {
      const response = await fetch(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}`,
      )

      if (!response.ok) {
        throw new Error(`Alpha Vantage API error: ${response.status}`)
      }

      const data = await response.json()
      const quote = data["Global Quote"]

      if (!quote || !quote["05. price"]) {
        throw new Error("Invalid Alpha Vantage response")
      }

      const price = Number.parseFloat(quote["05. price"])
      const change = Number.parseFloat(quote["09. change"])
      const changePercent = Number.parseFloat(quote["10. change percent"].replace("%", ""))

      return {
        symbol: symbol.toUpperCase(),
        name: `${symbol} Corp.`,
        price,
        change,
        changePercent,
        volume: Number.parseInt(quote["06. volume"]) || 0,
        marketCap: 0, // Not available from this endpoint
        lastUpdated: new Date().toISOString(),
        source: "Alpha Vantage",
      }
    } catch (error) {
      throw new Error(`Alpha Vantage error: ${error.message}`)
    }
  }

  private async fetchFromPolygon(symbol: string): Promise<RealMarketData> {
    const apiKey = process.env.POLYGON_API_KEY
    if (!apiKey) throw new Error("Polygon API key not configured")

    try {
      const response = await fetch(
        `https://api.polygon.io/v2/aggs/ticker/${symbol}/prev?adjusted=true&apikey=${apiKey}`,
      )

      if (!response.ok) {
        throw new Error(`Polygon API error: ${response.status}`)
      }

      const data = await response.json()

      if (!data.results || !data.results[0]) {
        throw new Error("Invalid Polygon response")
      }

      const result = data.results[0]
      const price = result.c // close price
      const open = result.o
      const change = price - open
      const changePercent = (change / open) * 100

      return {
        symbol: symbol.toUpperCase(),
        name: `${symbol} Corp.`,
        price,
        change,
        changePercent,
        volume: result.v || 0,
        marketCap: 0,
        lastUpdated: new Date().toISOString(),
        source: "Polygon",
      }
    } catch (error) {
      throw new Error(`Polygon error: ${error.message}`)
    }
  }

  private async fetchFromTwelveData(symbol: string): Promise<RealMarketData> {
    const apiKey = process.env.TWELVE_DATA_API_KEY
    if (!apiKey) throw new Error("Twelve Data API key not configured")

    try {
      const response = await fetch(`https://api.twelvedata.com/quote?symbol=${symbol}&apikey=${apiKey}`)

      if (!response.ok) {
        throw new Error(`Twelve Data API error: ${response.status}`)
      }

      const data = await response.json()

      if (!data.close) {
        throw new Error("Invalid Twelve Data response")
      }

      const price = Number.parseFloat(data.close)
      const change = Number.parseFloat(data.change)
      const changePercent = Number.parseFloat(data.percent_change)

      return {
        symbol: symbol.toUpperCase(),
        name: data.name || `${symbol} Corp.`,
        price,
        change,
        changePercent,
        volume: Number.parseInt(data.volume) || 0,
        marketCap: 0,
        lastUpdated: new Date().toISOString(),
        source: "Twelve Data",
      }
    } catch (error) {
      throw new Error(`Twelve Data error: ${error.message}`)
    }
  }

  private generateMockData(symbol: string): RealMarketData {
    const upperSymbol = symbol.toUpperCase()

    // Use predefined data if available, otherwise generate realistic data
    const stockInfo = MOCK_STOCK_DATA[upperSymbol] || {
      name: `${upperSymbol} Inc.`,
      basePrice: Math.floor(50 + Math.random() * 950), // Random price between $50 and $1000
      marketCap: Math.floor(1 + Math.random() * 10) * 100000000000, // Random market cap between $100B and $1T
    }

    // Generate realistic price movement
    const now = new Date()
    const hour = now.getHours()
    const minute = now.getMinutes()
    const seed = (hour * 60 + minute) / 1440 // Time-based seed for consistent results

    // Generate price variation based on time (±3%)
    const variation = Math.sin(seed * Math.PI * 4) * 0.03
    const price = stockInfo.basePrice * (1 + variation)

    // Calculate change based on time of day
    const baseChange = stockInfo.basePrice * variation
    const change = Number.parseFloat(baseChange.toFixed(2))
    const changePercent = Number.parseFloat((variation * 100).toFixed(2))

    // Generate realistic volume
    const volume = Math.floor((stockInfo.marketCap / stockInfo.basePrice) * (0.001 + Math.random() * 0.002))

    return {
      symbol: upperSymbol,
      name: stockInfo.name,
      price: Number.parseFloat(price.toFixed(2)),
      change,
      changePercent,
      volume,
      marketCap: stockInfo.marketCap,
      lastUpdated: new Date().toISOString(),
      source: "Market Simulation",
    }
  }

  private isValidMarketData(data: RealMarketData): boolean {
    return (
      data &&
      typeof data.price === "number" &&
      data.price > 0 &&
      data.price < 100000 && // Reasonable price range
      typeof data.symbol === "string" &&
      data.symbol.length > 0
    )
  }

  clearCache(): void {
    this.cache.clear()
  }

  getCachedData(symbol: string): RealMarketData | null {
    const cached = this.cache.get(symbol.toUpperCase())
    return cached ? cached.data : null
  }
}
