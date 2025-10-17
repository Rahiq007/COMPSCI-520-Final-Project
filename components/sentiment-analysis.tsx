"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Newspaper, TrendingUp, BarChart2 } from "lucide-react"
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  ReferenceLine,
} from "recharts"

interface SentimentAnalysisProps {
  data: {
    news: number
    social: number
    overall: number
    historicalSentiment: {
      date: string
      sentiment: number
    }[]
    sources: {
      name: string
      sentiment: number
      volume: number
    }[]
  }
}

export default function SentimentAnalysis({ data }: SentimentAnalysisProps) {
  const getSentimentLabel = (score: number) => {
    if (score > 0.6) return { label: "Positive", color: "bg-green-500" }
    if (score < 0.4) return { label: "Negative", color: "bg-red-500" }
    return { label: "Neutral", color: "bg-yellow-500" }
  }

  const getSentimentColor = (score: number) => {
    if (score > 0.6) return "#10b981" // green
    if (score < 0.4) return "#ef4444" // red
    return "#f59e0b" // yellow
  }

  const newsSentiment = getSentimentLabel(data.news)
  const socialSentiment = getSentimentLabel(data.social)
  const overallSentiment = getSentimentLabel(data.overall)

  // Prepare data for pie chart
  const pieData = data.sources.map((source) => ({
    name: source.name,
    value: source.volume,
    sentiment: source.sentiment,
  }))

  // Prepare data for line chart
  const lineData = data.historicalSentiment.map((item) => ({
    date: item.date,
    sentiment: item.sentiment,
  }))

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Newspaper className="h-5 w-5" />
              News Sentiment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">{(data.news * 100).toFixed(0)}%</div>
              <Badge className={`${newsSentiment.color} text-white`}>{newsSentiment.label}</Badge>
            </div>
            <Progress value={data.news * 100} className="h-3" />
            <p className="text-sm text-gray-600 text-center">Based on recent financial news and press releases</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageSquare className="h-5 w-5" />
              Social Media
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">{(data.social * 100).toFixed(0)}%</div>
              <Badge className={`${socialSentiment.color} text-white`}>{socialSentiment.label}</Badge>
            </div>
            <Progress value={data.social * 100} className="h-3" />
            <p className="text-sm text-gray-600 text-center">Twitter, Reddit, and StockTwits analysis</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5" />
              Overall Sentiment
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-3xl font-bold mb-2">{(data.overall * 100).toFixed(0)}%</div>
              <Badge className={`${overallSentiment.color} text-white`}>{overallSentiment.label}</Badge>
            </div>
            <Progress value={data.overall * 100} className="h-3" />
            <p className="text-sm text-gray-600 text-center">Weighted average of all sentiment sources</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart2 className="h-5 w-5" />
              Sentiment by Source
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
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
                    nameKey="name"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number, name: string, props: any) => {
                      const sentiment = props.payload.sentiment
                      return [`Volume: ${value}`, `${name} (Sentiment: ${(sentiment * 100).toFixed(0)}%)`]
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Sentiment Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={(value) => new Date(value).toLocaleDateString()}
                    minTickGap={30}
                  />
                  <YAxis domain={[0, 1]} tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
                  <Tooltip
                    formatter={(value: number) => [`${(value * 100).toFixed(1)}%`, "Sentiment"]}
                    labelFormatter={(label) => new Date(label).toLocaleDateString()}
                  />
                  <Line
                    type="monotone"
                    dataKey="sentiment"
                    stroke="#8884d8"
                    strokeWidth={2}
                    dot={{ fill: "#8884d8", r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <ReferenceLine y={0.5} stroke="gray" strokeDasharray="3 3" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
