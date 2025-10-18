"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  DollarSign,
  Percent,
  Activity,
  AlertTriangle,
  CheckCircle,
  Building,
  Users,
  Calendar,
} from "lucide-react"
import { AccurateFinancialDataService } from "@/lib/services/accurate-financial-data"

interface ProfessionalFundamentalAnalysisProps {
  ticker: string
  currentPrice?: number
}

export default function ProfessionalFundamentalAnalysis({
  ticker,
  currentPrice,
}: ProfessionalFundamentalAnalysisProps) {
  const [fundamentalData, setFundamentalData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<string>("")
  const [healthScore, setHealthScore] = useState<any>(null)

  useEffect(() => {
    const fetchAccurateData = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const data = await AccurateFinancialDataService.getAccurateFinancials(ticker)

        // Validate the data
        const isValid = AccurateFinancialDataService.validateFinancialData(data, ticker)
        if (!isValid) {
          throw new Error("Financial data validation failed")
        }

        setFundamentalData(data)
        setHealthScore(AccurateFinancialDataService.getHealthScore(data))
        setLastUpdated(new Date().toLocaleTimeString())
      } catch (error) {
        console.error("Failed to fetch accurate financial data:", error)
        setError(error instanceof Error ? error.message : "Failed to load financial data")
      } finally {
        setIsLoading(false)
      }
    }

    if (ticker) {
      fetchAccurateData()
      // Update every 30 seconds for real-time feel
      const interval = setInterval(fetchAccurateData, 30000)
      return () => clearInterval(interval)
    }
  }, [ticker])

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Professional Fundamental Analysis
          </CardTitle>
          <CardDescription>Loading accurate financial data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-6">
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

  if (error || !fundamentalData) {
    return (
      <Card className="w-full border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Data Error
          </CardTitle>
          <CardDescription>{error || `No accurate financial data available for ${ticker}`}</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const formatCurrency = AccurateFinancialDataService.formatCurrency
  const formatVolume = AccurateFinancialDataService.formatVolume
  const formatPercentage = (value: number) => `${(value * 100).toFixed(2)}%`

  const getMetricTrend = (value: number, isPositive: boolean) => {
    return isPositive ? (
      <TrendingUp className="h-4 w-4 text-green-500" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-500" />
    )
  }

  return (
    <Card className="w-full shadow-lg">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <BarChart3 className="h-6 w-6 text-blue-600" />
              Professional Fundamental Analysis
            </CardTitle>
            <CardDescription className="mt-1">
              Accurate financial metrics and ratios for {ticker}
              <span className="ml-2 text-xs text-gray-500">
                • {fundamentalData.sector} • {fundamentalData.industry}
              </span>
            </CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium text-green-600">Validated Data</span>
            </div>
            {lastUpdated && (
              <Badge variant="outline" className="text-xs">
                Updated: {lastUpdated}
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Health Score */}
        {healthScore && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-gray-700">Financial Health Score</h4>
              <span className={`font-bold text-lg ${healthScore.color}`}>{healthScore.rating}</span>
            </div>
            <Progress value={healthScore.score} className="h-2 mb-2" />
            <div className="flex justify-between text-sm text-gray-600">
              <span>Score: {healthScore.score}/100</span>
              <span>Based on profitability, valuation & financial health</span>
            </div>
          </div>
        )}

        {/* Primary Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-gray-600">P/E Ratio</span>
              </div>
              {fundamentalData.pe && getMetricTrend(fundamentalData.pe, fundamentalData.pe < 25)}
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {fundamentalData.pe ? fundamentalData.pe.toFixed(2) : "N/A"}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {fundamentalData.pe
                ? fundamentalData.pe < 15
                  ? "Undervalued"
                  : fundamentalData.pe > 30
                    ? "Overvalued"
                    : "Fair Value"
                : "No earnings"}
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-gray-600">EPS</span>
              </div>
              {getMetricTrend(fundamentalData.eps, fundamentalData.eps > 0)}
            </div>
            <div className="text-2xl font-bold text-gray-900">${fundamentalData.eps.toFixed(2)}</div>
            <div className="text-xs text-gray-500 mt-1">{fundamentalData.eps > 0 ? "Profitable" : "Loss-making"}</div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-gray-600">Market Cap</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(fundamentalData.marketCap)}</div>
            <div className="text-xs text-gray-500 mt-1">
              {fundamentalData.marketCap > 200e9
                ? "Large Cap"
                : fundamentalData.marketCap > 10e9
                  ? "Mid Cap"
                  : "Small Cap"}
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
            <div className="flex items-center gap-2 mb-2">
              <Percent className="h-4 w-4 text-orange-600" />
              <span className="text-sm font-medium text-gray-600">Dividend Yield</span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{fundamentalData.dividend.toFixed(2)}%</div>
            <div className="text-xs text-gray-500 mt-1">
              {fundamentalData.dividend > 3
                ? "High Yield"
                : fundamentalData.dividend > 1
                  ? "Moderate"
                  : "Low/No Dividend"}
            </div>
          </div>
        </div>

        <Separator />

        {/* Secondary Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="space-y-2">
            <span className="text-sm font-medium text-gray-600 flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Beta (Volatility)
            </span>
            <div className="text-lg font-semibold text-gray-900">{fundamentalData.beta.toFixed(2)}</div>
            <div className="text-xs text-gray-500">
              {fundamentalData.beta > 1.5 ? "High Risk" : fundamentalData.beta > 1 ? "Market Risk" : "Low Risk"}
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-sm font-medium text-gray-600">Avg. Volume</span>
            <div className="text-lg font-semibold text-gray-900">{formatVolume(fundamentalData.avgVolume)}</div>
            <div className="text-xs text-gray-500">Daily average</div>
          </div>

          <div className="space-y-2">
            <span className="text-sm font-medium text-gray-600">52-Week High</span>
            <div className="text-lg font-semibold text-green-600">${fundamentalData.fiftyTwoWeekHigh.toFixed(2)}</div>
            <div className="text-xs text-gray-500">
              {((fundamentalData.currentPrice / fundamentalData.fiftyTwoWeekHigh - 1) * 100).toFixed(1)}% from high
            </div>
          </div>

          <div className="space-y-2">
            <span className="text-sm font-medium text-gray-600">52-Week Low</span>
            <div className="text-lg font-semibold text-red-600">${fundamentalData.fiftyTwoWeekLow.toFixed(2)}</div>
            <div className="text-xs text-gray-500">
              {((fundamentalData.currentPrice / fundamentalData.fiftyTwoWeekLow - 1) * 100).toFixed(1)}% from low
            </div>
          </div>
        </div>

        <Separator />

        {/* Advanced Financial Ratios */}
        <div>
          <h4 className="text-md font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Advanced Financial Ratios
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="space-y-2">
              <span className="text-sm font-medium text-gray-600">Profit Margin</span>
              <div
                className={`text-lg font-semibold ${
                  fundamentalData.profitMargin > 0.15
                    ? "text-green-600"
                    : fundamentalData.profitMargin > 0
                      ? "text-yellow-600"
                      : "text-red-600"
                }`}
              >
                {formatPercentage(fundamentalData.profitMargin)}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-sm font-medium text-gray-600">Operating Margin</span>
              <div
                className={`text-lg font-semibold ${
                  fundamentalData.operatingMargin > 0.2
                    ? "text-green-600"
                    : fundamentalData.operatingMargin > 0
                      ? "text-yellow-600"
                      : "text-red-600"
                }`}
              >
                {formatPercentage(fundamentalData.operatingMargin)}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-sm font-medium text-gray-600">ROE</span>
              <div
                className={`text-lg font-semibold ${
                  fundamentalData.returnOnEquity > 0.15
                    ? "text-green-600"
                    : fundamentalData.returnOnEquity > 0
                      ? "text-yellow-600"
                      : "text-red-600"
                }`}
              >
                {formatPercentage(fundamentalData.returnOnEquity)}
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-sm font-medium text-gray-600">Debt/Equity</span>
              <div
                className={`text-lg font-semibold ${
                  fundamentalData.debtToEquity < 0.3
                    ? "text-green-600"
                    : fundamentalData.debtToEquity < 1
                      ? "text-yellow-600"
                      : "text-red-600"
                }`}
              >
                {fundamentalData.debtToEquity.toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Company Information */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
            <Building className="h-4 w-4" />
            Company Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">Employees:</span>
              <span className="font-medium">{fundamentalData.employees?.toLocaleString() || "N/A"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">Founded:</span>
              <span className="font-medium">{fundamentalData.founded || "N/A"}</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">Revenue:</span>
              <span className="font-medium">{formatCurrency(fundamentalData.revenue)}</span>
            </div>
          </div>
        </div>

        {/* Analysis Summary */}
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <h4 className="font-semibold text-gray-700 mb-2">Professional Analysis Summary</h4>
          <p className="text-sm text-gray-700 leading-relaxed">
            <strong>{ticker}</strong> {fundamentalData.eps > 0 ? "is profitable" : "is currently unprofitable"} with
            {fundamentalData.pe ? ` a P/E ratio of ${fundamentalData.pe.toFixed(2)}` : " no P/E ratio due to losses"}.
            The company has a market capitalization of <strong>{formatCurrency(fundamentalData.marketCap)}</strong> and
            trades with {fundamentalData.beta > 1.5 ? "high" : fundamentalData.beta > 1 ? "moderate" : "low"} volatility
            (β = {fundamentalData.beta.toFixed(2)}).
            {fundamentalData.dividend > 0
              ? ` The dividend yield of ${fundamentalData.dividend.toFixed(2)}% provides ${fundamentalData.dividend > 3 ? "attractive" : "modest"} income.`
              : " The company does not currently pay dividends."}
            {fundamentalData.profitMargin > 0.1 ? " Strong profitability metrics" : " Profitability concerns"}
            {fundamentalData.debtToEquity < 0.5 ? " and conservative debt levels" : " with elevated debt levels"}
            characterize the financial profile.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
