import { RealMarketDataClient, type RealMarketData } from "./real-market-data-client"

export interface MarketDataSubscription {
  symbol: string
  callback: (data: RealMarketData) => void
  lastUpdate: number
}

export class MarketDataSync {
  private static instance: MarketDataSync
  private subscriptions: Map<string, MarketDataSubscription[]> = new Map()
  private updateIntervals: Map<string, NodeJS.Timeout> = new Map()
  private realDataClient: RealMarketDataClient
  private marketData: Map<string, RealMarketData> = new Map()
  private isPreviewMode: boolean

  static getInstance(): MarketDataSync {
    if (!MarketDataSync.instance) {
      MarketDataSync.instance = new MarketDataSync()
    }
    return MarketDataSync.instance
  }

  private constructor() {
    this.realDataClient = RealMarketDataClient.getInstance()

    // Check if we're in preview mode
    this.isPreviewMode =
      typeof window !== "undefined" && window.location.hostname.includes("vercel") && !process.env.ALPHA_VANTAGE_API_KEY

    console.log(`MarketDataSync initialized in ${this.isPreviewMode ? "PREVIEW" : "PRODUCTION"} mode`)
  }

  subscribe(symbol: string, callback: (data: RealMarketData) => void): () => void {
    const upperSymbol = symbol.toUpperCase()

    if (!this.subscriptions.has(upperSymbol)) {
      this.subscriptions.set(upperSymbol, [])
    }

    const subscription: MarketDataSubscription = {
      symbol: upperSymbol,
      callback,
      lastUpdate: 0,
    }

    this.subscriptions.get(upperSymbol)!.push(subscription)

    // Start fetching data for this symbol if not already started
    if (!this.updateIntervals.has(upperSymbol)) {
      this.startDataFetching(upperSymbol)
    }

    // Send cached data immediately if available
    const cachedData = this.marketData.get(upperSymbol) || this.realDataClient.getCachedData(upperSymbol)
    if (cachedData) {
      try {
        callback(cachedData)
      } catch (error) {
        console.error(`Error in immediate callback for ${upperSymbol}:`, error)
      }
    }

    // Return unsubscribe function
    return () => {
      const subs = this.subscriptions.get(upperSymbol)
      if (subs) {
        const index = subs.indexOf(subscription)
        if (index > -1) {
          subs.splice(index, 1)
        }

        // Stop fetching if no more subscribers
        if (subs.length === 0) {
          this.stopDataFetching(upperSymbol)
          this.subscriptions.delete(upperSymbol)
        }
      }
    }
  }

  private startDataFetching(symbol: string): void {
    console.log(`Starting market data fetching for ${symbol}`)

    // Fetch immediately
    this.fetchAndNotify(symbol).catch((error) => {
      console.error(`Initial fetch failed for ${symbol}:`, error)
    })

    // Set up interval for updates
    const interval = setInterval(() => {
      this.fetchAndNotify(symbol).catch((error) => {
        console.error(`Interval fetch failed for ${symbol}:`, error)
      })
    }, this.getUpdateInterval())

    this.updateIntervals.set(symbol, interval)
  }

  private stopDataFetching(symbol: string): void {
    console.log(`Stopping data fetching for ${symbol}`)

    const interval = this.updateIntervals.get(symbol)
    if (interval) {
      clearInterval(interval)
      this.updateIntervals.delete(symbol)
    }
  }

  private async fetchAndNotify(symbol: string): Promise<void> {
    try {
      console.log(`Fetching market data for ${symbol}...`)
      const data = await this.realDataClient.getRealMarketData(symbol)

      // Store in local cache
      this.marketData.set(symbol, data)

      const subscribers = this.subscriptions.get(symbol)
      if (subscribers) {
        subscribers.forEach((sub) => {
          try {
            sub.callback(data)
            sub.lastUpdate = Date.now()
          } catch (error) {
            console.error(`Error notifying subscriber for ${symbol}:`, error)
          }
        })
      }

      console.log(`Successfully updated ${subscribers?.length || 0} subscribers for ${symbol}`)
    } catch (error) {
      console.error(`Failed to fetch market data for ${symbol}:`, error)

      // Try to use cached data if available
      const cachedData = this.marketData.get(symbol)
      if (cachedData) {
        console.log(`Using cached data for ${symbol} after fetch failure`)
        const subscribers = this.subscriptions.get(symbol)
        if (subscribers) {
          subscribers.forEach((sub) => {
            try {
              sub.callback(cachedData)
            } catch (error) {
              console.error(`Error notifying subscriber with cached data for ${symbol}:`, error)
            }
          })
        }
      }
    }
  }

  private getUpdateInterval(): number {
    // In preview mode, update more frequently for demo purposes
    if (this.isPreviewMode) {
      return 30000 // 30 seconds
    }

    const now = new Date()
    const hour = now.getHours()
    const day = now.getDay()

    // Market hours: Monday-Friday 9:30 AM - 4:00 PM ET
    const isMarketHours = day >= 1 && day <= 5 && hour >= 9 && hour < 16

    // During market hours: update every 30 seconds
    // After hours: update every 5 minutes
    return isMarketHours ? 30000 : 300000
  }

  async generateHistoricalData(symbol: string, days = 30): Promise<any[]> {
    try {
      // Try to get current data first
      const currentData = await this.realDataClient.getRealMarketData(symbol)
      const basePrice = currentData.price

      const historicalData: any[] = []

      // Generate realistic historical data based on current price
      for (let i = days - 1; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)

        // Create realistic price movement
        const dayProgress = (days - 1 - i) / (days - 1)
        const trendFactor = Math.sin(dayProgress * Math.PI * 2) * 0.03 // 3% trend
        const volatilityFactor = (Math.random() - 0.5) * 0.02 // 2% daily volatility
        const priceMultiplier = 1 + trendFactor + volatilityFactor

        let price: number
        if (i === 0) {
          // Last day should match current price exactly
          price = currentData.price
        } else {
          price = basePrice * priceMultiplier
        }

        // Generate OHLC data
        const volatility = 0.015 // 1.5% intraday volatility
        const high = price * (1 + Math.random() * volatility)
        const low = price * (1 - Math.random() * volatility)
        const open = i === days - 1 ? price : historicalData[historicalData.length - 1]?.close || price

        // Ensure OHLC consistency
        const validHigh = Math.max(open, price, high)
        const validLow = Math.min(open, price, low)

        historicalData.push({
          date: date.toISOString().split("T")[0],
          price: Number(price.toFixed(4)),
          open: Number(open.toFixed(4)),
          high: Number(validHigh.toFixed(4)),
          low: Number(validLow.toFixed(4)),
          close: Number(price.toFixed(4)),
          volume: Math.floor(currentData.volume * (0.7 + Math.random() * 0.6)), // ±30% volume variation
        })
      }

      return historicalData
    } catch (error) {
      console.error(`Failed to generate historical data for ${symbol}:`, error)
      return []
    }
  }

  getCurrentData(symbol: string): RealMarketData | null {
    return this.marketData.get(symbol.toUpperCase()) || null
  }

  destroy(): void {
    // Clear all intervals
    this.updateIntervals.forEach((interval) => clearInterval(interval))
    this.updateIntervals.clear()
    this.subscriptions.clear()
    this.marketData.clear()
  }
}
