"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, RefreshCw, Wifi } from "lucide-react"
import { fetchLiveMarketData, fetchLiveCryptoData, type CryptoData } from "@/lib/api"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel"

interface StockData {
  ticker: string
  companyName: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap: number
}

interface ETFData {
  ticker: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  aum: number
}

interface LiveMarketData {
  stocks: StockData[]
  etfs: ETFData[]
  lastUpdated: string
}

interface ReliableLiveTickerProps {
  currentAnalyzedTicker?: string
  currentPrice?: number
  mode: "stock" | "crypto"
}

export default function ReliableLiveTicker({ currentAnalyzedTicker, currentPrice, mode }: ReliableLiveTickerProps) {
  const [marketData, setMarketData] = useState<LiveMarketData | null>(null)
  const [cryptoData, setCryptoData] = useState<CryptoData[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [isLive, setIsLive] = useState(true)
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)

  const loadMarketData = async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await fetchLiveMarketData()
      setMarketData(data)
      setLastUpdated(new Date())
    } catch (err: any) {
      console.error("Failed to load market data:", err)
      setError(err.message || "Failed to load market data")
    } finally {
      setLoading(false)
    }
  }

  const loadCryptoData = async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await fetchLiveCryptoData()
      setCryptoData(data.cryptos)
      setLastUpdated(new Date())
    } catch (err: any) {
      console.error("Failed to load crypto data:", err)
      setError(err.message || "Failed to load crypto data")
    } finally {
      setLoading(false)
    }
  }

  // Initial load and periodic refresh based on mode
  useEffect(() => {
    if (mode === "stock") {
      loadMarketData()
      const intervalId = setInterval(() => {
        loadMarketData()
      }, 30000) // 30 seconds
      return () => clearInterval(intervalId)
    } else {
      loadCryptoData()
      const intervalId = setInterval(() => {
        loadCryptoData()
      }, 30000) // 30 seconds
      return () => clearInterval(intervalId)
    }
  }, [mode])

  // Auto-rotation for carousel
  useEffect(() => {
    if (!api) {
      return
    }

    setCurrent(api.selectedScrollSnap())

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap())
    })
  }, [api])

  // Auto-scroll carousel every 2 seconds
  useEffect(() => {
    if (!api || !marketData?.stocks || mode !== "stock") {
      return
    }

    const intervalId = setInterval(() => {
      if (api.canScrollNext()) {
        api.scrollNext()
      } else {
        // Loop back to start
        api.scrollTo(0)
      }
    }, 2000) // 2 seconds

    return () => clearInterval(intervalId)
  }, [api, marketData, mode])

  // Format currency with appropriate decimal places
  const formatCurrency = (value: number, isCrypto = false) => {
    const decimals = isCrypto && value < 1 ? 4 : 2
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value)
  }

  // Format change with sign and appropriate decimals
  const formatChange = (value: number, isCrypto = false) => {
    const sign = value >= 0 ? "+" : ""
    const decimals = isCrypto && Math.abs(value) < 1 ? 4 : 2
    return `${sign}${value.toFixed(decimals)}`
  }

  // Format percent with sign and 2 decimal places
  const formatPercent = (value: number) => {
    const sign = value >= 0 ? "+" : ""
    return `${sign}${value.toFixed(2)}%`
  }

  // Format volume in billions or millions
  const formatVolume = (value: number) => {
    if (value >= 1e9) {
      return `${(value / 1e9).toFixed(1)}B`
    } else if (value >= 1e6) {
      return `${(value / 1e6).toFixed(1)}M`
    } else {
      return value.toLocaleString()
    }
  }

  // Format market cap
  const formatMarketCap = (value: number) => {
    if (value >= 1e12) {
      return `${(value / 1e12).toFixed(2)}T`
    } else if (value >= 1e9) {
      return `${(value / 1e9).toFixed(2)}B`
    } else if (value >= 1e6) {
      return `${(value / 1e6).toFixed(2)}M`
    } else {
      return value.toLocaleString()
    }
  }

  // Check if a ticker is the currently analyzed one
  const isCurrentTicker = (ticker: string) => {
    return currentAnalyzedTicker && ticker.toUpperCase() === currentAnalyzedTicker.toUpperCase()
  }

  // Get time since last update
  const getTimeSinceUpdate = () => {
    if (!lastUpdated) return ""

    const seconds = Math.floor((new Date().getTime() - lastUpdated.getTime()) / 1000)

    if (seconds < 60) {
      return `${seconds}s ago`
    } else {
      const minutes = Math.floor(seconds / 60)
      return `${minutes}m ${seconds % 60}s ago`
    }
  }

  const handleRefresh = () => {
    if (mode === "stock") {
      loadMarketData()
    } else {
      loadCryptoData()
    }
  }

  return (
    <Card className="transition-all duration-500 ease-in-out">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-xl flex items-center gap-2">
          <Wifi className={`h-5 w-5 ${isLive ? "text-green-500" : "text-gray-400"}`} />
          {mode === "stock" ? "Live Market Data" : "Live Crypto Data"}
          <Badge variant="outline" className="ml-2 text-xs">
            {isLive ? "Live" : "Delayed"}
          </Badge>
        </CardTitle>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          {lastUpdated && <span>Updated {getTimeSinceUpdate()}</span>}
          <Button variant="ghost" size="icon" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>

      <CardContent>
        {error ? (
          <div className="bg-red-50 p-4 rounded-md text-red-800">
            <p className="font-medium">Error loading {mode === "stock" ? "market" : "crypto"} data</p>
            <p className="text-sm">{error}</p>
            <Button variant="outline" size="sm" className="mt-2 bg-transparent" onClick={handleRefresh}>
              Retry
            </Button>
          </div>
        ) : loading && !marketData && !cryptoData ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="outline">{mode === "stock" ? "Stocks" : "Cryptocurrencies"}</Badge>
              <span className="text-sm text-gray-500">{mode === "stock" ? "Top 10 Performers" : "Top 5 Trending"}</span>
            </div>
            <Carousel
              setApi={setApi}
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-2 md:-ml-4">
                {[...Array(mode === "stock" ? 10 : 5)].map((_, i) => (
                  <CarouselItem key={i} className="pl-2 md:pl-4 basis-full sm:basis-1/2 md:basis-1/4 lg:basis-1/5">
                    <div className="bg-gray-100 animate-pulse h-32 rounded-md"></div>
                  </CarouselItem>
                ))}
              </CarouselContent>
            </Carousel>
          </div>
        ) : mode === "crypto" ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Badge variant="outline" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
                Top 5 Cryptocurrencies
              </Badge>
              <span className="text-sm text-gray-500">By Market Cap</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {cryptoData?.map((crypto) => (
                <div
                  key={crypto.symbol}
                  className="bg-gradient-to-br from-white to-purple-50 rounded-lg p-4 border-2 border-purple-200 hover:border-purple-400 transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-xl text-gray-900">{crypto.symbol}</h3>
                        <Badge variant="secondary" className="text-xs">
                          #{crypto.rank}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{crypto.name}</p>
                    </div>
                    {crypto.change >= 0 ? (
                      <TrendingUp className="h-5 w-5 text-green-500" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-red-500" />
                    )}
                  </div>

                  <div className="space-y-2">
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{formatCurrency(crypto.price, true)}</p>
                      <p className={`text-sm font-semibold ${crypto.change >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {formatChange(crypto.change, true)} ({formatPercent(crypto.changePercent)})
                      </p>
                    </div>

                    <div className="pt-2 border-t border-purple-200 space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">24h High:</span>
                        <span className="font-semibold text-gray-900">{formatCurrency(crypto.high24h, true)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">24h Low:</span>
                        <span className="font-semibold text-gray-900">{formatCurrency(crypto.low24h, true)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Volume:</span>
                        <span className="font-semibold text-gray-900">{formatVolume(crypto.volume)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-600">Market Cap:</span>
                        <span className="font-semibold text-gray-900">{formatMarketCap(crypto.marketCap)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="outline">Stocks</Badge>
                <span className="text-sm text-gray-500">Top 10 Performers</span>
              </div>

              <Carousel
                setApi={setApi}
                opts={{
                  align: "start",
                  loop: true,
                }}
                className="w-full"
              >
                <CarouselContent className="-ml-2 md:-ml-4">
                  {marketData?.stocks.map((stock) => (
                    <CarouselItem key={stock.ticker} className="pl-2 md:pl-4 basis-full sm:basis-1/2 md:basis-1/4 lg:basis-1/5">
                      <div
                        className={`bg-white rounded-lg p-3 border transition-all duration-200 h-full ${
                          isCurrentTicker(stock.ticker)
                            ? "border-blue-500 ring-2 ring-blue-200"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-bold text-lg">{stock.ticker}</h3>
                            <p className="text-xs text-gray-500 truncate">{stock.companyName}</p>
                          </div>
                          {stock.change >= 0 ? (
                            <TrendingUp className="h-4 w-4 text-green-500" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-red-500" />
                          )}
                        </div>

                        <div className="mt-2">
                          <p className="text-xl font-bold">
                            {isCurrentTicker(stock.ticker) && currentPrice
                              ? formatCurrency(currentPrice)
                              : formatCurrency(stock.price)}
                          </p>
                          <p className={`text-sm ${stock.change >= 0 ? "text-green-600" : "text-red-600"}`}>
                            {formatChange(stock.change)} ({formatPercent(stock.changePercent)})
                          </p>
                        </div>

                        <div className="mt-1 text-xs text-gray-500">
                          <p>
                            Vol: {formatVolume(stock.volume)} | Cap: {formatMarketCap(stock.marketCap)}
                          </p>
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
              </Carousel>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <Badge variant="outline">ETFs</Badge>
                <span className="text-sm text-gray-500">Market Indices</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {marketData?.etfs.map((etf) => (
                  <div
                    key={etf.ticker}
                    className="bg-white rounded-lg p-3 border border-gray-200 hover:border-gray-300 transition-all duration-200"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-lg">{etf.ticker}</h3>
                        <p className="text-xs text-gray-500 truncate">{etf.name}</p>
                      </div>
                      {etf.change >= 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      )}
                    </div>

                    <div className="mt-2">
                      <p className="text-xl font-bold">{formatCurrency(etf.price)}</p>
                      <p className={`text-sm ${etf.change >= 0 ? "text-green-600" : "text-red-600"}`}>
                        {formatChange(etf.change)} ({formatPercent(etf.changePercent)})
                      </p>
                    </div>

                    <div className="mt-1 text-xs text-gray-500">
                      <p>
                        Vol: {formatVolume(etf.volume)} | AUM: {formatMarketCap(etf.aum)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
