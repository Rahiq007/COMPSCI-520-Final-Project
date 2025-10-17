"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  BarChart3,
  Brain,
  DollarSign,
  Loader2,
  Bitcoin,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import TechnicalIndicators from "@/components/technical-indicators"
import SentimentAnalysis from "@/components/sentiment-analysis"
import RiskAssessment from "@/components/risk-assessment"
import NewsAnalysis from "@/components/news-analysis"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ErrorBoundary } from "@/components/error-boundary"
import { safeCurrency, safeToFixed } from "@/lib/utils/safe-formatters"
import ReliableLiveTicker from "@/components/reliable-live-ticker"
import StockAnalysisSummary from "@/components/stock-analysis-summary"
import CryptoNewsTrends from "@/components/crypto-news-trends"
import { fetchStockAnalysis } from "@/lib/api"
import AIAnalysisPanel from "@/components/ai-analysis-panel"
import AINewsSummarizer from "@/components/ai-news-summarizer"
import AITradingSignals from "@/components/ai-trading-signals"
import PredictiveAlerts from "@/components/predictive-alerts"
import AIPortfolioOptimizer from "@/components/ai-portfolio-optimizer"

export default function StockDashboard() {
  const [ticker, setTicker] = useState("")
  const [shares, setShares] = useState("")
  const [timeframe, setTimeframe] = useState("1m")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisData, setAnalysisData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [mode, setMode] = useState<"stock" | "crypto">("stock")
  const { toast } = useToast()

  // Load persistent state on component mount
  useEffect(() => {
    const savedState = localStorage.getItem("stockAnalysisState")
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState)
        setTicker(parsed.ticker || "")
        setShares(parsed.shares || "")
        setTimeframe(parsed.timeframe || "1m")
        setAnalysisData(parsed.analysisData || null)
        setMode(parsed.mode || "stock")
      } catch (error) {
        console.warn("Failed to load saved state:", error)
      }
    }
  }, [])

  // Save state whenever it changes
  useEffect(() => {
    const stateToSave = {
      ticker,
      shares,
      timeframe,
      analysisData,
      mode,
    }
    localStorage.setItem("stockAnalysisState", JSON.stringify(stateToSave))
  }, [ticker, shares, timeframe, analysisData, mode])

  const handleAnalyze = async () => {
    if (!ticker) {
      setError("Please enter a stock ticker symbol")
      toast({
        title: "Missing Information",
        description: "Please enter a stock ticker symbol",
        variant: "destructive",
      })
      return
    }

    setIsAnalyzing(true)
    setError(null)

    try {
      const analysisResult = await fetchStockAnalysis(ticker)
      setAnalysisData(analysisResult)
      setRetryCount(0)

      toast({
        title: "Analysis Complete",
        description: `Successfully analyzed ${ticker.toUpperCase()} with AI enhancement`,
      })
    } catch (err: any) {
      console.error("Analysis error:", err)

      let userMessage = "Unable to analyze stock. Please try again."

      if (err.message.includes("Invalid ticker")) {
        userMessage = "Invalid ticker symbol. Please check the stock symbol and try again."
      } else if (err.message.includes("rate limit")) {
        userMessage = "API rate limit exceeded. Please wait a moment and try again."
      } else if (err.message.includes("timeout")) {
        userMessage = "Request timeout. The service is taking too long to respond."
      }

      setError(userMessage)
      setRetryCount((prev) => prev + 1)

      toast({
        title: "Analysis Failed",
        description: userMessage,
        variant: "destructive",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const toggleMode = () => {
    const newMode = mode === "stock" ? "crypto" : "stock"
    setMode(newMode)

    // Clear analysis data when switching to crypto mode
    if (newMode === "crypto") {
      setAnalysisData(null)
      setError(null)
    }

    toast({
      title: `Switched to ${newMode === "stock" ? "Stock" : "Crypto"} Mode`,
      description: `Now viewing ${newMode === "stock" ? "stock market" : "cryptocurrency"} data`,
    })
  }

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation?.toUpperCase()) {
      case "BUY":
        return "bg-green-500 hover:bg-green-600"
      case "SELL":
        return "bg-red-500 hover:bg-red-600"
      case "HOLD":
        return "bg-yellow-500 hover:bg-yellow-600"
      case "TRIM":
        return "bg-orange-500 hover:bg-orange-600"
      default:
        return "bg-gray-500 hover:bg-gray-600"
    }
  }

  const getDirectionIcon = (direction: string) => {
    switch (direction) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  const getConsistentRecommendation = () => {
    return analysisData?.prediction?.recommendation || "HOLD"
  }

  const getConsistentTargetPrice = () => {
    return analysisData?.prediction?.targetPrice || 0
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-2 sm:p-4">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 flex items-center justify-center gap-2 flex-wrap">
            <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
            QuantPredict Pro
            <Badge variant="outline" className="text-green-600 border-green-600 text-xs sm:text-sm">
              AI-Enhanced
            </Badge>
            <Badge variant="outline" className="text-purple-600 border-purple-600 text-xs sm:text-sm">
              Groq Powered
            </Badge>
          </h1>
          <p className="text-sm sm:text-base text-gray-600 px-4">
            Production-grade AI stock prediction with live data and comprehensive analysis
          </p>
        </div>

        {/* Input Section with Mode Toggle */}
        <Card className="transition-all duration-500 ease-in-out">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  {mode === "stock" ? (
                    <BarChart3 className="h-5 w-5" />
                  ) : (
                    <Bitcoin className="h-5 w-5 text-purple-600" />
                  )}
                  {mode === "stock" ? "Stock Analysis Input" : "Crypto Market Overview"}
                </CardTitle>
                <CardDescription className="text-sm mt-1">
                  {mode === "stock"
                    ? "Enter stock ticker and shareholding details for comprehensive AI-enhanced analysis"
                    : "Viewing live cryptocurrency market data with trending topics and latest news"}
                </CardDescription>
              </div>
              <Button
                onClick={toggleMode}
                variant={mode === "crypto" ? "default" : "outline"}
                size="lg"
                className={`transition-all duration-300 transform hover:scale-105 ${
                  mode === "crypto"
                    ? "bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 hover:from-purple-600 hover:via-pink-600 hover:to-purple-700 text-white shadow-lg"
                    : "hover:border-purple-500 hover:text-purple-600"
                }`}
              >
                <Bitcoin className="mr-2 h-4 w-4" />
                {mode === "stock" ? "Switch to Crypto" : "Switch to Stocks"}
              </Button>
            </div>
          </CardHeader>
          {mode === "stock" && (
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ticker">Stock Ticker</Label>
                  <Input
                    id="ticker"
                    placeholder="e.g., AAPL, MSFT, GOOGL"
                    value={ticker}
                    onChange={(e) => setTicker(e.target.value.toUpperCase())}
                    className="text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shares">Current Shares Held</Label>
                  <Input
                    id="shares"
                    type="number"
                    placeholder="0"
                    value={shares}
                    onChange={(e) => setShares(e.target.value)}
                    className="text-base"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timeframe">Analysis Timeframe</Label>
                  <Select value={timeframe} onValueChange={setTimeframe}>
                    <SelectTrigger className="text-base">
                      <SelectValue placeholder="Select timeframe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1d">1 Day</SelectItem>
                      <SelectItem value="1w">1 Week</SelectItem>
                      <SelectItem value="1m">1 Month</SelectItem>
                      <SelectItem value="3m">3 Months</SelectItem>
                      <SelectItem value="1y">1 Year</SelectItem>
                      <SelectItem value="5y">5 Years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={handleAnalyze}
                    disabled={!ticker || isAnalyzing}
                    className="w-full h-10 text-base"
                    size="lg"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      "Analyze Stock"
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          )}
        </Card>

        {/* Live Ticker - Shows stocks or crypto based on mode */}
        <ErrorBoundary>
          <ReliableLiveTicker currentAnalyzedTicker={ticker} currentPrice={analysisData?.currentPrice} mode={mode} />
        </ErrorBoundary>

        {/* Crypto News and Trends - Only shown in crypto mode */}
        {mode === "crypto" && (
          <ErrorBoundary>
            <CryptoNewsTrends />
          </ErrorBoundary>
        )}

        {/* Stock Analysis Results - Only shown in stock mode */}
        {mode === "stock" && (
          <>
            {/* Error Message */}
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <strong>Analysis Error:</strong> {error}
                      {retryCount > 0 && <div className="text-sm mt-1">Retry attempt: {retryCount}</div>}
                    </div>
                    <Button size="sm" variant="outline" onClick={handleAnalyze} disabled={isAnalyzing}>
                      Retry
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Loading State */}
            {isAnalyzing && (
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[...Array(4)].map((_, i) => (
                    <Card key={i}>
                      <CardContent className="p-6">
                        <Skeleton className="h-20 w-full" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Analysis Results */}
            {analysisData && !isAnalyzing && (
              <ErrorBoundary>
                {/* Executive Summary */}
                <Card className="border-2 border-blue-200">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
                    <CardTitle className="text-xl sm:text-2xl">Executive Summary - {analysisData.ticker}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <Card>
                        <CardContent className="p-4 sm:p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-600">Current Price</p>
                              <p className="text-xl sm:text-2xl font-bold">{safeCurrency(analysisData.currentPrice)}</p>
                            </div>
                            <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-green-500" />
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-4 sm:p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-600">AI Prediction</p>
                              <div className="flex items-center gap-2">
                                {getDirectionIcon(analysisData.prediction?.direction)}
                                <span className="text-lg sm:text-xl font-semibold">
                                  {safeCurrency(getConsistentTargetPrice())}
                                </span>
                              </div>
                            </div>
                            <Badge variant="secondary" className="text-sm">
                              {analysisData.prediction?.confidence || 0}%
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-4 sm:p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-600">Investment Recommendation</p>
                              <Badge
                                className={`${getRecommendationColor(getConsistentRecommendation())} text-white text-sm font-semibold`}
                              >
                                {getConsistentRecommendation()}
                              </Badge>
                            </div>
                            <AlertTriangle className="h-6 w-6 sm:h-8 sm:w-8 text-orange-500" />
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-4 sm:p-6">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium text-gray-600">Risk Score</p>
                              <p className="text-lg sm:text-xl font-semibold">
                                {safeToFixed(analysisData.risk?.riskScore, 1)}/10
                              </p>
                            </div>
                            <Brain className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </CardContent>
                </Card>

                {/* Stock Analysis Summary */}
                <ErrorBoundary>
                  <StockAnalysisSummary ticker={analysisData.ticker} analysisData={analysisData} />
                </ErrorBoundary>

                {/* AI Analysis Panel */}
                <ErrorBoundary>
                  <AIAnalysisPanel
                    ticker={analysisData.ticker}
                    stockData={analysisData}
                    onAnalysisComplete={(analysis) => {
                      setAnalysisData((prev) => ({
                        ...prev,
                        aiAnalysis: analysis,
                      }))
                    }}
                  />
                </ErrorBoundary>

                {/* AI-Powered Features Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {/* AI Trading Signals */}
                  <ErrorBoundary>
                    <AITradingSignals stockData={analysisData} />
                  </ErrorBoundary>

                  {/* Predictive Alerts */}
                  <ErrorBoundary>
                    <PredictiveAlerts
                      ticker={analysisData.ticker}
                      prediction={analysisData.prediction}
                      volatility={analysisData.risk?.volatility || 0.2}
                    />
                  </ErrorBoundary>
                </div>

                {/* AI News Summarizer */}
                <ErrorBoundary>
                  <AINewsSummarizer ticker={analysisData.ticker} news={analysisData.news?.recent || []} />
                </ErrorBoundary>

                {/* AI Portfolio Optimizer */}
                <ErrorBoundary>
                  <AIPortfolioOptimizer />
                </ErrorBoundary>

                {/* Detailed Analysis Tabs */}
                <Tabs defaultValue="technical" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 h-auto">
                    <TabsTrigger value="technical" className="text-xs sm:text-sm">
                      Technical
                    </TabsTrigger>
                    <TabsTrigger value="sentiment" className="text-xs sm:text-sm">
                      Sentiment
                    </TabsTrigger>
                    <TabsTrigger value="news" className="text-xs sm:text-sm">
                      News
                    </TabsTrigger>
                    <TabsTrigger value="risk" className="text-xs sm:text-sm">
                      Risk
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="technical">
                    <ErrorBoundary>
                      <TechnicalIndicators data={analysisData.technicalIndicators} />
                    </ErrorBoundary>
                  </TabsContent>

                  <TabsContent value="sentiment">
                    <ErrorBoundary>
                      <SentimentAnalysis data={analysisData.sentiment} />
                    </ErrorBoundary>
                  </TabsContent>

                  <TabsContent value="news">
                    <ErrorBoundary>
                      <NewsAnalysis news={analysisData.news} />
                    </ErrorBoundary>
                  </TabsContent>

                  <TabsContent value="risk">
                    <ErrorBoundary>
                      <RiskAssessment data={analysisData.risk} />
                    </ErrorBoundary>
                  </TabsContent>
                </Tabs>

                {/* Compliance Notice */}
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    <strong>Investment Disclaimer:</strong> This analysis is for informational purposes only and does
                    not constitute investment advice. AI predictions are based on historical data and market patterns
                    but cannot guarantee future results. Past performance does not guarantee future results. Please
                    consult with a qualified financial advisor before making investment decisions. All data is sourced
                    from licensed financial data providers.
                  </AlertDescription>
                </Alert>
              </ErrorBoundary>
            )}
          </>
        )}
      </div>
    </div>
  )
}
