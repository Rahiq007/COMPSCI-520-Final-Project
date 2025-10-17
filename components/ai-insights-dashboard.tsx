"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Brain, TrendingUp, Clock, Star, BarChart3 } from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"

interface AIInsight {
  id: number
  ticker: string
  analysis_type: string
  ai_recommendation: string
  confidence_score: number
  created_at: string
  model_used: string
  response_time_ms: number
  user_feedback: number | null
}

export default function AIInsightsDashboard() {
  const [insights, setInsights] = useState<AIInsight[]>([])
  const [metrics, setMetrics] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchAIInsights()
    fetchAIMetrics()
  }, [])

  const fetchAIInsights = async () => {
    try {
      const response = await fetch("/api/ai-insights")
      if (response.ok) {
        const data = await response.json()
        setInsights(data.insights || [])
      } else {
        setError("Failed to fetch AI insights")
      }
    } catch (error) {
      console.error("Failed to fetch AI insights:", error)
      setError("Error loading AI insights")
    }
  }

  const fetchAIMetrics = async () => {
    try {
      const response = await fetch("/api/ai-metrics")
      if (response.ok) {
        const data = await response.json()
        setMetrics(data)
      } else {
        setError("Failed to fetch AI metrics")
      }
    } catch (error) {
      console.error("Failed to fetch AI metrics:", error)
      setError("Error loading AI metrics")
    } finally {
      setIsLoading(false)
    }
  }

  const getRecommendationColor = (recommendation: string) => {
    if (!recommendation) return "bg-gray-500"

    const rec = recommendation.toUpperCase()
    switch (rec) {
      case "BUY":
        return "bg-green-500"
      case "SELL":
        return "bg-red-500"
      case "TRIM":
        return "bg-orange-500"
      case "HOLD":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  const recommendationData = insights.reduce(
    (acc, insight) => {
      const rec = insight.ai_recommendation || "UNKNOWN"
      acc[rec] = (acc[rec] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  const pieData = Object.entries(recommendationData).map(([name, value]) => ({ name, value }))
  const COLORS = ["#10b981", "#ef4444", "#f59e0b", "#fb923c", "#6b7280"]

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Unable to Load AI Insights</h3>
          <p className="text-gray-500">{error}</p>
          <p className="text-sm text-gray-400 mt-4">Try analyzing a stock to generate AI insights</p>
        </CardContent>
      </Card>
    )
  }

  if (!metrics || insights.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No AI Insights Available</h3>
          <p className="text-gray-500">
            No AI analysis data has been generated yet. Try analyzing a stock to see AI-powered insights.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* AI Performance Metrics */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total AI Analyses</p>
                  <p className="text-2xl font-bold">{Number(metrics.total_analyses || 0)}</p>
                </div>
                <Brain className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Confidence</p>
                  <p className="text-2xl font-bold">{Number(metrics.avg_confidence || 0).toFixed(1)}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Avg Response Time</p>
                  <p className="text-2xl font-bold">{Number(metrics.avg_response_time || 0).toFixed(0)}ms</p>
                </div>
                <Clock className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">User Satisfaction</p>
                  <p className="text-2xl font-bold">{Number(metrics.satisfaction_rate || 0).toFixed(1)}%</p>
                </div>
                <Star className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent AI Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Recent AI Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {insights.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No AI insights available yet</div>
              ) : (
                insights.slice(0, 10).map((insight) => (
                  <div key={insight.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{insight.ticker}</Badge>
                      <div>
                        <div className="font-medium text-sm">{insight.analysis_type}</div>
                        <div className="text-xs text-gray-500">{new Date(insight.created_at).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={`${getRecommendationColor(insight.ai_recommendation)} text-white text-xs`}>
                        {insight.ai_recommendation || "UNKNOWN"}
                      </Badge>
                      <div className="text-xs text-gray-500">{insight.confidence_score}%</div>
                      {insight.user_feedback && (
                        <div className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500" />
                          <span className="text-xs">{insight.user_feedback}/5</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recommendation Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              AI Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">No recommendation data</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Performance Trends */}
      {metrics?.daily_trends && metrics.daily_trends.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>AI Performance Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metrics.daily_trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="analyses" stroke="#8884d8" name="Daily Analyses" />
                  <Line type="monotone" dataKey="avg_confidence" stroke="#82ca9d" name="Avg Confidence" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
