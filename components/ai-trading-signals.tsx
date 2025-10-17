"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Minus, Zap, Target } from "lucide-react"
import { cn } from "@/lib/utils"

interface TradingSignal {
  signal: "BUY" | "SELL" | "HOLD"
  strength: "STRONG" | "MODERATE" | "WEAK"
  reason: string
  confidence: number
}

interface AITradingSignalsProps {
  stockData: any
}

export default function AITradingSignals({ stockData }: AITradingSignalsProps) {
  const [signal, setSignal] = useState<TradingSignal | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (stockData) {
      generateSignal()
    }
  }, [stockData?.ticker])

  const generateSignal = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/trading-signal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stockData }),
      })

      if (response.ok) {
        const data = await response.json()
        setSignal(data.signal)
      }
    } catch (error) {
      console.error("Signal error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading || !signal) {
    return (
      <Card className="border-2 border-blue-200">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-600" />
            AI Trading Signal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-32 flex items-center justify-center">
            <div className="animate-pulse text-gray-500">Generating signal...</div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getSignalColor = () => {
    switch (signal.signal) {
      case "BUY":
        return "bg-gradient-to-r from-green-500 to-emerald-600"
      case "SELL":
        return "bg-gradient-to-r from-red-500 to-rose-600"
      default:
        return "bg-gradient-to-r from-gray-500 to-slate-600"
    }
  }

  const getSignalIcon = () => {
    switch (signal.signal) {
      case "BUY":
        return <TrendingUp className="h-8 w-8" />
      case "SELL":
        return <TrendingDown className="h-8 w-8" />
      default:
        return <Minus className="h-8 w-8" />
    }
  }

  const getStrengthBars = () => {
    const bars = signal.strength === "STRONG" ? 3 : signal.strength === "MODERATE" ? 2 : 1
    return (
      <div className="flex gap-1">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={cn(
              "h-2 w-8 rounded-full transition-all",
              i <= bars ? "bg-white opacity-100" : "bg-white opacity-30",
            )}
          />
        ))}
      </div>
    )
  }

  return (
    <Card className="border-2 border-blue-200 overflow-hidden">
      <CardHeader className={cn("text-white", getSignalColor())}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap className="h-5 w-5" />
            AI Trading Signal
          </CardTitle>
          <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
            <Target className="h-3 w-3 mr-1" />
            {signal.confidence}% Confidence
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-4">
        {/* Main Signal */}
        <div className={cn("rounded-xl p-6 text-white shadow-lg", getSignalColor())}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {getSignalIcon()}
              <div>
                <div className="text-3xl font-bold">{signal.signal}</div>
                <div className="text-sm opacity-90">{signal.strength} Signal</div>
              </div>
            </div>
            {getStrengthBars()}
          </div>
        </div>

        {/* Reason */}
        <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-100">
          <div className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-1">Signal Reasoning</div>
          <div className="text-sm text-gray-700">{signal.reason}</div>
        </div>

        {/* Disclaimer */}
        <div className="text-xs text-gray-500 italic">
          ⚠️ This is AI-generated analysis. Not financial advice. Always do your own research.
        </div>
      </CardContent>
    </Card>
  )
}

