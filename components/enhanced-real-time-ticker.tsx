"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Minus, Wifi } from "lucide-react"
import { RealTimeMarketService, type RealTimeMarketData } from "@/lib/services/real-time-market-service"

interface EnhancedRealTimeTickerProps {
  currentAnalyzedTicker?: string
  currentPrice?: number
}

export default function EnhancedRealTimeTicker({ currentAnalyzedTicker, currentPrice }: EnhancedRealTimeTickerProps) {
  const [tickerData, setTickerData] = useState<RealTimeMarketData[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<string>("")

  useEffect(() => {
    const marketService = RealTimeMarketService.getInstance()

    const handleDataUpdate = (data: RealTimeMarketData[]) => {
      // If we have a current analyzed ticker and price, sync it
      if (currentAnalyzedTicker && currentPrice) {
        const updatedData = data.map((item) => {
          if (item.symbol === currentAnalyzedTicker.toUpperCase()) {
            return {
              ...item,
              price: currentPrice,
              change: currentPrice - (item.price || currentPrice),
              changePercent: ((currentPrice - (item.price || currentPrice)) / (item.price || currentPrice)) * 100,
            }
          }
          return item
        })
        setTickerData(updatedData)
      } else {
        setTickerData(data)
      }

      setIsConnected(true)
      setLastUpdate(new Date().toLocaleTimeString())
    }

    marketService.subscribe("enhanced-ticker", handleDataUpdate)

    return () => {
      marketService.unsubscribe("enhanced-ticker")
    }
  }, [currentAnalyzedTicker, currentPrice])

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
    if (change < 0) return <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
    return <Minus className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
  }

  const getChangeColor = (change: number) => {
    if (change > 0) return "text-green-600"
    if (change < 0) return "text-red-600"
    return "text-gray-600"
  }

  const formatVolume = (volume: number) => {
    if (volume >= 1e9) return `${(volume / 1e9).toFixed(1)}B`
    if (volume >= 1e6) return `${(volume / 1e6).toFixed(1)}M`
    if (volume >= 1e3) return `${(volume / 1e3).toFixed(1)}K`
    return volume.toString()
  }

  const formatMarketCap = (marketCap: number) => {
    if (marketCap >= 1e12) return `${(marketCap / 1e12).toFixed(2)}T`
    if (marketCap >= 1e9) return `${(marketCap / 1e9).toFixed(1)}B`
    if (marketCap >= 1e6) return `${(marketCap / 1e6).toFixed(1)}M`
    return `${marketCap.toFixed(0)}`
  }

  const stocks = tickerData.filter((item) => item.type === "stock")
  const etfs = tickerData.filter((item) => item.type === "etf")

  return (
    <Card className="w-full overflow-hidden">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Live Market Data</h3>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Wifi className={`h-4 w-4 ${isConnected ? "text-green-500" : "text-red-500"}`} />
              <div
                className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500 animate-pulse" : "bg-red-500"}`}
              ></div>
              <span className="text-sm text-gray-600">{isConnected ? "Live" : "Disconnected"}</span>
            </div>
            {lastUpdate && (
              <Badge variant="outline" className="text-xs">
                {lastUpdate}
              </Badge>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {/* Stocks Section */}
          <div>
            <h4 className="text-md font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Badge variant="outline" className="text-blue-600 border-blue-600">
                Stocks
              </Badge>
              Top 6 Performers
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
              {stocks.map((item) => {
                const isCurrentStock = currentAnalyzedTicker && item.symbol === currentAnalyzedTicker.toUpperCase()
                return (
                  <div
                    key={item.symbol}
                    className={`relative bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 sm:p-4 hover:from-gray-100 hover:to-gray-200 transition-all duration-200 ${
                      isCurrentStock ? "ring-2 ring-blue-500 bg-gradient-to-br from-blue-50 to-blue-100" : ""
                    }`}
                  >
                    {isCurrentStock && (
                      <div className="absolute -top-2 -right-2">
                        <Badge className="bg-blue-500 text-white text-xs">Analyzing</Badge>
                      </div>
                    )}
                    <div className="flex items-center justify-between mb-2">
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-gray-900 text-sm sm:text-base">{item.symbol}</div>
                        <div className="text-xs text-gray-600 truncate">{item.name}</div>
                      </div>
                      {getChangeIcon(item.change)}
                    </div>
                    <div className="space-y-1">
                      <div className="text-lg sm:text-xl font-bold text-gray-900">${item.price.toFixed(2)}</div>
                      <div className={`text-sm font-medium ${getChangeColor(item.change)}`}>
                        {item.change > 0 ? "+" : ""}
                        {item.change.toFixed(2)}({item.changePercent > 0 ? "+" : ""}
                        {item.changePercent.toFixed(2)}%)
                      </div>
                      <div className="text-xs text-gray-500">
                        <div>Vol: {formatVolume(item.volume)}</div>
                        <div>Cap: {formatMarketCap(item.marketCap)}</div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* ETFs Section */}
          <div>
            <h4 className="text-md font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Badge variant="outline" className="text-purple-600 border-purple-600">
                ETFs
              </Badge>
              Market Indices
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {etfs.map((item) => (
                <div
                  key={item.symbol}
                  className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 sm:p-4 hover:from-gray-100 hover:to-gray-200 transition-all duration-200"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-gray-900 text-sm sm:text-base">{item.symbol}</div>
                      <div className="text-xs text-gray-600 truncate">{item.name}</div>
                    </div>
                    {getChangeIcon(item.change)}
                  </div>
                  <div className="space-y-1">
                    <div className="text-lg sm:text-xl font-bold text-gray-900">${item.price.toFixed(2)}</div>
                    <div className={`text-sm font-medium ${getChangeColor(item.change)}`}>
                      {item.change > 0 ? "+" : ""}
                      {item.change.toFixed(2)}({item.changePercent > 0 ? "+" : ""}
                      {item.changePercent.toFixed(2)}%)
                    </div>
                    <div className="text-xs text-gray-500">
                      <div>Vol: {formatVolume(item.volume)}</div>
                      <div>AUM: {formatMarketCap(item.marketCap)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
