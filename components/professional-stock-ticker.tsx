"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface TickerData {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: string
  marketCap: string
  type: "stock" | "etf"
}

export default function ProfessionalStockTicker() {
  const [tickerData, setTickerData] = useState<TickerData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate live data fetching
    const fetchTickerData = () => {
      const stocks: TickerData[] = [
        {
          symbol: "AAPL",
          name: "Apple Inc.",
          price: 189.25,
          change: 2.34,
          changePercent: 1.25,
          volume: "58.5M",
          marketCap: "2.95T",
          type: "stock",
        },
        {
          symbol: "MSFT",
          name: "Microsoft Corp.",
          price: 378.85,
          change: -1.45,
          changePercent: -0.38,
          volume: "24.8M",
          marketCap: "2.81T",
          type: "stock",
        },
        {
          symbol: "NVDA",
          name: "NVIDIA Corp.",
          price: 346.46,
          change: 8.92,
          changePercent: 2.64,
          volume: "45.2M",
          marketCap: "850B",
          type: "stock",
        },
        {
          symbol: "GOOGL",
          name: "Alphabet Inc.",
          price: 166.75,
          change: 0.85,
          changePercent: 0.51,
          volume: "28.4M",
          marketCap: "2.1T",
          type: "stock",
        },
        {
          symbol: "TSLA",
          name: "Tesla Inc.",
          price: 248.5,
          change: -3.21,
          changePercent: -1.27,
          volume: "78.9M",
          marketCap: "789B",
          type: "stock",
        },
        {
          symbol: "AMZN",
          name: "Amazon.com Inc.",
          price: 155.89,
          change: 1.67,
          changePercent: 1.08,
          volume: "35.6M",
          marketCap: "1.6T",
          type: "stock",
        },
      ]

      const etfs: TickerData[] = [
        {
          symbol: "SPY",
          name: "SPDR S&P 500 ETF",
          price: 485.32,
          change: 2.18,
          changePercent: 0.45,
          volume: "42.1M",
          marketCap: "450B",
          type: "etf",
        },
        {
          symbol: "QQQ",
          name: "Invesco QQQ Trust",
          price: 398.76,
          change: 3.45,
          changePercent: 0.87,
          volume: "28.7M",
          marketCap: "220B",
          type: "etf",
        },
        {
          symbol: "VTI",
          name: "Vanguard Total Stock Market",
          price: 245.67,
          change: 1.23,
          changePercent: 0.5,
          volume: "15.3M",
          marketCap: "1.8T",
          type: "etf",
        },
      ]

      setTickerData([...stocks, ...etfs])
      setIsLoading(false)
    }

    fetchTickerData()
    const interval = setInterval(fetchTickerData, 30000) // Update every 30 seconds

    return () => clearInterval(interval)
  }, [])

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4 text-green-500" />
    if (change < 0) return <TrendingDown className="h-4 w-4 text-red-500" />
    return <Minus className="h-4 w-4 text-gray-500" />
  }

  const getChangeColor = (change: number) => {
    if (change > 0) return "text-green-600"
    if (change < 0) return "text-red-600"
    return "text-gray-600"
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-4"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Live Market Data</h3>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">Live</span>
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
              {tickerData
                .filter((item) => item.type === "stock")
                .map((item) => (
                  <div key={item.symbol} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="font-semibold text-gray-900">{item.symbol}</div>
                        <div className="text-xs text-gray-600 truncate">{item.name}</div>
                      </div>
                      {getChangeIcon(item.change)}
                    </div>
                    <div className="space-y-1">
                      <div className="text-lg font-bold text-gray-900">${item.price.toFixed(2)}</div>
                      <div className={`text-sm font-medium ${getChangeColor(item.change)}`}>
                        {item.change > 0 ? "+" : ""}
                        {item.change.toFixed(2)} ({item.changePercent > 0 ? "+" : ""}
                        {item.changePercent.toFixed(2)}%)
                      </div>
                      <div className="text-xs text-gray-500">
                        Vol: {item.volume} | Cap: {item.marketCap}
                      </div>
                    </div>
                  </div>
                ))}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tickerData
                .filter((item) => item.type === "etf")
                .map((item) => (
                  <div key={item.symbol} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="font-semibold text-gray-900">{item.symbol}</div>
                        <div className="text-xs text-gray-600 truncate">{item.name}</div>
                      </div>
                      {getChangeIcon(item.change)}
                    </div>
                    <div className="space-y-1">
                      <div className="text-lg font-bold text-gray-900">${item.price.toFixed(2)}</div>
                      <div className={`text-sm font-medium ${getChangeColor(item.change)}`}>
                        {item.change > 0 ? "+" : ""}
                        {item.change.toFixed(2)} ({item.changePercent > 0 ? "+" : ""}
                        {item.changePercent.toFixed(2)}%)
                      </div>
                      <div className="text-xs text-gray-500">
                        Vol: {item.volume} | AUM: {item.marketCap}
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
