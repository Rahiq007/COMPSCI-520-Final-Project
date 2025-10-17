"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, Minus, RefreshCw, Newspaper, TrendingUpIcon, Clock } from "lucide-react"
import { fetchCryptoNews, type CryptoNews, type TrendingTopic } from "@/lib/api"

interface CryptoNewsTrendsProps {
  className?: string
}

export default function CryptoNewsTrends({ className }: CryptoNewsTrendsProps) {
  const [news, setNews] = useState<CryptoNews[]>([])
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const loadNewsData = async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await fetchCryptoNews()
      setNews(data.news)
      setTrendingTopics(data.trendingTopics)
      setLastUpdated(new Date())
    } catch (err: any) {
      console.error("Failed to load crypto news:", err)
      setError(err.message || "Failed to load crypto news")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadNewsData()

    // Refresh every 5 minutes
    const intervalId = setInterval(
      () => {
        loadNewsData()
      },
      5 * 60 * 1000,
    )

    return () => clearInterval(intervalId)
  }, [])

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "text-green-600 bg-green-50 border-green-200"
      case "negative":
        return "text-red-600 bg-red-50 border-red-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Institutional: "bg-blue-100 text-blue-800 border-blue-200",
      Technology: "bg-purple-100 text-purple-800 border-purple-200",
      Regulation: "bg-orange-100 text-orange-800 border-orange-200",
      DeFi: "bg-green-100 text-green-800 border-green-200",
      Mining: "bg-yellow-100 text-yellow-800 border-yellow-200",
    }
    return colors[category] || "bg-gray-100 text-gray-800 border-gray-200"
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-500" />
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-500" />
      default:
        return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffMs = now.getTime() - time.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

    if (diffHours < 1) {
      const diffMinutes = Math.floor(diffMs / (1000 * 60))
      return `${diffMinutes}m ago`
    } else if (diffHours < 24) {
      return `${diffHours}h ago`
    } else {
      const diffDays = Math.floor(diffHours / 24)
      return `${diffDays}d ago`
    }
  }

  const formatMentions = (mentions: number) => {
    if (mentions >= 1000) {
      return `${(mentions / 1000).toFixed(1)}K`
    }
    return mentions.toString()
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Trending Topics Section */}
      <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl flex items-center gap-2">
              <TrendingUpIcon className="h-5 w-5 text-purple-600" />
              Trending Topics in Crypto
            </CardTitle>
            <Button variant="ghost" size="icon" onClick={loadNewsData} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading && trendingTopics.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white/50 animate-pulse h-16 rounded-lg"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {trendingTopics.map((topic, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg p-4 border border-purple-200 hover:border-purple-300 transition-all duration-200 hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm text-gray-900 mb-1">{topic.topic}</h4>
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <span>{formatMentions(topic.mentions)} mentions</span>
                      </div>
                    </div>
                    <div className="ml-2">{getTrendIcon(topic.trend)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Latest News Section */}
      <Card className="border-2 border-blue-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl flex items-center gap-2">
            <Newspaper className="h-5 w-5 text-blue-600" />
            Latest Crypto News
          </CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="bg-red-50 p-4 rounded-md text-red-800">
              <p className="font-medium">Error loading news</p>
              <p className="text-sm">{error}</p>
              <Button variant="outline" size="sm" className="mt-2 bg-transparent" onClick={loadNewsData}>
                Retry
              </Button>
            </div>
          ) : loading && news.length === 0 ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-gray-100 animate-pulse h-24 rounded-lg"></div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {news.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-300 transition-all duration-200 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <Badge className={`${getCategoryColor(item.category)} text-xs border`}>{item.category}</Badge>
                        <Badge
                          variant="outline"
                          className={`${getSentimentColor(item.sentiment)} text-xs border capitalize`}
                        >
                          {item.sentiment}
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{item.title}</h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.summary}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTimeAgo(item.timestamp)}
                        </span>
                        <span className="font-medium">{item.source}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
