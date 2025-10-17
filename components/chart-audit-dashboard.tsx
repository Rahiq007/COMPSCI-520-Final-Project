"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertTriangle, XCircle, RefreshCw, TrendingUp, Database, Shield, Activity } from "lucide-react"
import { ChartDataValidator } from "@/lib/services/chart-data-validator"
import { RealTimeDataSync } from "@/lib/services/real-time-data-sync"

interface ChartAuditDashboardProps {
  ticker: string
  chartData: any[]
  executiveSummaryData?: any
}

export default function ChartAuditDashboard({ ticker, chartData, executiveSummaryData }: ChartAuditDashboardProps) {
  const [auditResults, setAuditResults] = useState<any>(null)
  const [isAuditing, setIsAuditing] = useState(false)
  const [lastAudit, setLastAudit] = useState<Date | null>(null)
  const [consistencyCheck, setConsistencyCheck] = useState<any>(null)

  const performComprehensiveAudit = async () => {
    setIsAuditing(true)
    try {
      // Calculate mock statistics for validation
      const mockStats = {
        minPrice: Math.min(...chartData.map((d) => d.close)),
        maxPrice: Math.max(...chartData.map((d) => d.close)),
        avgPrice: chartData.reduce((sum, d) => sum + d.close, 0) / chartData.length,
        priceChange: chartData[chartData.length - 1]?.close - chartData[0]?.close,
        priceChangePercent:
          ((chartData[chartData.length - 1]?.close - chartData[0]?.close) / chartData[0]?.close) * 100,
        isPositive: chartData[chartData.length - 1]?.close - chartData[0]?.close >= 0,
      }

      // Perform comprehensive audit
      const audit = ChartDataValidator.performComprehensiveAudit(chartData, mockStats)
      setAuditResults(audit)

      // Check consistency with executive summary
      if (executiveSummaryData) {
        const dataSync = RealTimeDataSync.getInstance()
        const consistency = dataSync.validateConsistency({ chartData, priceStats: mockStats }, executiveSummaryData)
        setConsistencyCheck(consistency)
      }

      setLastAudit(new Date())
    } catch (error) {
      console.error("Audit failed:", error)
    } finally {
      setIsAuditing(false)
    }
  }

  useEffect(() => {
    if (chartData.length > 0) {
      performComprehensiveAudit()
    }
  }, [chartData, executiveSummaryData])

  const getStatusIcon = (accuracy: number) => {
    if (accuracy >= 99.9) return <CheckCircle className="h-5 w-5 text-green-500" />
    if (accuracy >= 95) return <AlertTriangle className="h-5 w-5 text-yellow-500" />
    return <XCircle className="h-5 w-5 text-red-500" />
  }

  const getStatusColor = (accuracy: number) => {
    if (accuracy >= 99.9) return "text-green-600"
    if (accuracy >= 95) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Chart Data Audit Dashboard
            </CardTitle>
            <CardDescription>Comprehensive validation and accuracy monitoring for {ticker} price data</CardDescription>
          </div>
          <Button onClick={performComprehensiveAudit} disabled={isAuditing} variant="outline" size="sm">
            <RefreshCw className={`h-4 w-4 mr-2 ${isAuditing ? "animate-spin" : ""}`} />
            {isAuditing ? "Auditing..." : "Run Audit"}
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Overall Status */}
        {auditResults && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-2 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Overall Accuracy</p>
                    <p className={`text-2xl font-bold ${getStatusColor(auditResults.auditReport.accuracy)}`}>
                      {auditResults.auditReport.accuracy.toFixed(2)}%
                    </p>
                  </div>
                  {getStatusIcon(auditResults.auditReport.accuracy)}
                </div>
                <Progress value={auditResults.auditReport.accuracy} className="mt-2" />
              </CardContent>
            </Card>

            <Card className="border-2 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Valid Data Points</p>
                    <p className="text-2xl font-bold text-green-600">{auditResults.auditReport.validDataPoints}</p>
                  </div>
                  <Database className="h-5 w-5 text-green-500" />
                </div>
                <p className="text-xs text-gray-500 mt-1">of {auditResults.auditReport.dataPoints} total</p>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Error Rate</p>
                    <p
                      className={`text-2xl font-bold ${
                        auditResults.auditReport.errorRate < 0.1 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {auditResults.auditReport.errorRate.toFixed(4)}%
                    </p>
                  </div>
                  <Activity className="h-5 w-5 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Consistency Check */}
        {consistencyCheck && (
          <Card className={`border-2 ${consistencyCheck.isConsistent ? "border-green-200" : "border-yellow-200"}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5" />
                Executive Summary Consistency
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-600">Consistency Score</p>
                  <p
                    className={`text-xl font-bold ${consistencyCheck.isConsistent ? "text-green-600" : "text-yellow-600"}`}
                  >
                    {consistencyCheck.accuracy.toFixed(2)}%
                  </p>
                </div>
                <Badge variant={consistencyCheck.isConsistent ? "default" : "secondary"}>
                  {consistencyCheck.isConsistent ? "Consistent" : "Minor Discrepancies"}
                </Badge>
              </div>

              {consistencyCheck.discrepancies.length > 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Discrepancies Found:</strong>
                    <ul className="mt-2 space-y-1">
                      {consistencyCheck.discrepancies.map((discrepancy: string, index: number) => (
                        <li key={index} className="text-sm">
                          • {discrepancy}
                        </li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* Detailed Audit Results */}
        {auditResults && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Errors */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <XCircle className="h-5 w-5 text-red-500" />
                  Data Errors ({auditResults.errors.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {auditResults.errors.length === 0 ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">No errors detected</span>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {auditResults.errors.map((error: string, index: number) => (
                      <div key={index} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                        {error}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Warnings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  Warnings ({auditResults.warnings.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {auditResults.warnings.length === 0 ? (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">No warnings</span>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {auditResults.warnings.map((warning: string, index: number) => (
                      <div key={index} className="text-sm text-yellow-600 bg-yellow-50 p-2 rounded">
                        {warning}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Audit Metadata */}
        {lastAudit && (
          <Card className="bg-gray-50">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Last Audit</p>
                  <p className="font-semibold">{lastAudit.toLocaleTimeString()}</p>
                </div>
                <div>
                  <p className="text-gray-600">Ticker</p>
                  <p className="font-semibold">{ticker}</p>
                </div>
                <div>
                  <p className="text-gray-600">Data Points</p>
                  <p className="font-semibold">{chartData.length}</p>
                </div>
                <div>
                  <p className="text-gray-600">Status</p>
                  <Badge variant={auditResults?.isValid ? "default" : "destructive"}>
                    {auditResults?.isValid ? "Valid" : "Issues Found"}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recommendations */}
        {auditResults && !auditResults.isValid && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Recommendations:</strong>
              <ul className="mt-2 space-y-1 text-sm">
                <li>• Review and correct data validation errors</li>
                <li>• Ensure OHLC price consistency</li>
                <li>• Verify technical indicator calculations</li>
                <li>• Check data source reliability</li>
                <li>• Implement real-time data validation</li>
              </ul>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
