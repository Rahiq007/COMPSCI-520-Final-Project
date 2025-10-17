"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Target,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  DollarSign,
  Calendar,
  Shield,
} from "lucide-react"
import { safeCurrency, safeNumber } from "@/lib/utils/safe-formatters"

interface EnhancedAIAnalysisProps {
  analysis: any
  ticker: string
}

export default function EnhancedAIAnalysis({ analysis, ticker }: EnhancedAIAnalysisProps) {
  if (!analysis) return null

  const confidence = safeNumber(analysis.confidence, 0)
  const targetPrice = safeNumber(analysis.targetPrice, 0)
  const recommendation = analysis.recommendation || "HOLD"

  const getRecommendationConfig = (rec: string) => {
    switch (rec.toUpperCase()) {
      case "BUY":
        return {
          color: "bg-green-500",
          icon: TrendingUp,
          textColor: "text-green-700",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
        }
      case "SELL":
        return {
          color: "bg-red-500",
          icon: TrendingDown,
          textColor: "text-red-700",
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
        }
      case "HOLD":
        return {
          color: "bg-yellow-500",
          icon: BarChart3,
          textColor: "text-yellow-700",
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-200",
        }
      case "TRIM":
        return {
          color: "bg-orange-500",
          icon: TrendingDown,
          textColor: "text-orange-700",
          bgColor: "bg-orange-50",
          borderColor: "border-orange-200",
        }
      default:
        return {
          color: "bg-gray-500",
          icon: BarChart3,
          textColor: "text-gray-700",
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
        }
    }
  }

  // Ensure consistent target price from analysis data
  const getConsistentTargetPrice = () => {
    if (analysis?.targetPrice && analysis.targetPrice > 0) {
      return analysis.targetPrice
    }

    // Fallback to prediction data if available
    if (ticker && window.localStorage) {
      try {
        const savedState = localStorage.getItem("stockAnalysisState")
        if (savedState) {
          const parsed = JSON.parse(savedState)
          if (parsed.analysisData?.prediction?.targetPrice) {
            return parsed.analysisData.prediction.targetPrice
          }
        }
      } catch (e) {
        console.warn("Failed to get consistent target price:", e)
      }
    }

    return 0
  }

  const config = getRecommendationConfig(recommendation)
  const RecommendationIcon = config.icon

  const parseAnalysisText = (text: string) => {
    if (!text) return { sections: [], summary: "" }

    const sections = []
    const lines = text.split("\n").filter((line) => line.trim())

    let currentSection = null
    let summary = ""

    for (const line of lines) {
      if (line.includes("**") && line.includes(":")) {
        // This is a section header
        if (currentSection) {
          sections.push(currentSection)
        }
        currentSection = {
          title: line.replace(/\*\*/g, "").replace(":", "").trim(),
          content: [],
        }
      } else if (currentSection) {
        currentSection.content.push(line.trim())
      } else {
        summary += line + " "
      }
    }

    if (currentSection) {
      sections.push(currentSection)
    }

    return { sections, summary: summary.trim() }
  }

  const { sections, summary } = parseAnalysisText(analysis.reasoning || "")

  return (
    <Card className={`${config.borderColor} ${config.bgColor} border-2`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3">
            <div className="p-2 rounded-full bg-purple-100">
              <Brain className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">Groq AI Enhanced Analysis</div>
              <div className="text-sm text-gray-600 font-normal">Powered by Llama 3 70B</div>
            </div>
          </CardTitle>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-xs">
              {ticker.toUpperCase()}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {new Date().toLocaleDateString()}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Key Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Recommendation */}
          <div className={`p-4 rounded-lg ${config.bgColor} border ${config.borderColor}`}>
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-full ${config.color}`}>
                <RecommendationIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-sm text-gray-600">AI Recommendation</div>
                <div className={`text-lg font-bold ${config.textColor}`}>{recommendation}</div>
              </div>
            </div>
          </div>

          {/* Confidence */}
          <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-blue-500">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="text-sm text-gray-600">Confidence Level</div>
                <div className="text-lg font-bold text-blue-700">{confidence}%</div>
                <Progress value={confidence} className="mt-1 h-2" />
              </div>
            </div>
          </div>

          {/* Price Target */}
          <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-emerald-500">
                <Target className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-sm text-gray-600">AI Price Target</div>
                <div className="text-lg font-bold text-emerald-700">
                  {safeCurrency(getConsistentTargetPrice() || targetPrice)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Summary */}
        {summary && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Executive Summary
            </h3>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <p className="text-gray-700 leading-relaxed">{summary}</p>
            </div>
          </div>
        )}

        {/* Detailed Analysis Sections */}
        {sections.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Detailed Analysis
            </h3>
            <div className="grid gap-4">
              {sections.map((section, index) => (
                <div key={index} className="bg-white p-4 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    {getSectionIcon(section.title)}
                    {section.title}
                  </h4>
                  <div className="space-y-2">
                    {section.content.map((item: string, itemIndex: number) => (
                      <div key={itemIndex} className="text-gray-700">
                        {item.startsWith("*") ? (
                          <div className="flex items-start gap-2 ml-4">
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0" />
                            <span>{item.substring(1).trim()}</span>
                          </div>
                        ) : (
                          <p className="leading-relaxed">{item}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Disclaimer */}
        <Alert className="bg-amber-50 border-amber-200">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <strong>AI Analysis Disclaimer:</strong> This analysis is generated by AI and should be used for
            informational purposes only. It does not constitute financial advice. Always conduct your own research and
            consult with qualified financial advisors before making investment decisions.
          </AlertDescription>
        </Alert>

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Generated: {new Date().toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <Brain className="h-3 w-3" />
              Model: Groq Llama 3 70B
            </span>
          </div>
          <Badge variant="outline" className="text-xs">
            Analysis ID: {Date.now().toString(36)}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}

function getSectionIcon(title: string) {
  const titleLower = title.toLowerCase()
  if (titleLower.includes("technical")) return <BarChart3 className="h-4 w-4 text-blue-500" />
  if (titleLower.includes("fundamental")) return <DollarSign className="h-4 w-4 text-green-500" />
  if (titleLower.includes("risk")) return <Shield className="h-4 w-4 text-red-500" />
  if (titleLower.includes("sentiment")) return <TrendingUp className="h-4 w-4 text-purple-500" />
  if (titleLower.includes("recommendation")) return <Target className="h-4 w-4 text-orange-500" />
  return <BarChart3 className="h-4 w-4 text-gray-500" />
}
