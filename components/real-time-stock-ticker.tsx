"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { TrendingUp, TrendingDown, Wifi, WifiOff, RefreshCw, AlertCircle } from "lucide-react"
import { safeCurrency, safeToFixed, safeNumber } from "@/lib/utils/safe-formatters"

interface RealTimeStockTickerProps {
  ticker: string
  showConnectionStatus?: boolean
  updateInterval?: number
}

interface StockData {
  ticker: string
  price: number
  change: number
  changePercent: number
  volume: number
  timestamp: string
}

export default function RealTimeStockTicker({
  ticker,
  showConnectionStatus = false,
  updateInterval = 5000,
}: RealTimeStockTickerProps) {
  const [stockData, setStockData] = useState<StockData | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

  const fetchStockData = useCallback(async () => {
    // Don't fetch if ticker is empty or invalid
    if (!ticker || ticker.length < 1 || ticker.length > 10) {
      setError(null)
      setStockData(null)
      setIsConnected(false)
      return
    }

    // Don't fetch if ticker contains invalid characters
    if (!/^[A-Z0-9.-]+$/i.test(ticker)) {
      setError(null)
      setStockData(null)
      setIsConnected(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch(`/api/realtime/${ticker.toUpperCase()}`, {
        method: "GET",
        headers: {
          "Cache-Control": "no-cache",
        },
      })

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Stock ticker "${ticker}" not found`)
        } else if (response.status === 429) {
          throw new Error("Rate limit exceeded. Please wait a moment.")
        } else {
          throw new Error(`Failed to fetch data (${response.status})`)
        }
      }

      const data = await response.json()

      // Validate the response data
      if (!data || typeof data.price !== "number") {
        throw new Error("Invalid data received from server")
      }

      const validatedData: StockData = {
        ticker: data.ticker || ticker.toUpperCase(),
        price: safeNumber(data.price, 0),
        change: safeNumber(data.change, 0),
        changePercent: safeNumber(data.changePercent, 0),
        volume: safeNumber(data.volume, 0),
        timestamp: data.timestamp || new Date().toISOString(),
      }

      setStockData(validatedData)
      setIsConnected(true)
      setLastUpdate(new Date())
    } catch (err: any) {
      console.warn(`Real-time data fetch failed for ${ticker}:`, err.message)
      setError(err.message)
      setIsConnected(false)

      // Don't clear existing data on temporary errors
      if (err.message.includes("Rate limit") || err.message.includes("timeout")) {
        // Keep existing data but show error
      } else {
        setStockData(null)
      }
    } finally {
      setIsLoading(false)
    }
  }, [ticker])

  useEffect(() => {
    // Clear data when ticker changes
    setStockData(null)
    setError(null)
    setIsConnected(false)

    // Don't start fetching until we have a valid ticker
    if (!ticker || ticker.length < 1) {
      return
    }

    // Initial fetch
    fetchStockData()

    // Set up interval for updates
    const interval = setInterval(fetchStockData, updateInterval)

    return () => {
      clearInterval(interval)
    }
  }, [fetchStockData, updateInterval])

  // Don't render anything if no ticker
  if (!ticker || ticker.length < 1) {
    return null
  }

  // Don't render if ticker is being typed (too short or invalid)
  if (ticker.length < 2 || !/^[A-Z0-9.-]+$/i.test(ticker)) {
    return (
      <Card className="border-gray-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-center text-gray-500">
            <AlertCircle className="h-4 w-4 mr-2" />
            Enter a valid stock ticker symbol
          </div>
        </CardContent>
      </Card>
    )
  }

  const formatPrice = (price: number) => safeCurrency(price)
  const formatChange = (change: number) => {
    const sign = change >= 0 ? "+" : ""
    return `${sign}${safeToFixed(change, 2)}`
  }
  const formatChangePercent = (changePercent: number) => {
    const sign = changePercent >= 0 ? "+" : ""
    return `${sign}${safeToFixed(changePercent, 2)}%`
  }

  return (
    <Card className={`transition-all duration-200 ${isConnected ? "border-green-200 bg-green-50" : "border-gray-200"}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">{ticker.toUpperCase()}</h3>
                {showConnectionStatus && (
                  <div className="flex items-center gap-1">
                    {isConnected ? (
                      <Wifi className="h-4 w-4 text-green-500" />
                    ) : (
                      <WifiOff className="h-4 w-4 text-red-500" />
                    )}
                    {isLoading && <RefreshCw className="h-3 w-3 animate-spin text-blue-500" />}
                  </div>
                )}
              </div>

              {stockData ? (
                <div className="flex items-center space-x-3">
                  <span className="text-2xl font-bold">{formatPrice(stockData.price)}</span>
                  <div
                    className={`flex items-center space-x-1 ${stockData.change >= 0 ? "text-green-600" : "text-red-600"}`}
                  >
                    {stockData.change >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    <span className="font-medium">
                      {formatChange(stockData.change)} ({formatChangePercent(stockData.changePercent)})
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
                      <span className="text-gray-600">Loading...</span>
                    </>
                  ) : (
                    <span className="text-gray-600">No data available</span>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="text-right">
            {stockData && (
              <div className="space-y-1">
                <Badge variant="outline" className="text-xs">
                  Vol: {stockData.volume.toLocaleString()}
                </Badge>
                {lastUpdate && <div className="text-xs text-gray-500">Updated: {lastUpdate.toLocaleTimeString()}</div>}
              </div>
            )}
          </div>
        </div>

        {error && (
          <Alert className="mt-3" variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">{error}</AlertDescription>
          </Alert>
        )}

        {showConnectionStatus && (
          <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
            <span>Status: {isConnected ? "Connected" : "Disconnected"}</span>
            <span>Update interval: {updateInterval / 1000}s</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
