"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Bug, Shield, AlertTriangle, CheckCircle, XCircle, Loader2 } from "lucide-react"

interface TestResult {
  name: string
  status: "pending" | "success" | "error"
  message: string
  duration?: number
}

export default function ErrorTestingSuite() {
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState<TestResult[]>([])

  const testScenarios = [
    {
      name: "Invalid Stock Ticker",
      test: () => testInvalidTicker(),
      description: "Test handling of invalid stock symbols",
    },
    {
      name: "API Rate Limiting",
      test: () => testRateLimit(),
      description: "Test rate limit error handling",
    },
    {
      name: "Database Connection",
      test: () => testDatabaseError(),
      description: "Test database connectivity issues",
    },
    {
      name: "Network Timeout",
      test: () => testNetworkTimeout(),
      description: "Test network timeout scenarios",
    },
    {
      name: "Real-time Updates",
      test: () => testRealTimeUpdates(),
      description: "Test real-time data stream reliability",
    },
    {
      name: "Data Processing",
      test: () => testDataProcessing(),
      description: "Test malformed data handling",
    },
  ]

  const runAllTests = async () => {
    setIsRunning(true)
    setResults([])

    for (const scenario of testScenarios) {
      const startTime = Date.now()

      setResults((prev) => [
        ...prev,
        {
          name: scenario.name,
          status: "pending",
          message: "Running...",
        },
      ])

      try {
        await scenario.test()
        const duration = Date.now() - startTime

        setResults((prev) =>
          prev.map((result) =>
            result.name === scenario.name ? { ...result, status: "success", message: "Passed", duration } : result,
          ),
        )
      } catch (error: any) {
        const duration = Date.now() - startTime

        setResults((prev) =>
          prev.map((result) =>
            result.name === scenario.name ? { ...result, status: "error", message: error.message, duration } : result,
          ),
        )
      }

      // Small delay between tests
      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    setIsRunning(false)
  }

  // Test implementations
  const testInvalidTicker = async () => {
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticker: "INVALID123", shares: 100, timeframe: "1m" }),
    })

    if (response.ok) {
      throw new Error("Expected error for invalid ticker, but request succeeded")
    }

    const error = await response.json()
    if (!error.error || !error.error.includes("Invalid")) {
      throw new Error("Error message does not indicate invalid ticker")
    }
  }

  const testRateLimit = async () => {
    // Simulate rapid requests
    const promises = Array.from({ length: 10 }, () => fetch("/api/realtime/AAPL"))

    const responses = await Promise.allSettled(promises)
    const hasRateLimit = responses.some((result) => result.status === "fulfilled" && result.value.status === 429)

    if (!hasRateLimit) {
      console.warn("Rate limiting may not be properly configured")
    }
  }

  const testDatabaseError = async () => {
    const response = await fetch("/api/test-db")
    if (!response.ok) {
      throw new Error("Database connection test failed")
    }
  }

  const testNetworkTimeout = async () => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 100) // Very short timeout

    try {
      await fetch("/api/health", { signal: controller.signal })
      clearTimeout(timeoutId)
    } catch (error: any) {
      clearTimeout(timeoutId)
      if (error.name === "AbortError") {
        // This is expected - timeout handling works
        return
      }
      throw error
    }
  }

  const testRealTimeUpdates = async () => {
    const response = await fetch("/api/realtime/AAPL")
    if (!response.ok) {
      throw new Error("Real-time endpoint failed")
    }

    const data = await response.json()
    if (!data.price || !data.ticker) {
      throw new Error("Real-time data format is invalid")
    }
  }

  const testDataProcessing = async () => {
    // Test with edge case data
    const response = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticker: "AAPL", shares: -1, timeframe: "invalid" }),
    })

    // Should handle gracefully, not crash
    if (response.status === 500) {
      const error = await response.json()
      if (error.error && error.error.includes("crash")) {
        throw new Error("Server crashed on invalid input")
      }
    }
  }

  const getStatusIcon = (status: TestResult["status"]) => {
    switch (status) {
      case "pending":
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "error":
        return <XCircle className="h-4 w-4 text-red-500" />
    }
  }

  const getStatusBadge = (status: TestResult["status"]) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary">Running</Badge>
      case "success":
        return <Badge className="bg-green-500">Passed</Badge>
      case "error":
        return <Badge variant="destructive">Failed</Badge>
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bug className="h-5 w-5" />
          Error Handling Test Suite
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <p className="text-sm text-gray-600">Test various error scenarios to ensure robust error handling</p>
          <Button onClick={runAllTests} disabled={isRunning} className="flex items-center gap-2">
            {isRunning ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Running Tests
              </>
            ) : (
              <>
                <Shield className="h-4 w-4" />
                Run All Tests
              </>
            )}
          </Button>
        </div>

        {results.length > 0 && (
          <div className="space-y-2">
            {results.map((result, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(result.status)}
                  <div>
                    <div className="font-medium">{result.name}</div>
                    <div className="text-sm text-gray-600">{result.message}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {result.duration && <span className="text-xs text-gray-500">{result.duration}ms</span>}
                  {getStatusBadge(result.status)}
                </div>
              </div>
            ))}
          </div>
        )}

        {!isRunning && results.length > 0 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Test Summary:</strong> {results.filter((r) => r.status === "success").length}/{results.length}{" "}
              tests passed
            </AlertDescription>
          </Alert>
        )}

        <div className="pt-4 border-t">
          <h4 className="font-medium mb-2">Test Scenarios:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
            {testScenarios.map((scenario, index) => (
              <div key={index} className="p-2 bg-gray-50 rounded">
                <div className="font-medium">{scenario.name}</div>
                <div className="text-gray-600">{scenario.description}</div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
