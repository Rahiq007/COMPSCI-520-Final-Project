import { errorManager, ErrorType } from "../error-handling/error-manager"

export interface RealTimeConfig {
  updateInterval: number
  maxRetries: number
  backoffMultiplier: number
  enableHeartbeat: boolean
}

export interface StockUpdate {
  ticker: string
  price: number
  change: number
  changePercent: number
  volume: number
  timestamp: Date
  source: string
}

export class RealTimeManager {
  private static instance: RealTimeManager
  private subscriptions = new Map<string, Set<(update: StockUpdate) => void>>()
  private intervals = new Map<string, NodeJS.Timeout>()
  private config: RealTimeConfig
  private isConnected = true
  private heartbeatInterval?: NodeJS.Timeout
  private connectionListeners = new Set<(connected: boolean) => void>()

  constructor(
    config: RealTimeConfig = {
      updateInterval: 5000,
      maxRetries: 3,
      backoffMultiplier: 1.5,
      enableHeartbeat: true,
    },
  ) {
    this.config = config
    if (config.enableHeartbeat) {
      this.startHeartbeat()
    }
  }

  static getInstance(): RealTimeManager {
    if (!RealTimeManager.instance) {
      RealTimeManager.instance = new RealTimeManager()
    }
    return RealTimeManager.instance
  }

  subscribe(ticker: string, callback: (update: StockUpdate) => void): () => void {
    if (!this.subscriptions.has(ticker)) {
      this.subscriptions.set(ticker, new Set())
      this.startUpdates(ticker)
    }

    this.subscriptions.get(ticker)!.add(callback)

    // Return unsubscribe function
    return () => {
      const callbacks = this.subscriptions.get(ticker)
      if (callbacks) {
        callbacks.delete(callback)
        if (callbacks.size === 0) {
          this.stopUpdates(ticker)
          this.subscriptions.delete(ticker)
        }
      }
    }
  }

  onConnectionChange(callback: (connected: boolean) => void): () => void {
    this.connectionListeners.add(callback)
    return () => this.connectionListeners.delete(callback)
  }

  private async startUpdates(ticker: string): Promise<void> {
    const updateTicker = async () => {
      try {
        const update = await this.fetchStockUpdate(ticker)
        this.notifySubscribers(ticker, update)
        this.setConnectionStatus(true)
      } catch (error: any) {
        const appError = errorManager.createError(
          ErrorType.REAL_TIME_ERROR,
          `Failed to update ${ticker}`,
          { ticker, error: error.message },
          true,
          `Unable to update ${ticker} price. Retrying...`,
        )

        this.setConnectionStatus(false)

        // Try to recover with exponential backoff
        setTimeout(() => {
          if (this.subscriptions.has(ticker)) {
            updateTicker()
          }
        }, this.config.updateInterval * this.config.backoffMultiplier)
      }
    }

    // Initial update
    await updateTicker()

    // Set up interval
    const interval = setInterval(updateTicker, this.config.updateInterval)
    this.intervals.set(ticker, interval)
  }

  private stopUpdates(ticker: string): void {
    const interval = this.intervals.get(ticker)
    if (interval) {
      clearInterval(interval)
      this.intervals.delete(ticker)
    }
  }

  private async fetchStockUpdate(ticker: string): Promise<StockUpdate> {
    return errorManager.withRetry(async () => {
      const response = await fetch(`/api/realtime/${ticker}`)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      return {
        ticker: data.ticker,
        price: data.price,
        change: data.change,
        changePercent: data.changePercent,
        volume: data.volume,
        timestamp: new Date(data.timestamp),
        source: data.source || "unknown",
      }
    }, this.config.maxRetries)
  }

  private notifySubscribers(ticker: string, update: StockUpdate): void {
    const callbacks = this.subscriptions.get(ticker)
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(update)
        } catch (error: any) {
          errorManager.createError(
            ErrorType.DATA_PROCESSING_ERROR,
            "Error in real-time callback",
            { ticker, error: error.message },
            false,
          )
        }
      })
    }
  }

  private setConnectionStatus(connected: boolean): void {
    if (this.isConnected !== connected) {
      this.isConnected = connected
      this.connectionListeners.forEach((callback) => {
        try {
          callback(connected)
        } catch (error: any) {
          console.error("Error in connection status callback:", error)
        }
      })
    }
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(async () => {
      try {
        const response = await fetch("/api/health")
        this.setConnectionStatus(response.ok)
      } catch (error) {
        this.setConnectionStatus(false)
      }
    }, 30000) // Check every 30 seconds
  }

  getConnectionStatus(): boolean {
    return this.isConnected
  }

  cleanup(): void {
    // Clear all intervals
    this.intervals.forEach((interval) => clearInterval(interval))
    this.intervals.clear()

    // Clear heartbeat
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval)
    }

    // Clear subscriptions
    this.subscriptions.clear()
    this.connectionListeners.clear()
  }
}

export const realTimeManager = RealTimeManager.getInstance()
