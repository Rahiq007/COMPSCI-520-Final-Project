"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, AlertCircle, Zap } from "lucide-react"

interface ApiSource {
  name: string
  status: string
  priority: number
  features: string[]
}

export default function ApiSourceIndicator() {
  const [sources, setSources] = useState<ApiSource[]>([])
  const [activeSources, setActiveSources] = useState<string[]>([])

  useEffect(() => {
    const checkApiSources = async () => {
      try {
        const response = await fetch("/api/health")
        const data = await response.json()

        const sourceList: ApiSource[] = [
          {
            name: "Finnhub",
            status: data.services.finnhub,
            priority: 1,
            features: ["Real-time quotes", "Company profiles", "News", "Earnings"],
          },
          {
            name: "Yahoo Finance",
            status: data.services.yahooFinance,
            priority: 2,
            features: ["Historical data", "Company info", "Free access"],
          },
          {
            name: "Polygon.io",
            status: data.services.polygonIo === "configured" ? "available" : "not_configured",
            priority: 3,
            features: ["High-quality data", "Technical indicators", "Market status"],
          },
          {
            name: "Twelve Data",
            status: data.services.twelveData === "configured" ? "available" : "not_configured",
            priority: 4,
            features: ["Technical analysis", "Built-in indicators", "Forex & Crypto"],
          },
          {
            name: "Alpha Vantage",
            status: data.services.alphaVantage === "configured" ? "available" : "not_configured",
            priority: 5,
            features: ["Legacy support", "Technical indicators", "News sentiment"],
          },
        ]

        setSources(sourceList)
        setActiveSources(
          sourceList.filter((s) => s.status === "connected" || s.status === "available").map((s) => s.name),
        )
      } catch (error) {
        console.error("Failed to check API sources:", error)
      }
    }

    checkApiSources()
    const interval = setInterval(checkApiSources, 60000) // Check every minute
    return () => clearInterval(interval)
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "connected":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "available":
        return <Zap className="h-4 w-4 text-blue-500" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "connected":
        return <Badge className="bg-green-500">Active</Badge>
      case "available":
        return <Badge className="bg-blue-500">Ready</Badge>
      case "error":
        return <Badge className="bg-red-500">Error</Badge>
      default:
        return <Badge variant="outline">Not Configured</Badge>
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Data Sources</CardTitle>
        <p className="text-sm text-gray-600">Active sources: {activeSources.length} | Fallback chain configured</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {sources
          .sort((a, b) => a.priority - b.priority)
          .map((source) => (
            <div key={source.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(source.status)}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{source.name}</span>
                    <span className="text-xs text-gray-500">Priority {source.priority}</span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {source.features.slice(0, 2).join(", ")}
                    {source.features.length > 2 && ` +${source.features.length - 2} more`}
                  </div>
                </div>
              </div>
              {getStatusBadge(source.status)}
            </div>
          ))}

        <div className="pt-2 border-t">
          <p className="text-xs text-gray-500">
            System automatically falls back to next available source if primary fails
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
