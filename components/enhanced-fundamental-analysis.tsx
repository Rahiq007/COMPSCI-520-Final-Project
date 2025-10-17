"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, BarChart3, DollarSign, Percent, Activity } from "lucide-react"
import { EnhancedLiveDataClient } from "@/lib/api/enhanced-live-data-client"

interface FundamentalAnalysisProps {
  ticker: string
  currentPrice?: number
}

export default function EnhancedFundamentalAnalysis({ ticker, currentPrice }: FundamentalAnalysisProps) {
  const [fundamentalData, setFundamentalData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<string>("")

  useEffect(() => {
    const fetchFundamentalData = async () => {
      setIsLoading(true)
      try {
        const data = await EnhancedLiveDataClient.getEnhancedFundamentals(ticker)
        setFundamentalData(data)
        setLastUpdated(new Date().toLocaleTimeString())
      } catch (error) {
        console.error("Failed to fetch fundamental data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (ticker) {
      fetchFundamentalData()
      // Update every 30 seconds
      const interval = setInterval(fetchFundamentalData, 30000)
      return () => clearInterval(interval)
    }
  }, [ticker])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Fundamental Analysis
          </CardTitle>
          <CardDescription>Loading financial metrics...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!fundamentalData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Fundamental Analysis
          </CardTitle>
          <CardDescription>No fundamental data available for {ticker}</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const formatCurrency = (value: number) => {
    return EnhancedLiveDataClient.formatCurrency(value)
  }

  const formatVolume = (value: number) => {
    return EnhancedLiveDataClient.formatVolume(value)
  }

  const formatPercentage = (value: number) => {
    return `${(value * 100).toFixed(2)}%`
  }

  const getMetricColor = (value: number, threshold: { good: number; bad: number }) => {
    if (value >= threshold.good) return "text-green-600"
    if (value <= threshold.bad) return "text-red-600"
    return "text-yellow-600"
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <BarChart3 className="h-5 w-5" />
              Fundamental Analysis
            </CardTitle>
            <CardDescription>Key financial metrics and ratios for {ticker}</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">Live Data</span>
            {lastUpdated && (
              <Badge variant="outline" className="text-xs">
                Updated: {lastUpdated}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Primary Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-600">P/E Ratio</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {fundamentalData.pe ? fundamentalData.pe.toFixed(2) : "N/A"}
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-gray-600">EPS</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              ${fundamentalData.eps ? fundamentalData.eps.toFixed(2) : "0.00"}
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-gray-600">Market Cap</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {fundamentalData.marketCap ? formatCurrency(fundamentalData.marketCap) : "$0.00B"}
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Percent className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-gray-600">Dividend Yield</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {fundamentalData.dividend ? fundamentalData.dividend.toFixed(2) : "0.00"}%
            </div>
          </div>
        </div>

        {/* Secondary Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <span className="text-sm font-medium text-gray-600">Beta</span>
            <div className="text-lg font-semibold text-gray-900">
              {fundamentalData.beta ? fundamentalData.beta.toFixed(2) : "N/A"}
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-sm font-medium text-gray-600">Avg. Volume</span>
            <div className="text-lg font-semibold text-gray-900">
              {fundamentalData.avgVolume ? formatVolume(fundamentalData.avgVolume) : "0.00M"}
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-sm font-medium text-gray-600">52-Week High</span>
            <div className="text-lg font-semibold text-green-600">
              ${fundamentalData.fiftyTwoWeekHigh ? fundamentalData.fiftyTwoWeekHigh.toFixed(2) : "0.00"}
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-sm font-medium text-gray-600">52-Week Low</span>
            <div className="text-lg font-semibold text-red-600">
              ${fundamentalData.fiftyTwoWeekLow ? fundamentalData.fiftyTwoWeekLow.toFixed(2) : "0.00"}
            </div>
          </div>
        </div>

        {/* Advanced Metrics */}
        <div className="border-t pt-4">
          <h4 className="text-md font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Advanced Financial Ratios
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <span className="text-sm font-medium text-gray-600">Profit Margin</span>
              <div
                className={`text-lg font-semibold ${getMetricColor(fundamentalData.profitMargin || 0, { good: 0.15, bad: 0.05 })}`}
              >
                {fundamentalData.profitMargin ? formatPercentage(fundamentalData.profitMargin) : "N/A"}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-sm font-medium text-gray-600">Operating Margin</span>
              <div
                className={`text-lg font-semibold ${getMetricColor(fundamentalData.operatingMargin || 0, { good: 0.2, bad: 0.1 })}`}
              >
                {fundamentalData.operatingMargin ? formatPercentage(fundamentalData.operatingMargin) : "N/A"}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-sm font-medium text-gray-600">ROE</span>
              <div
                className={`text-lg font-semibold ${getMetricColor(fundamentalData.returnOnEquity || 0, { good: 0.15, bad: 0.05 })}`}
              >
                {fundamentalData.returnOnEquity ? formatPercentage(fundamentalData.returnOnEquity) : "N/A"}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-sm font-medium text-gray-600">Debt/Equity</span>
              <div
                className={`text-lg font-semibold ${getMetricColor(fundamentalData.debtToEquity || 0, { good: 0.3, bad: 2.0 })}`}
              >
                {fundamentalData.debtToEquity ? fundamentalData.debtToEquity.toFixed(2) : "N/A"}
              </div>
            </div>
          </div>
        </div>

        {/* Fundamental Analysis Summary */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-700 mb-2">Fundamental Analysis Summary</h4>
          <p className="text-sm text-gray-600 leading-relaxed">
            {ticker} shows a P/E ratio of {fundamentalData.pe?.toFixed(2) || "N/A"},
            {fundamentalData.pe > 25 ? " which is above the industry average" : " which is reasonable for the sector"}.
            With a market capitalization of {formatCurrency(fundamentalData.marketCap || 0)} and an EPS of $
            {fundamentalData.eps?.toFixed(2) || "0.00"}, this represents{" "}
            {fundamentalData.beta > 1.5 ? "higher" : fundamentalData.beta < 0.8 ? "lower" : "moderate"} volatility
            compared to the market. The dividend yield of {fundamentalData.dividend?.toFixed(2) || "0.00"}% is{" "}
            {fundamentalData.dividend > 2 ? "attractive" : "modest"} for income investors.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
