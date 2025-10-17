"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RefreshCw, CheckCircle, XCircle, AlertCircle } from "lucide-react"

interface SystemStatus {
  status: string
  services: {
    alphaVantage: string
    database: string
  }
  timestamp: string
}

export default function SystemStatus() {
  const [status, setStatus] = useState<SystemStatus | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const checkStatus = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/health")
      const data = await response.json()
      setStatus(data)
    } catch (error) {
      console.error("Failed to check system status:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkStatus()
    const interval = setInterval(checkStatus, 30000) // Check every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const getStatusIcon = (serviceStatus: string) => {
    switch (serviceStatus) {
      case "connected":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
    }
  }

  const getStatusBadge = (serviceStatus: string) => {
    switch (serviceStatus) {
      case "connected":
        return <Badge className="bg-green-500">Online</Badge>
      case "error":
        return <Badge className="bg-red-500">Offline</Badge>
      default:
        return <Badge className="bg-yellow-500">Unknown</Badge>
    }
  }

  if (!status) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span className="text-sm">Checking system status...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">System Status</CardTitle>
          <Button variant="outline" size="sm" onClick={checkStatus} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon(status.services.alphaVantage)}
            <span className="text-sm">Alpha Vantage API</span>
          </div>
          {getStatusBadge(status.services.alphaVantage)}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon(status.services.database)}
            <span className="text-sm">Database</span>
          </div>
          {getStatusBadge(status.services.database)}
        </div>

        <div className="pt-2 border-t">
          <p className="text-xs text-gray-500">Last updated: {new Date(status.timestamp).toLocaleTimeString()}</p>
        </div>
      </CardContent>
    </Card>
  )
}
