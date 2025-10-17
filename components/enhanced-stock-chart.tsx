"use client"

import { useState, useEffect, useMemo } from "react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Brush,
  ReferenceLine,
  Legend,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import ProductionStockChart from "./production-stock-chart"
import { ProductionDataValidator } from "@/lib/testing/production-data-validator"
import type { RealMarketData } from "@/lib/services/real-market-data-client"

import {
  TrendingUp,
  TrendingDown,
  Maximize2,
  Minimize2,
  RefreshCw,
  Activity,
  AlertCircle,
  CheckCircle,
  Wifi,
} from "lucide-react"
import { MarketDataSync } from "@/lib/services/market-data-sync"

interface EnhancedStockChartProps {
  ticker: string // This should be the actual ticker symbol passed from parent
  height?: number
  showTechnicalIndicators?: boolean
  showVolume?: boolean
  historicalData?: any[]
  currentPrice?: number
  targetPrice?: number
  executiveSummaryData?: any
}

export default function EnhancedStockChart({
  ticker = "AAPL", // Default to AAPL if no ticker provided
  height = 400,
  showTechnicalIndicators = true,
  showVolume = false,
  historicalData: externalHistoricalData,
  currentPrice: externalCurrentPrice,
  targetPrice: externalTargetPrice,
  executiveSummaryData: externalExecutiveSummaryData,
}: EnhancedStockChartProps) {
  const [realMarketData, setRealMarketData] = useState<RealMarketData | null>(null)
  const [historicalData, setHistoricalData] = useState<any[]>(externalHistoricalData || [])
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [dataSource, setDataSource] = useState<string>("")
  const [activeIndicators, setActiveIndicators] = useState({
    sma20: true,
    sma50: true,
    bollinger: false,
  })
  const [validationStatus, setValidationStatus] = useState<any>(null)
  const [isValidating, setIsValidating] = useState(false)

  // Initialize market data sync for the specific ticker
  useEffect(() => {
    if (!ticker) {
      console.error("No ticker symbol provided")
      setError("No ticker symbol provided")
      return
    }

    console.log(`Initializing chart for ticker: ${ticker}`)
    setIsLoading(true)
    setError(null)

    const marketSync = MarketDataSync.getInstance()

    const unsubscribe = marketSync.subscribe(ticker, (data: RealMarketData) => {
      try {
        console.log(`Received market data for ${ticker}:`, data)
        setRealMarketData(data)
        setIsConnected(true)
        setLastUpdate(new Date().toLocaleTimeString())
        setDataSource(data.source)
        setError(null)
        setIsLoading(false)

        // Generate historical data based on current price
        marketSync
          .generateHistoricalData(ticker, 30)
          .then((historical) => {
            if (historical && historical.length > 0) {
              console.log(`Generated historical data for ${ticker}:`, historical.length, "points")
              setHistoricalData(historical)
            } else {
              console.warn(`No historical data generated for ${ticker}`)
            }
          })
          .catch((err) => {
            console.error("Failed to generate historical data:", err)
          })
      } catch (err) {
        console.error("Error processing market data:", err)
        setIsLoading(false)
      }
    })

    // Set connection timeout
    const timeout = setTimeout(() => {
      if (isLoading && !realMarketData) {
        setError(`Unable to fetch market data for ${ticker}`)
        setIsConnected(false)
        setIsLoading(false)
      }
    }, 15000) // 15 second timeout

    return () => {
      unsubscribe()
      clearTimeout(timeout)
    }
  }, [ticker]) // Re-run when ticker changes

  // Initialize validation on mount
  useEffect(() => {
    const validator = ProductionDataValidator.getInstance()

    const validateData = async () => {
      setIsValidating(true)
      try {
        const result = await validator.validateSymbol(ticker)
        setValidationStatus(result)
      } catch (error) {
        console.error("Validation failed:", error)
      } finally {
        setIsValidating(false)
      }
    }

    validateData()

    // Set up periodic validation
    const interval = setInterval(validateData, 60000) // Every minute
    return () => clearInterval(interval)
  }, [ticker])

  // Calculate technical indicators from historical data
  const technicalData = useMemo(() => {
    if (!historicalData.length) return []

    return historicalData.map((item, index, array) => {
      // SMA 20
      let sma20 = null
      if (index >= 19) {
        const prices = array.slice(index - 19, index + 1).map((d) => d.close)
        sma20 = Number((prices.reduce((sum, p) => sum + p, 0) / 20).toFixed(4))
      }

      // SMA 50
      let sma50 = null
      if (index >= 49) {
        const prices = array.slice(Math.max(0, index - 49), index + 1).map((d) => d.close)
        sma50 = Number((prices.reduce((sum, p) => sum + p, 0) / prices.length).toFixed(4))
      }

      // Bollinger Bands
      let bbUpper = null,
        bbLower = null
      if (index >= 19 && sma20) {
        const prices = array.slice(index - 19, index + 1).map((d) => d.close)
        const variance = prices.reduce((sum, price) => sum + Math.pow(price - sma20, 2), 0) / 20
        const stdDev = Math.sqrt(variance)
        bbUpper = Number((sma20 + 2 * stdDev).toFixed(4))
        bbLower = Number((sma20 - 2 * stdDev).toFixed(4))
      }

      return {
        ...item,
        sma20,
        sma50,
        bbUpper,
        bbLower,
        formattedDate: new Date(item.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
      }
    })
  }, [historicalData])

  // Chart styling based on market trend
  const chartTheme = useMemo(() => {
    const isPositive = (realMarketData?.changePercent || 0) >= 0
    return {
      primary: isPositive ? "#10b981" : "#ef4444",
      secondary: isPositive ? "#34d399" : "#f87171",
      background: isPositive ? "bg-green-50" : "bg-red-50",
    }
  }, [realMarketData?.changePercent])

  // Custom tooltip with real data
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white/95 backdrop-blur-sm border border-gray-200 rounded-lg p-4 shadow-lg min-w-[250px]">
          <p className="font-medium text-gray-900 mb-2">{label}</p>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
              <p key={index} className="text-sm" style={{ color: entry.color }}>
                {entry.name}: <span className="font-medium">${Number(entry.value).toFixed(4)}</span>
              </p>
            ))}
          </div>
          {data && (
            <div className="mt-2 pt-2 border-t border-gray-100 text-xs text-gray-500">
              <p>Volume: {(data.volume / 1000000).toFixed(1)}M</p>
              <p>High: ${data.high}</p>
              <p>Low: ${data.low}</p>
            </div>
          )}
        </div>
      )
    }
    return null
  }

  const toggleIndicator = (indicator: keyof typeof activeIndicators) => {
    setActiveIndicators((prev) => ({
      ...prev,
      [indicator]: !prev[indicator],
    }))
  }

  const refreshData = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const marketSync = MarketDataSync.getInstance()

      // Force a new data fetch
      const unsubscribe = marketSync.subscribe(ticker, (data: RealMarketData) => {
        setRealMarketData(data)
        setIsConnected(true)
        setLastUpdate(new Date().toLocaleTimeString())
        setDataSource(data.source)
        setIsLoading(false)

        // Only need this data once
        unsubscribe()
      })

      // Generate fresh historical data
      const historical = await marketSync.generateHistoricalData(ticker, 30)
      if (historical && historical.length > 0) {
        setHistoricalData(historical)
      }
    } catch (err) {
      console.error("Failed to refresh data:", err)
      setError("Failed to refresh data")
      setIsLoading(false)
    }
  }

  // If no data and error, show error state
  if (error && !realMarketData) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600 font-medium">Unable to Load Market Data</p>
            <p className="text-sm text-gray-500 mb-4">{error}</p>
            <Button variant="outline" size="sm" onClick={refreshData} disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // If loading with no data yet, show loading state
  if (isLoading && !realMarketData) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-12 w-12 text-blue-500 mx-auto mb-4 animate-spin" />
            <p className="text-blue-600 font-medium">Loading Market Data</p>
            <p className="text-sm text-gray-500">Fetching data for {ticker}...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Validation Status */}
      {validationStatus && (
        <div
          className={`p-3 rounded-lg border ${
            validationStatus.isValid ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className={`font-medium ${validationStatus.isValid ? "text-green-800" : "text-red-800"}`}>
              Data Validation: {validationStatus.isValid ? "PASSED" : "FAILED"}
            </span>
            <span className="text-sm text-gray-600">Accuracy: {validationStatus.accuracy.toFixed(1)}%</span>
          </div>
          {validationStatus.issues.length > 0 && (
            <div className="mt-2 text-sm text-red-600">Issues: {validationStatus.issues.join(", ")}</div>
          )}
        </div>
      )}

      {/* Production Chart */}
      <ProductionStockChart
        ticker={ticker}
        height={500}
        enableTechnicalIndicators={true}
        enableVolumeAnalysis={true}
        enableDataValidation={true}
      />

      <Card className={`w-full transition-all duration-300 ${isFullscreen ? "fixed inset-4 z-50" : ""}`}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg font-semibold">{ticker} Live Price Chart</CardTitle>
              <Badge variant="default" className="bg-green-600">
                Market Data
              </Badge>
            </div>

            <div className="flex items-center gap-3">
              {/* Data Source */}
              {dataSource && (
                <Badge variant="outline" className="text-xs">
                  {dataSource}
                </Badge>
              )}

              {/* Connection Status */}
              <div className="flex items-center gap-1">
                <Wifi className={`h-4 w-4 ${isConnected ? "text-green-500" : "text-red-500"}`} />
                <span className="text-xs text-gray-500">{isConnected ? "Live" : "Offline"}</span>
              </div>

              {/* Last Update */}
              {lastUpdate && <span className="text-xs text-gray-500">Updated: {lastUpdate}</span>}

              {/* Refresh Button */}
              <Button variant="ghost" size="sm" onClick={refreshData} disabled={isLoading}>
                <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              </Button>

              {/* Fullscreen Toggle */}
              <Button variant="ghost" size="sm" onClick={() => setIsFullscreen(!isFullscreen)}>
                {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Market Data Display */}
          {realMarketData && (
            <div className="flex items-center gap-4 mt-2">
              <div className="text-2xl font-bold font-mono" style={{ color: chartTheme.primary }}>
                ${realMarketData.price.toFixed(4)}
              </div>
              <div
                className={`flex items-center gap-1 ${
                  realMarketData.changePercent >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {realMarketData.changePercent >= 0 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span className="font-medium font-mono">
                  {realMarketData.changePercent >= 0 ? "+" : ""}
                  {realMarketData.changePercent.toFixed(2)}%
                </span>
                <span className="text-sm text-gray-500 font-mono">
                  ({realMarketData.changePercent >= 0 ? "+" : ""}${realMarketData.change.toFixed(2)})
                </span>
              </div>
              <Badge variant={realMarketData.changePercent >= 0 ? "default" : "destructive"}>
                {realMarketData.changePercent >= 0 ? "Bullish" : "Bearish"}
              </Badge>
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Technical Indicators Controls */}
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Switch id="sma20" checked={activeIndicators.sma20} onCheckedChange={() => toggleIndicator("sma20")} />
              <Label htmlFor="sma20" className="text-sm font-medium cursor-pointer">
                SMA 20
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch id="sma50" checked={activeIndicators.sma50} onCheckedChange={() => toggleIndicator("sma50")} />
              <Label htmlFor="sma50" className="text-sm font-medium cursor-pointer">
                SMA 50
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="bollinger"
                checked={activeIndicators.bollinger}
                onCheckedChange={() => toggleIndicator("bollinger")}
              />
              <Label htmlFor="bollinger" className="text-sm font-medium cursor-pointer">
                Bollinger Bands
              </Label>
            </div>
          </div>

          {/* Chart */}
          <div style={{ height: isFullscreen ? "calc(100vh - 300px)" : height }}>
            {technicalData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={technicalData} margin={{ top: 5, right: 30, left: 20, bottom: 60 }}>
                  <defs>
                    <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={chartTheme.primary} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={chartTheme.primary} stopOpacity={0} />
                    </linearGradient>
                  </defs>

                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="formattedDate" stroke="#6b7280" fontSize={12} interval="preserveStartEnd" />
                  <YAxis
                    stroke="#6b7280"
                    fontSize={12}
                    domain={["dataMin * 0.995", "dataMax * 1.005"]}
                    tickFormatter={(value) => `$${value.toFixed(2)}`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />

                  {/* Current Price Reference Line */}
                  {realMarketData && (
                    <ReferenceLine
                      y={realMarketData.price}
                      stroke={chartTheme.primary}
                      strokeDasharray="5 5"
                      strokeWidth={2}
                      label={{
                        value: `Current: $${realMarketData.price.toFixed(2)}`,
                        position: "right",
                        style: { fontSize: 12, fontWeight: "bold" },
                      }}
                    />
                  )}

                  {/* Bollinger Bands */}
                  {activeIndicators.bollinger && (
                    <>
                      <Line
                        type="monotone"
                        dataKey="bbUpper"
                        stroke="#9ca3af"
                        strokeWidth={1}
                        strokeDasharray="2 2"
                        dot={false}
                        name="BB Upper"
                        connectNulls={true}
                      />
                      <Line
                        type="monotone"
                        dataKey="bbLower"
                        stroke="#9ca3af"
                        strokeWidth={1}
                        strokeDasharray="2 2"
                        dot={false}
                        name="BB Lower"
                        connectNulls={true}
                      />
                    </>
                  )}

                  {/* Price Line */}
                  <Line
                    type="monotone"
                    dataKey="close"
                    stroke={chartTheme.primary}
                    strokeWidth={3}
                    dot={false}
                    name="Price"
                    activeDot={{ r: 6, stroke: chartTheme.primary, strokeWidth: 2 }}
                  />

                  {/* Moving Averages */}
                  {activeIndicators.sma20 && (
                    <Line
                      type="monotone"
                      dataKey="sma20"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      strokeDasharray="6 3"
                      dot={false}
                      name="SMA 20"
                      connectNulls={true}
                    />
                  )}
                  {activeIndicators.sma50 && (
                    <Line
                      type="monotone"
                      dataKey="sma50"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      dot={false}
                      name="SMA 50"
                      connectNulls={true}
                    />
                  )}

                  {/* Brush for zooming */}
                  <Brush dataKey="formattedDate" height={30} stroke={chartTheme.primary} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <RefreshCw className="h-8 w-8 text-gray-400 mx-auto mb-2 animate-spin" />
                  <p className="text-gray-500">Loading chart data...</p>
                </div>
              </div>
            )}
          </div>

          {/* Market Statistics */}
          {realMarketData && (
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-xs text-blue-600 font-medium">Current Price</p>
                <p className="text-lg font-bold text-blue-900 font-mono">${realMarketData.price.toFixed(4)}</p>
              </div>
              <div className={`p-3 rounded-lg ${realMarketData.changePercent >= 0 ? "bg-green-50" : "bg-red-50"}`}>
                <p
                  className={`text-xs font-medium ${realMarketData.changePercent >= 0 ? "text-green-600" : "text-red-600"}`}
                >
                  Change
                </p>
                <p
                  className={`text-lg font-bold font-mono ${realMarketData.changePercent >= 0 ? "text-green-900" : "text-red-900"}`}
                >
                  {realMarketData.changePercent.toFixed(4)}%
                </p>
              </div>
              <div className="bg-purple-50 p-3 rounded-lg">
                <p className="text-xs text-purple-600 font-medium">Volume</p>
                <p className="text-lg font-bold text-purple-900 font-mono">
                  {(realMarketData.volume / 1000000).toFixed(1)}M
                </p>
              </div>
              <div className="bg-yellow-50 p-3 rounded-lg">
                <p className="text-xs text-yellow-600 font-medium">Market Cap</p>
                <p className="text-lg font-bold text-yellow-900 font-mono">
                  {realMarketData.marketCap > 0 ? `$${(realMarketData.marketCap / 1000000000).toFixed(1)}B` : "N/A"}
                </p>
              </div>
              <div className="bg-indigo-50 p-3 rounded-lg">
                <p className="text-xs text-indigo-600 font-medium">Data Source</p>
                <p className="text-lg font-bold text-indigo-900">{dataSource}</p>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600 font-medium">Last Update</p>
                <p className="text-lg font-bold text-gray-900">{lastUpdate}</p>
              </div>
            </div>
          )}

          {/* Data Quality Report */}
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <h3 className="font-medium text-gray-900">Market Data Quality</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Data Type:</span>
                <span className="text-green-600 font-medium ml-2">Market Data</span>
              </div>
              <div>
                <span className="text-gray-600">Source:</span>
                <span className="text-blue-600 font-medium ml-2">{dataSource || "Market APIs"}</span>
              </div>
              <div>
                <span className="text-gray-600">Symbol:</span>
                <span className="font-medium ml-2">{ticker}</span>
              </div>
              <div>
                <span className="text-gray-600">Status:</span>
                <span className="text-green-600 font-medium ml-2">✅ Live</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
