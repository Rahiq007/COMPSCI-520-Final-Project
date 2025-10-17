"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { PieChart, TrendingUp, TrendingDown, Plus, X, Sparkles, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface PortfolioItem {
  ticker: string
  shares: number
  currentPrice: number
  allocation?: number
}

interface Rebalancing {
  action: "BUY" | "SELL"
  ticker: string
  percentage: string
  reason: string
}

interface Optimization {
  assessment: string
  suggestions: string[]
  rebalancing: Rebalancing[]
  riskScore: number
}

export default function AIPortfolioOptimizer() {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([])
  const [newItem, setNewItem] = useState({ ticker: "", shares: "", price: "" })
  const [optimization, setOptimization] = useState<Optimization | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const addItem = () => {
    if (!newItem.ticker || !newItem.shares || !newItem.price) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    const item: PortfolioItem = {
      ticker: newItem.ticker.toUpperCase(),
      shares: Number.parseFloat(newItem.shares),
      currentPrice: Number.parseFloat(newItem.price),
    }

    setPortfolio([...portfolio, item])
    setNewItem({ ticker: "", shares: "", price: "" })
  }

  const removeItem = (index: number) => {
    setPortfolio(portfolio.filter((_, i) => i !== index))
  }

  const optimizePortfolio = async () => {
    if (portfolio.length === 0) {
      toast({
        title: "Empty Portfolio",
        description: "Add at least one stock to optimize",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      // Calculate allocations
      const totalValue = portfolio.reduce((sum, p) => sum + p.shares * p.currentPrice, 0)
      const portfolioWithAllocations = portfolio.map((p) => ({
        ...p,
        allocation: ((p.shares * p.currentPrice) / totalValue) * 100,
      }))

      const response = await fetch("/api/optimize-portfolio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ portfolio: portfolioWithAllocations }),
      })

      if (!response.ok) throw new Error("Failed to optimize portfolio")

      const data = await response.json()
      setOptimization(data.optimization)

      toast({
        title: "Portfolio Optimized",
        description: "AI has analyzed your portfolio",
      })
    } catch (error) {
      console.error("Optimization error:", error)
      toast({
        title: "Optimization Failed",
        description: "Unable to optimize portfolio",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getRiskColor = (score: number) => {
    if (score >= 70) return "text-red-600 bg-red-100 border-red-300"
    if (score >= 40) return "text-orange-600 bg-orange-100 border-orange-300"
    return "text-green-600 bg-green-100 border-green-300"
  }

  const totalValue = portfolio.reduce((sum, p) => sum + p.shares * p.currentPrice, 0)

  return (
    <Card className="border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <PieChart className="h-5 w-5 text-indigo-600" />
              AI Portfolio Optimizer
            </CardTitle>
            <CardDescription>Get AI-powered rebalancing suggestions</CardDescription>
          </div>
          <Badge variant="outline" className="bg-indigo-100 text-indigo-700 border-indigo-300">
            <Sparkles className="h-3 w-3 mr-1" />
            AI Powered
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Add Holdings */}
        <div className="bg-white rounded-lg p-4 border-2 border-indigo-200 space-y-3">
          <h4 className="text-sm font-semibold text-gray-900">Add Holdings</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div>
              <Label htmlFor="ticker" className="text-xs">
                Ticker
              </Label>
              <Input
                id="ticker"
                placeholder="AAPL"
                value={newItem.ticker}
                onChange={(e) => setNewItem({ ...newItem, ticker: e.target.value.toUpperCase() })}
                className="h-8"
              />
            </div>
            <div>
              <Label htmlFor="shares" className="text-xs">
                Shares
              </Label>
              <Input
                id="shares"
                type="number"
                placeholder="100"
                value={newItem.shares}
                onChange={(e) => setNewItem({ ...newItem, shares: e.target.value })}
                className="h-8"
              />
            </div>
            <div>
              <Label htmlFor="price" className="text-xs">
                Price
              </Label>
              <Input
                id="price"
                type="number"
                placeholder="150.00"
                value={newItem.price}
                onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                className="h-8"
              />
            </div>
          </div>
          <Button onClick={addItem} size="sm" className="w-full" variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Add to Portfolio
          </Button>
        </div>

        {/* Current Holdings */}
        {portfolio.length > 0 && (
          <div className="bg-white rounded-lg p-4 border-2 border-indigo-200 space-y-2">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-gray-900">Current Holdings</h4>
              <div className="text-sm font-semibold text-indigo-700">Total: ${totalValue.toFixed(2)}</div>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {portfolio.map((item, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                  <div className="flex-1">
                    <span className="font-semibold text-sm">{item.ticker}</span>
                    <span className="text-xs text-gray-600 ml-2">
                      {item.shares} × ${item.currentPrice.toFixed(2)} = ${(item.shares * item.currentPrice).toFixed(2)}
                    </span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => removeItem(index)} className="h-6 w-6 p-0">
                    <X className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Optimize Button */}
        <Button
          onClick={optimizePortfolio}
          disabled={isLoading || portfolio.length === 0}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Optimizing...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Optimize Portfolio
            </>
          )}
        </Button>

        {/* Optimization Results */}
        {optimization && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
            {/* Risk Score */}
            <div className={`rounded-lg p-4 border-2 ${getRiskColor(optimization.riskScore)}`}>
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">Portfolio Risk Score</div>
                <div className="text-2xl font-bold">{optimization.riskScore}/100</div>
              </div>
            </div>

            {/* Assessment */}
            <div className="bg-white rounded-lg p-4 border-2 border-indigo-200">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">📊 Assessment</h4>
              <p className="text-sm text-gray-700">{optimization.assessment}</p>
            </div>

            {/* Suggestions */}
            <div className="bg-white rounded-lg p-4 border-2 border-indigo-200">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">💡 Suggestions</h4>
              <ul className="space-y-2">
                {optimization.suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="text-indigo-600">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Rebalancing */}
            {optimization.rebalancing.length > 0 && (
              <div className="bg-white rounded-lg p-4 border-2 border-indigo-200">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">🔄 Recommended Rebalancing</h4>
                <div className="space-y-2">
                  {optimization.rebalancing.map((action, index) => (
                    <div key={index} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                      <div className="flex-shrink-0">
                        {action.action === "BUY" ? (
                          <TrendingUp className="h-5 w-5 text-green-600" />
                        ) : (
                          <TrendingDown className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-sm">
                          {action.action} {action.ticker} ({action.percentage})
                        </div>
                        <div className="text-xs text-gray-600">{action.reason}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

