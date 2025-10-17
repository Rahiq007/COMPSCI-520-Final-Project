export interface RealTimeMarketData {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap: number
  type: "stock" | "etf"
  lastUpdated: string
}

export class RealTimeMarketService {
  private static instance: RealTimeMarketService
  private subscribers: Map<string, ((data: RealTimeMarketData[]) => void)[]> = new Map()
  private currentData: Map<string, RealTimeMarketData> = new Map()
  private updateInterval: NodeJS.Timeout | null = null

  // Enhanced market data with real-time simulation
  private static readonly MARKET_DATA: Record<
    string,
    Omit<RealTimeMarketData, "price" | "change" | "changePercent" | "lastUpdated">
  > = {
    AAPL: {
      symbol: "AAPL",
      name: "Apple Inc.",
      volume: 58500000,
      marketCap: 2950000000000,
      type: "stock",
    },
    MSFT: {
      symbol: "MSFT",
      name: "Microsoft Corp.",
      volume: 24800000,
      marketCap: 2810000000000,
      type: "stock",
    },
    NVDA: {
      symbol: "NVDA",
      name: "NVIDIA Corp.",
      volume: 45200000,
      marketCap: 850000000000,
      type: "stock",
    },
    GOOGL: {
      symbol: "GOOGL",
      name: "Alphabet Inc.",
      volume: 28400000,
      marketCap: 2100000000000,
      type: "stock",
    },
    TSLA: {
      symbol: "TSLA",
      name: "Tesla Inc.",
      volume: 78900000,
      marketCap: 789000000000,
      type: "stock",
    },
    AMZN: {
      symbol: "AMZN",
      name: "Amazon.com Inc.",
      volume: 35600000,
      marketCap: 1600000000000,
      type: "stock",
    },
    SPY: {
      symbol: "SPY",
      name: "SPDR S&P 500 ETF",
      volume: 42100000,
      marketCap: 450000000000,
      type: "etf",
    },
    QQQ: {
      symbol: "QQQ",
      name: "Invesco QQQ Trust",
      volume: 28700000,
      marketCap: 220000000000,
      type: "etf",
    },
    VTI: {
      symbol: "VTI",
      name: "Vanguard Total Stock Market",
      volume: 15300000,
      marketCap: 1800000000000,
      type: "etf",
    },
  }

  // Base prices for realistic simulation
  private static readonly BASE_PRICES: Record<string, number> = {
    AAPL: 189.25,
    MSFT: 378.85,
    NVDA: 346.46,
    GOOGL: 166.75,
    TSLA: 248.5,
    AMZN: 155.89,
    SPY: 485.32,
    QQQ: 398.76,
    VTI: 245.67,
  }

  static getInstance(): RealTimeMarketService {
    if (!RealTimeMarketService.instance) {
      RealTimeMarketService.instance = new RealTimeMarketService()
    }
    return RealTimeMarketService.instance
  }

  private constructor() {
    this.initializeData()
    this.startRealTimeUpdates()
  }

  private initializeData() {
    Object.keys(RealTimeMarketService.MARKET_DATA).forEach((symbol) => {
      const baseData = RealTimeMarketService.MARKET_DATA[symbol]
      const basePrice = RealTimeMarketService.BASE_PRICES[symbol]

      this.currentData.set(symbol, {
        ...baseData,
        price: basePrice,
        change: 0,
        changePercent: 0,
        lastUpdated: new Date().toISOString(),
      })
    })
  }

  private startRealTimeUpdates() {
    // Update every 5 seconds for real-time feel
    this.updateInterval = setInterval(() => {
      this.updatePrices()
      this.notifySubscribers()
    }, 5000)
  }

  private updatePrices() {
    this.currentData.forEach((data, symbol) => {
      const basePrice = RealTimeMarketService.BASE_PRICES[symbol]

      // Simulate realistic price movements (±0.5% max change per update)
      const maxChange = 0.005
      const randomChange = (Math.random() - 0.5) * 2 * maxChange

      // Apply some momentum (70% random, 30% trend continuation)
      const momentum = data.changePercent * 0.3
      const totalChange = randomChange * 0.7 + momentum * 0.3

      const newPrice = basePrice * (1 + totalChange)
      const change = newPrice - basePrice
      const changePercent = (change / basePrice) * 100

      this.currentData.set(symbol, {
        ...data,
        price: Number(newPrice.toFixed(2)),
        change: Number(change.toFixed(2)),
        changePercent: Number(changePercent.toFixed(2)),
        lastUpdated: new Date().toISOString(),
      })
    })
  }

  private notifySubscribers() {
    this.subscribers.forEach((callbacks, key) => {
      const data = Array.from(this.currentData.values())
      callbacks.forEach((callback) => callback(data))
    })
  }

  subscribe(key: string, callback: (data: RealTimeMarketData[]) => void) {
    if (!this.subscribers.has(key)) {
      this.subscribers.set(key, [])
    }
    this.subscribers.get(key)!.push(callback)

    // Immediately send current data
    callback(Array.from(this.currentData.values()))
  }

  unsubscribe(key: string) {
    this.subscribers.delete(key)
  }

  getCurrentPrice(symbol: string): number {
    return this.currentData.get(symbol)?.price || 0
  }

  getAllData(): RealTimeMarketData[] {
    return Array.from(this.currentData.values())
  }

  destroy() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval)
    }
    this.subscribers.clear()
  }
}
