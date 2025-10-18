"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Newspaper, Calendar, ExternalLink, Search } from "lucide-react"

interface NewsItem {
  title: string
  source: string
  date: string
  url: string
  sentiment: number
  summary: string
}

interface NewsAnalysisProps {
  news: {
    recent: NewsItem[]
    trending: NewsItem[]
  }
}

export default function NewsAnalysis({ news }: NewsAnalysisProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const getSentimentBadge = (sentiment: number) => {
    if (sentiment > 0.6) return <Badge className="bg-green-500">Positive</Badge>
    if (sentiment < 0.4) return <Badge className="bg-red-500">Negative</Badge>
    return <Badge className="bg-yellow-500">Neutral</Badge>
  }

  const filterNews = (items: NewsItem[]) => {
    if (!searchTerm) return items

    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.summary.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }

  const filteredRecent = filterNews(news.recent)
  const filteredTrending = filterNews(news.trending)

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-gray-500" />
        <Input
          placeholder="Search news articles..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-md"
        />
      </div>

      <Tabs defaultValue="recent" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="recent">Recent News</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
        </TabsList>

        <TabsContent value="recent">
          <div className="space-y-4">
            {filteredRecent.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No news articles found matching your search.</p>
            ) : (
              filteredRecent.map((item, index) => <NewsCard key={index} item={item} />)
            )}
          </div>
        </TabsContent>

        <TabsContent value="trending">
          <div className="space-y-4">
            {filteredTrending.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No trending articles found matching your search.</p>
            ) : (
              filteredTrending.map((item, index) => <NewsCard key={index} item={item} />)
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function NewsCard({ item }: { item: NewsItem }) {
  const getSentimentBadge = (sentiment: number) => {
    if (sentiment > 0.6) return <Badge className="bg-green-500">Positive</Badge>
    if (sentiment < 0.4) return <Badge className="bg-red-500">Negative</Badge>
    return <Badge className="bg-yellow-500">Neutral</Badge>
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col space-y-3">
          <div className="flex justify-between items-start">
            <h3 className="font-medium text-lg">{item.title}</h3>
            {getSentimentBadge(item.sentiment)}
          </div>

          <p className="text-sm text-gray-600">{item.summary}</p>

          <div className="flex justify-between items-center text-sm text-gray-500">
            <div className="flex items-center gap-2">
              <Newspaper className="h-4 w-4" />
              <span>{item.source}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{new Date(item.date).toLocaleDateString()}</span>
            </div>
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-blue-600 hover:underline"
            >
              Read more <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
