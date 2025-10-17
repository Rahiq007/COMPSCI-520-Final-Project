"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, Loader2, Play, RefreshCw } from "lucide-react"

interface TestResult {
  ticker: string
  name: string
  type: string
  status: string
  currentPrice?: number
  responseTime?: string
  error?: string
  timestamp: string
}

interface TestSummary {
  total: number
  successful: number
  failed: number
  timestamp: string
}

export default function SystemTester() {
  const [isRunning, setIsRunning] = useState(false)
  const [testResults, setTestResults] = useState<TestResult[]>([])
  const [testSummary, setTestSummary] = useState<TestSummary | null>(null)

  const runSystemTest = async () => {
    setIsRunning(true)
    setTestResults([])
    setTestSummary(null)

    try {
      const response = await fetch("/api/test-analysis")
      const data = await response.json()

      setTestResults(data.results)
      setTestSummary(data.testSummary)
    } catch (error) {
      console.error("Test failed:", error)
    } finally {
      setIsRunning(false)
    }
  }

  const runFullAnalysisTest = async (ticker: string) => {
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticker,
          shares: 100,
          timeframe: "1m",
        }),
      })

      if (response.ok) {
        const data = await response.json()
        alert(
          `✅ Full analysis successful for ${ticker}!\nCurrent Price: $${data.currentPrice.toFixed(2)}\nPrediction: ${data.prediction.recommendation}`,
        )
      } else {
        const error = await response.json()
        alert(`❌ Analysis failed for ${ticker}: ${error.error}`)
      }
    } catch (error: any) {
      alert(`❌ Analysis failed for ${ticker}: ${error.message}`)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="h-5 w-5" />
          System Testing
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={runSystemTest} disabled={isRunning} className="flex items-center gap-2">
            {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Test Data Sources
          </Button>
        </div>

        {testSummary && (
          <Alert>
            <AlertDescription>
              <strong>Test Summary:</strong> {testSummary.successful}/{testSummary.total} sources working properly
              {testSummary.failed > 0 && <span className="text-red-600"> ({testSummary.failed} failed)</span>}
            </AlertDescription>
          </Alert>
        )}

        {testResults.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium">Test Results:</h4>
            {testResults.map((result, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {result.status === "success" ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-500" />
                  )}
                  <div>
                    <div className="font-medium">
                      {result.ticker} - {result.name}
                    </div>
                    <div className="text-sm text-gray-600">{result.type}</div>
                    {result.error && <div className="text-sm text-red-600">{result.error}</div>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {result.status === "success" && (
                    <>
                      <Badge variant="outline">${result.currentPrice?.toFixed(2)}</Badge>
                      <Badge variant="secondary">{result.responseTime}</Badge>
                      <Button size="sm" variant="outline" onClick={() => runFullAnalysisTest(result.ticker)}>
                        Full Test
                      </Button>
                    </>
                  )}
                  {result.status === "error" && <Badge variant="destructive">Failed</Badge>}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="pt-4 border-t">
          <h4 className="font-medium mb-2">Manual Testing Instructions:</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p>1. Go to the "Analysis" tab</p>
            <p>2. Try these test cases:</p>
            <ul className="ml-4 space-y-1">
              <li>
                • <strong>AAPL</strong> - Large cap, high volume stock
              </li>
              <li>
                • <strong>TSLA</strong> - High volatility, growth stock
              </li>
              <li>
                • <strong>SPY</strong> - Index fund, stable data
              </li>
              <li>
                • <strong>MSFT</strong> - Blue chip, reliable data
              </li>
              <li>
                • <strong>INVALID</strong> - Test error handling
              </li>
            </ul>
            <p>3. Check the "Monitor" tab for API usage tracking</p>
            <p>4. Verify the "Sources" tab shows active connections</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
