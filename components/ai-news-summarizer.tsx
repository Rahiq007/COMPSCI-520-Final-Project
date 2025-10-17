"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Newspaper, Sparkles, Loader2, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface NewsSummary {
  keyPoints: string[]
  sentiment: "positive" | "negative" | "neutral"
  impact: "high" | "medium" | "low"
  summary: string
}

interface AINewsSummarizerProps {
  ticker: string
  news: any[]
}

export default function AINewsSummarizer({ ticker, news }: AINewsSummarizerProps) {
  const [summary, setSummary] = useState<NewsSummary | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const generateSummary = async () => {
    if (!news || news.length === 0) {
      toast({
        title: "No News Available",
        description: "No news articles found to summarize",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/summarize-news", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker, news }),
      })

      if (!response.ok) throw new Error("Failed to generate summary")

      const data = await response.json()
      setSummary(data.summary)

      toast({
        title: "Summary Generated",
        description: "AI has analyzed the latest news",
      })
    } catch (error) {
      console.error("Summary error:", error)
      toast({
        title: "Summary Failed",
        description: "Unable to generate news summary",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case "positive":
        return "bg-green-500"
      case "negative":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high":
        return "border-red-500 text-red-700"
      case "medium":
        return "border-orange-500 text-orange-700"
      default:
        return "border-blue-500 text-blue-700"
    }
  }

  return (
    <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-blue-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Newspaper className="h-5 w-5 text-purple-600" />
            <CardTitle className="text-lg">AI News Summarizer</CardTitle>
            <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-300">
              <Sparkles className="h-3 w-3 mr-1" />
              AI Powered
            </Badge>
          </div>
          <Button
            onClick={generateSummary}
            disabled={isLoading || !news || news.length === 0}
            size="sm"
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Summarize News
              </>
            )}
          </Button>
        </div>
        <CardDescription>AI-generated summary of latest {ticker} news in 30 seconds</CardDescription>
      </CardHeader>

      {summary && (
        <CardContent className="space-y-4">
          {/* Summary Overview */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={getSentimentColor(summary.sentiment)}>
              {summary.sentiment.toUpperCase()} Sentiment
            </Badge>
            <Badge variant="outline" className={getImpactColor(summary.impact)}>
              {summary.impact.toUpperCase()} Impact
            </Badge>
          </div>

          {/* Main Summary */}
          <div className="bg-white p-4 rounded-lg border-2 border-purple-200">
            <p className="text-sm text-gray-700 leading-relaxed">{summary.summary}</p>
          </div>

          {/* Key Points */}
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-600" />
              Key Takeaways
            </h4>
            <ul className="space-y-2">
              {summary.keyPoints.map((point, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <span className="flex-shrink-0 h-5 w-5 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold mt-0.5">
                    {index + 1}
                  </span>
                  <span className="text-gray-700">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      )}
    </Card>
  )
}

