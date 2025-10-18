"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, Target, Clock, Brain, BarChart2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts"

interface PredictionResultsProps {
  data: {
    direction: string
    confidence: number
    targetPrice: number
    timeframe: string
    recommendation: string
    pricePredictions: {
      date: string
      predicted: number
      lower: number
      upper: number
    }[]
    factors: {
      name: string
      impact: number
      direction: string
    }[]
  }
  fundamentals: {
    pe: number
    eps: number
    marketCap: number
    dividend: number
    beta: number
    avgVolume: number
    fiftyTwoWeekHigh: number
    fiftyTwoWeekLow: number
  }
}

export default function PredictionResults({ data, fundamentals }: PredictionResultsProps) {
  // Safety checks for data
  if (!data || !fundamentals) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Prediction Results</CardTitle>
          <CardDescription>No prediction data available</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center text-gray-500">
            No prediction results available
          </div>
        </CardContent>
      </Card>
    )
  }

  const safeData = {
    direction: data.direction || "neutral",
    confidence: data.confidence || 0,
    targetPrice: data.targetPrice || 0,
    timeframe: data.timeframe || "1 Month",
    recommendation: data.recommendation || "HOLD",
    pricePredictions: data.pricePredictions || [],
    factors: data.factors || [],
  }

  const safeFundamentals = {
    pe: fundamentals.pe || 0,
    eps: fundamentals.eps || 0,
    marketCap: fundamentals.marketCap || 0,
    dividend: fundamentals.dividend || 0,
    beta: fundamentals.beta || 1,
    avgVolume: fundamentals.avgVolume || 0,
    fiftyTwoWeekHigh: fundamentals.fiftyTwoWeekHigh || 0,
    fiftyTwoWeekLow: fundamentals.fiftyTwoWeekLow || 0,
  }

  const getRecommendationDetails = (recommendation: string) => {
    switch (recommendation) {
      case "BUY":
        return {
          color: "bg-green-500",
          description: "Strong upward momentum expected. Consider increasing position.",
          icon: <TrendingUp className="h-5 w-5" />,
        }
      case "SELL":
        return {
          color: "bg-red-500",
          description: "Downward pressure anticipated. Consider reducing position.",
          icon: <TrendingDown className="h-5 w-5" />,
        }
      case "HOLD":
        return {
          color: "bg-yellow-500",
          description: "Maintain current position. Mixed signals detected.",
          icon: <Target className="h-5 w-5" />,
        }
      case "TRIM":
        return {
          color: "bg-orange-500",
          description: "Partial profit-taking recommended. Reduce position size.",
          icon: <TrendingDown className="h-5 w-5" />,
        }
      default:
        return {
          color: "bg-gray-500",
          description: "No clear signal detected.",
          icon: <Target className="h-5 w-5" />,
        }
    }
  }

  const getFactorColor = (direction: string) => {
    return direction === "positive" ? "text-green-500" : "text-red-500"
  }

  const getFactorIcon = (direction: string) => {
    return direction === "positive" ? (
      <TrendingUp className={`h-4 w-4 ${getFactorColor(direction)}`} />
    ) : (
      <TrendingDown className={`h-4 w-4 ${getFactorColor(direction)}`} />
    )
  }

  const recommendationDetails = getRecommendationDetails(safeData.recommendation)

  return (
    <div className="space-y-6">
      <Tabs defaultValue="prediction" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="prediction">AI Prediction</TabsTrigger>
          <TabsTrigger value="fundamentals">Fundamentals</TabsTrigger>
        </TabsList>

        <TabsContent value="prediction" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  AI Prediction Model
                </CardTitle>
                <CardDescription>Machine learning analysis results</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Confidence Level</span>
                    <span className="text-2xl font-bold">{safeData.confidence}%</span>
                  </div>
                  <Progress value={safeData.confidence} className="h-3" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <Target className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                    <p className="text-sm text-gray-600">Target Price</p>
                    <p className="text-xl font-bold text-blue-600">${safeData.targetPrice.toFixed(2)}</p>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <Clock className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                    <p className="text-sm text-gray-600">Timeframe</p>
                    <p className="text-lg font-bold text-purple-600">{safeData.timeframe}</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <h4 className="font-medium">Key Factors:</h4>
                  <ul className="space-y-2">
                    {safeData.factors.map((factor, index) => (
                      <li key={index} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          {getFactorIcon(factor.direction)}
                          <span>{factor.name}</span>
                        </div>
                        <Badge variant="outline">Impact: {(factor.impact || 0).toFixed(1)}%</Badge>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {recommendationDetails.icon}
                  Investment Recommendation
                </CardTitle>
                <CardDescription>Actionable trading advice</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center space-y-4">
                  <Badge className={`${recommendationDetails.color} text-white text-lg px-4 py-2`}>
                    {safeData.recommendation}
                  </Badge>
                  <p className="text-gray-600">{recommendationDetails.description}</p>
                </div>

                <div className="h-[200px]">
                  {safeData.pricePredictions.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={safeData.pricePredictions}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="date"
                          tickFormatter={(value) => new Date(value).toLocaleDateString()}
                          minTickGap={30}
                        />
                        <YAxis />
                        <Tooltip
                          formatter={(value: number) => [`$${(value || 0).toFixed(2)}`, ""]}
                          labelFormatter={(label) => new Date(label).toLocaleDateString()}
                        />
                        <defs>
                          <linearGradient id="colorPrediction" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1} />
                          </linearGradient>
                        </defs>
                        <Area
                          type="monotone"
                          dataKey="predicted"
                          stroke="#8884d8"
                          fillOpacity={1}
                          fill="url(#colorPrediction)"
                          name="Predicted Price"
                        />
                        <Line
                          type="monotone"
                          dataKey="upper"
                          stroke="#82ca9d"
                          strokeDasharray="3 3"
                          name="Upper Bound"
                        />
                        <Line
                          type="monotone"
                          dataKey="lower"
                          stroke="#ff7300"
                          strokeDasharray="3 3"
                          name="Lower Bound"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      No prediction chart data available
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="fundamentals">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart2 className="h-5 w-5" />
                Fundamental Analysis
              </CardTitle>
              <CardDescription>Key financial metrics and ratios</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">P/E Ratio</p>
                  <p className="text-xl font-bold">{safeFundamentals.pe.toFixed(2)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">EPS</p>
                  <p className="text-xl font-bold">${safeFundamentals.eps.toFixed(2)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Market Cap</p>
                  <p className="text-xl font-bold">${(safeFundamentals.marketCap / 1e9).toFixed(2)}B</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Dividend Yield</p>
                  <p className="text-xl font-bold">{safeFundamentals.dividend.toFixed(2)}%</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Beta</p>
                  <p className="text-xl font-bold">{safeFundamentals.beta.toFixed(2)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">Avg. Volume</p>
                  <p className="text-xl font-bold">{(safeFundamentals.avgVolume / 1e6).toFixed(2)}M</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">52-Week High</p>
                  <p className="text-xl font-bold">${safeFundamentals.fiftyTwoWeekHigh.toFixed(2)}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-gray-500">52-Week Low</p>
                  <p className="text-xl font-bold">${safeFundamentals.fiftyTwoWeekLow.toFixed(2)}</p>
                </div>
              </div>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium mb-2">Fundamental Analysis Summary</h4>
                <p className="text-sm text-gray-600">
                  This stock shows a P/E ratio of {safeFundamentals.pe.toFixed(2)}, which is
                  {safeFundamentals.pe > 20 ? " above" : " below"} the industry average. With a market capitalization of
                  ${(safeFundamentals.marketCap / 1e9).toFixed(2)}B and a beta of {safeFundamentals.beta.toFixed(2)},
                  this represents
                  {safeFundamentals.beta > 1 ? " higher" : " lower"} volatility compared to the market. The dividend
                  yield of {safeFundamentals.dividend.toFixed(2)}% is
                  {safeFundamentals.dividend > 2 ? " attractive" : " modest"} for income investors.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
