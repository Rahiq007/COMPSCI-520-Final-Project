"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, AlertTriangle, Target, Shield, Brain, Clock } from "lucide-react"

interface StockAnalysisSummaryProps {
  ticker: string
  analysisData: any
}

export default function StockAnalysisSummary({ ticker, analysisData }: StockAnalysisSummaryProps) {
  if (!analysisData) return null

  const getRecommendationIcon = (recommendation: string) => {
    switch (recommendation?.toUpperCase()) {
      case "BUY":
        return <TrendingUp className="h-5 w-5 text-green-500" />
      case "SELL":
        return <TrendingDown className="h-5 w-5 text-red-500" />
      case "TRIM":
        return <AlertTriangle className="h-5 w-5 text-orange-500" />
      default:
        return <Shield className="h-5 w-5 text-yellow-500" />
    }
  }

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation?.toUpperCase()) {
      case "BUY":
        return "text-green-600 bg-green-50 border-green-200"
      case "SELL":
        return "text-red-600 bg-red-50 border-red-200"
      case "TRIM":
        return "text-orange-600 bg-orange-50 border-orange-200"
      default:
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
    }
  }

  const getRiskLevel = (riskScore: number) => {
    if (riskScore >= 8) return { level: "High", color: "text-red-600", bg: "bg-red-50" }
    if (riskScore >= 6) return { level: "Moderate", color: "text-yellow-600", bg: "bg-yellow-50" }
    if (riskScore >= 4) return { level: "Low-Moderate", color: "text-blue-600", bg: "bg-blue-50" }
    return { level: "Low", color: "text-green-600", bg: "bg-green-50" }
  }

  const priceChange = analysisData.prediction?.targetPrice - analysisData.currentPrice
  const priceChangePercent = (priceChange / analysisData.currentPrice) * 100
  const risk = getRiskLevel(analysisData.risk?.riskScore || 5)

  return (
    <div className="space-y-6">
      {/* Key Insights Card */}
      <Card className="border-2 border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Brain className="h-6 w-6 text-blue-600" />
            AI Analysis Summary for {ticker}
          </CardTitle>
          <CardDescription>
            Comprehensive analysis based on technical indicators, market sentiment, and fundamental data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Key Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-4 bg-white rounded-lg border">
              <Target className="h-8 w-8 text-blue-500" />
              <div>
                <div className="text-sm text-gray-600">Price Target</div>
                <div className="text-lg font-bold text-gray-900">
                  ${analysisData.prediction?.targetPrice?.toFixed(2) || "N/A"}
                </div>
                <div className={`text-sm font-medium ${priceChange >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {priceChange >= 0 ? "+" : ""}
                  {priceChangePercent.toFixed(1)}% potential
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-white rounded-lg border">
              <div className="flex-shrink-0">{getRecommendationIcon(analysisData.prediction?.recommendation)}</div>
              <div>
                <div className="text-sm text-gray-600">Recommendation</div>
                <Badge className={`${getRecommendationColor(analysisData.prediction?.recommendation)} font-semibold`}>
                  {analysisData.prediction?.recommendation || "HOLD"}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-white rounded-lg border">
              <Shield className={`h-8 w-8 ${risk.color}`} />
              <div>
                <div className="text-sm text-gray-600">Risk Level</div>
                <div className={`text-lg font-bold ${risk.color}`}>{risk.level}</div>
                <div className="text-sm text-gray-500">{analysisData.risk?.riskScore?.toFixed(1) || "N/A"}/10</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 bg-white rounded-lg border">
              <Brain className="h-8 w-8 text-purple-500" />
              <div>
                <div className="text-sm text-gray-600">AI Confidence</div>
                <div className="text-lg font-bold text-gray-900">{analysisData.prediction?.confidence || 0}%</div>
                <div className="text-sm text-gray-500">
                  {analysisData.prediction?.confidence >= 80
                    ? "Very High"
                    : analysisData.prediction?.confidence >= 70
                      ? "High"
                      : analysisData.prediction?.confidence >= 60
                        ? "Moderate"
                        : "Low"}
                </div>
              </div>
            </div>
          </div>

          {/* Analysis Narrative */}
          <div className="bg-white p-6 rounded-lg border">
            <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              Market Analysis Insights
            </h4>

            <div className="space-y-4 text-gray-700">
              <p className="leading-relaxed">
                <strong>Current Position:</strong> {ticker} is trading at ${analysisData.currentPrice?.toFixed(2)}
                with our AI model projecting a target price of ${analysisData.prediction?.targetPrice?.toFixed(2)},
                representing a {Math.abs(priceChangePercent).toFixed(1)}%
                {priceChange >= 0 ? "upside potential" : "downside risk"}.
              </p>

              <p className="leading-relaxed">
                <strong>Technical Analysis:</strong> The technical indicators suggest
                {analysisData.technicalIndicators?.rsi > 70
                  ? " overbought conditions"
                  : analysisData.technicalIndicators?.rsi < 30
                    ? " oversold conditions"
                    : " neutral momentum"}{" "}
                with an RSI of {analysisData.technicalIndicators?.rsi?.toFixed(1) || "N/A"}. The MACD signal indicates{" "}
                {analysisData.technicalIndicators?.macd?.value > 0 ? "bullish" : "bearish"} momentum.
              </p>

              <p className="leading-relaxed">
                <strong>Market Sentiment:</strong> Current sentiment analysis shows
                {analysisData.sentiment?.overall > 0.7
                  ? " strong positive sentiment"
                  : analysisData.sentiment?.overall > 0.5
                    ? " moderately positive sentiment"
                    : analysisData.sentiment?.overall > 0.3
                      ? " neutral sentiment"
                      : " negative sentiment"}{" "}
                among market participants, which{" "}
                {analysisData.prediction?.recommendation === "BUY" ? "supports" : "challenges"} our recommendation.
              </p>

              <p className="leading-relaxed">
                <strong>Risk Assessment:</strong> With a risk score of{" "}
                {analysisData.risk?.riskScore?.toFixed(1) || "N/A"}/10, this position carries {risk.level.toLowerCase()}{" "}
                risk.
                {analysisData.risk?.riskScore > 7
                  ? "Consider position sizing carefully and implementing stop-loss orders."
                  : "The risk profile is manageable for most investment strategies."}
              </p>

              {analysisData.prediction?.reasoning && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h5 className="font-semibold text-gray-800 mb-2">Key Factors:</h5>
                  <ul className="space-y-1">
                    {analysisData.prediction.reasoning.map((reason: string, index: number) => (
                      <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        {reason}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Investment Considerations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <h5 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Positive Factors
              </h5>
              <ul className="text-sm text-green-700 space-y-1">
                {analysisData.prediction?.factors
                  ?.filter((f: any) => f.direction === "positive")
                  .map((factor: any, index: number) => (
                    <li key={index}>
                      • {factor.name}: {factor.impact.toFixed(1)}% impact
                    </li>
                  )) || [<li key="default">• Technical indicators showing strength</li>]}
              </ul>
            </div>

            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <h5 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                <TrendingDown className="h-4 w-4" />
                Risk Factors
              </h5>
              <ul className="text-sm text-red-700 space-y-1">
                {analysisData.prediction?.factors
                  ?.filter((f: any) => f.direction === "negative")
                  .map((factor: any, index: number) => (
                    <li key={index}>
                      • {factor.name}: {factor.impact.toFixed(1)}% impact
                    </li>
                  )) || [<li key="default">• Market volatility considerations</li>]}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
