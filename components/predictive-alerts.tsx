"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Bell, Clock, Eye, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface Alert {
  checkBackIn: string
  watchFor: string
  priority: "high" | "medium" | "low"
  reason: string
}

interface PredictiveAlertsProps {
  ticker: string
  prediction: any
  volatility: number
}

export default function PredictiveAlerts({ ticker, prediction, volatility }: PredictiveAlertsProps) {
  const [alert, setAlert] = useState<Alert | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (ticker && prediction) {
      generateAlert()
    }
  }, [ticker])

  const generateAlert = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/predictive-alert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticker, prediction, volatility }),
      })

      if (response.ok) {
        const data = await response.json()
        setAlert(data.alert)
      }
    } catch (error) {
      console.error("Alert error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-700 border-red-300"
      case "medium":
        return "bg-orange-100 text-orange-700 border-orange-300"
      default:
        return "bg-blue-100 text-blue-700 border-blue-300"
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return "🔴"
      case "medium":
        return "🟡"
      default:
        return "🔵"
    }
  }

  if (isLoading || !alert) {
    return (
      <Card className="border-2 border-orange-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="h-5 w-5 text-orange-600" />
            Smart Reminders
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-32 flex items-center justify-center">
            <div className="animate-pulse text-gray-500">Analyzing...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-2 border-orange-200 bg-gradient-to-br from-orange-50 to-yellow-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Bell className="h-5 w-5 text-orange-600" />
            Smart Reminders
          </CardTitle>
          <Badge variant="outline" className={cn("border-2", getPriorityColor(alert.priority))}>
            {getPriorityIcon(alert.priority)} {alert.priority.toUpperCase()} Priority
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Check Back Reminder */}
        <div className="bg-white rounded-lg p-4 border-2 border-orange-200 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-r from-orange-500 to-yellow-500 flex items-center justify-center">
              <Clock className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-gray-900 mb-1">⏰ Check Back In</div>
              <div className="text-lg font-bold text-orange-700">{alert.checkBackIn}</div>
            </div>
          </div>
        </div>

        {/* Watch For */}
        <div className="bg-white rounded-lg p-4 border-2 border-orange-200 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
              <Eye className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-gray-900 mb-1">👀 Watch For</div>
              <div className="text-sm text-gray-700">{alert.watchFor}</div>
            </div>
          </div>
        </div>

        {/* Reason */}
        <div className="bg-orange-100 rounded-lg p-4 border-2 border-orange-200">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-orange-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-gray-700">{alert.reason}</div>
          </div>
        </div>

        {/* Action Button (visual only) */}
        <div className="pt-2">
          <button className="w-full py-2 px-4 bg-gradient-to-r from-orange-600 to-yellow-600 hover:from-orange-700 hover:to-yellow-700 text-white rounded-lg font-semibold text-sm transition-all shadow-md hover:shadow-lg">
            🔔 Set Reminder
          </button>
        </div>
      </CardContent>
    </Card>
  )
}

