"use client"

import type React from "react"
import ReactMarkdown from "react-markdown"
import type { Components as ReactMarkdownComponents } from "react-markdown"
import remarkGfm from "remark-gfm"

import { useState, useCallback, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Brain,
  MessageSquare,
  Loader2,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Target,
  BarChart3,
  Clock,
  DollarSign,
  Activity,
  AlertTriangle,
  HelpCircle,
  Lightbulb,
  RefreshCw,
  Send,
} from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { safeCurrency } from "@/lib/utils/safe-formatters"

interface AIAnalysisPanelProps {
  ticker: string
  stockData: any
  onAnalysisComplete?: (analysis: any) => void
}

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  model?: string
}

const DEFAULT_DISCLAIMER_TEXT =
  "This analysis is for educational purposes only and not personalized financial advice."

const extractDisclaimerBlock = (content: string) => {
  const paragraphs = content.split(/\n{2,}/)
  const remaining: string[] = []
  let hasDisclaimer = false
  let disclaimerText: string | null = null
  let captureNextParagraph = false

  for (const paragraph of paragraphs) {
    const trimmed = paragraph.trim()
    if (!trimmed) {
      continue
    }

    if (!hasDisclaimer && /disclaimer/i.test(trimmed)) {
      hasDisclaimer = true
      const withoutMarkdown = trimmed.replace(/\*\*/g, "")
      const extracted = withoutMarkdown.replace(/^.*disclaimer[:\s-]*/i, "").trim()

      if (extracted) {
        disclaimerText = extracted
        captureNextParagraph = false
      } else {
        captureNextParagraph = true
      }
      continue
    }

    if (captureNextParagraph) {
      const cleaned = trimmed.replace(/\*\*/g, "").trim()
      if (cleaned) {
        disclaimerText = cleaned
      }
      captureNextParagraph = false
      continue
    }

    remaining.push(paragraph)
  }

  return {
    hasDisclaimer,
    disclaimerText,
    sanitizedContent: remaining.join("\n\n").trim(),
  }
}

export default function AIAnalysisPanel({ ticker, stockData, onAnalysisComplete }: AIAnalysisPanelProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [aiAnalysis, setAiAnalysis] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [chatError, setChatError] = useState<string | null>(null)

  // Suggested questions for better user experience
  const suggestedQuestions = [
    `What are the key risks for ${ticker.toUpperCase()} stock?`,
    `Should I buy ${ticker.toUpperCase()} stock now?`,
    `What is the fair value of ${ticker.toUpperCase()}?`,
    `How does ${ticker.toUpperCase()} compare to its competitors?`,
    `What are the growth prospects for ${ticker.toUpperCase()}?`,
    `What technical indicators suggest about ${ticker.toUpperCase()}?`,
  ]

  const markdownComponents = useMemo<ReactMarkdownComponents>(
    () => ({
      h2: ({ node, ...props }) => (
        <h2 {...props} className="text-xl font-semibold text-blue-900 mt-8 mb-4" />
      ),
      h3: ({ node, ...props }) => (
        <h3 {...props} className="text-lg font-semibold text-blue-900 mt-6 mb-3 flex items-center gap-2" />
      ),
      h4: ({ node, ...props }) => (
        <h4 {...props} className="text-base font-semibold text-blue-800 mt-4 mb-2" />
      ),
      p: ({ node, ...props }) => <p {...props} className="text-gray-800 leading-relaxed text-sm mb-4" />,
      strong: ({ node, ...props }) => <strong {...props} className="font-semibold text-gray-900" />,
      ul: ({ node, ordered, ...props }) => <ul {...props} className="my-4 space-y-3 list-none p-0" />,
      ol: ({ node, ordered, ...props }) => (
        <ol {...props} className="my-4 space-y-3 list-decimal pl-6 text-gray-700 leading-relaxed text-sm" />
      ),
      li: ({ node, ordered, index, children, ...props }) => {
        if (ordered) {
          return (
            <li {...props} className="text-gray-700 leading-relaxed text-sm">
              {children}
            </li>
          )
        }

        return (
          <li {...props} className="flex items-start gap-3 text-gray-700 leading-relaxed text-sm">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
            <div className="flex-1">{children}</div>
          </li>
        )
      },
      blockquote: ({ node, ...props }) => (
        <blockquote {...props} className="border-l-4 border-blue-200 pl-4 italic text-gray-600 my-4" />
      ),
      a: ({ node, ...props }) => (
        <a {...props} className="text-blue-600 underline hover:text-blue-700 transition-colors" rel="noreferrer" />
      ),
      table: ({ node, ...props }) => (
        <div className="overflow-x-auto my-4">
          <table {...props} className="min-w-full text-sm text-left border border-gray-200" />
        </div>
      ),
      thead: ({ node, ...props }) => <thead {...props} className="bg-gray-100" />,
      th: ({ node, ...props }) => (
        <th {...props} className="px-4 py-2 text-gray-700 font-semibold border-b border-gray-200" />
      ),
      td: ({ node, ...props }) => <td {...props} className="px-4 py-2 border-b border-gray-100 text-gray-700" />,
    }),
    [],
  )

  const handleSuggestedQuestion = useCallback(
    (question: string) => {
      if (!isLoading) {
        setInput(question)
      }
    },
    [isLoading],
  )

  const sendMessage = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return

    setIsLoading(true)
    setChatError(null)

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: messageText.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")

    try {
      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: messageText.trim(),
          ticker,
          stockData,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
        throw new Error(errorData.error || `Server error: ${response.status}`)
      }

      const data = await response.json()

      // Add AI response
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.response || "Sorry, I couldn't generate a response.",
        timestamp: new Date(),
        model: data.model,
      }

      setMessages((prev) => [...prev, aiMessage])
    } catch (err: any) {
      console.error("Chat error:", err)
      setChatError(err.message || "Failed to get AI response")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  const clearError = () => {
    setChatError(null)
    setError(null)
  }

  const retryLastMessage = () => {
    const lastUserMessage = messages.filter((m) => m.role === "user").pop()
    if (lastUserMessage) {
      sendMessage(lastUserMessage.content)
    }
  }

  const generateAIAnalysis = async () => {
    if (!stockData) {
      setError("No stock data available for analysis")
      return
    }

    setIsAnalyzing(true)
    setError(null)

    try {
      const response = await fetch("/api/ai-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticker,
          stockData,
          analysisType: "comprehensive",
        }),
      })

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Unknown error")
        throw new Error(`Analysis failed (${response.status}): ${errorText}`)
      }

      const result = await response.json()

      // Ensure consistent target price from stockData prediction
      const enhancedAnalysis = {
        ...result.analysis,
        targetPrice: stockData?.prediction?.targetPrice || result.analysis.targetPrice,
        recommendation: stockData?.prediction?.recommendation || result.analysis.recommendation,
        confidence: stockData?.prediction?.confidence || result.analysis.confidence,
      }

      setAiAnalysis(enhancedAnalysis)
      onAnalysisComplete?.(enhancedAnalysis)
    } catch (err: any) {
      console.error("Analysis error:", err)
      setError(`Analysis Error: ${err.message}`)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const provideFeedback = async (rating: number) => {
    if (!aiAnalysis) return

    try {
      await fetch("/api/ai-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticker,
          rating,
          analysisType: "comprehensive",
        }),
      })
    } catch (error) {
      console.error("Failed to submit feedback:", error)
    }
  }

  const getRecommendationConfig = (recommendation: string) => {
    switch (recommendation?.toUpperCase()) {
      case "BUY":
        return {
          color: "bg-green-500 hover:bg-green-600",
          bgColor: "bg-green-50 border-green-200",
          textColor: "text-green-700",
          icon: <TrendingUp className="h-5 w-5 text-green-600" />,
        }
      case "SELL":
        return {
          color: "bg-red-500 hover:bg-red-600",
          bgColor: "bg-red-50 border-red-200",
          textColor: "text-red-700",
          icon: <TrendingDown className="h-5 w-5 text-red-600" />,
        }
      case "HOLD":
        return {
          color: "bg-yellow-500 hover:bg-yellow-600",
          bgColor: "bg-yellow-50 border-yellow-200",
          textColor: "text-yellow-700",
          icon: <BarChart3 className="h-5 w-5 text-yellow-600" />,
        }
      case "TRIM":
        return {
          color: "bg-orange-500 hover:bg-orange-600",
          bgColor: "bg-orange-50 border-orange-200",
          textColor: "text-orange-700",
          icon: <TrendingDown className="h-5 w-5 text-orange-600" />,
        }
      default:
        return {
          color: "bg-gray-500 hover:bg-gray-600",
          bgColor: "bg-gray-50 border-gray-200",
          textColor: "text-gray-700",
          icon: <BarChart3 className="h-5 w-5 text-gray-600" />,
        }
    }
  }

  // Ensure consistent target price from stockData prediction
  const getConsistentTargetPrice = () => {
    if (stockData?.prediction?.targetPrice) {
      return stockData.prediction.targetPrice
    }
    if (aiAnalysis?.targetPrice) {
      return aiAnalysis.targetPrice
    }
    return stockData?.currentPrice || 0
  }

  // Calculate potential return based on current price and target price
  const calculatePotentialReturn = () => {
    const currentPrice = stockData?.currentPrice || 0
    const targetPrice = getConsistentTargetPrice()
    if (currentPrice <= 0) return 0

    return ((targetPrice - currentPrice) / currentPrice) * 100
  }

  const formatAnalysisText = (text: string) => {
    if (!text) return []

    // Split by section markers and clean up
    const sections = text
      .split(/\*\*\d+\.\s*/)
      .filter((section) => section.trim().length > 0)
      .map((section) => {
        // Extract title and content
        const titleMatch = section.match(/([^:]+):\*\*(.+)/s)
        if (titleMatch) {
          return {
            title: titleMatch[1].trim(),
            content: titleMatch[2].trim().replace(/\*\*/g, ""),
          }
        }

        // Handle sections without explicit titles
        const lines = section.trim().split("\n")
        if (lines.length > 0) {
          const firstLine = lines[0].trim()
          if (firstLine.length > 0 && firstLine.length < 100) {
            return {
              title: firstLine.replace(/[*:]/g, "").trim(),
              content: lines.slice(1).join("\n").trim(),
            }
          }
        }

        return {
          title: "",
          content: section.trim().replace(/\*\*/g, ""),
        }
      })
      .filter((section) => section.content.length > 0)

    return sections
  }

  const recommendationConfig = getRecommendationConfig(
    aiAnalysis?.recommendation || stockData?.prediction?.recommendation,
  )

  return (
    <div className="space-y-6">
      {/* Main AI Analysis Panel */}
      <Card className="border-2 border-purple-200 overflow-hidden shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-50 via-blue-50 to-indigo-50 pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Brain className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-gray-900">AI-Powered Analysis</span>
                  <Badge variant="outline" className="text-purple-600 border-purple-600">
                    Groq Llama 3.1
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 font-normal mt-1">
                  Advanced AI analysis powered by Groq's lightning-fast inference
                </p>
              </div>
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {ticker.toUpperCase()}
              </Badge>
              <Badge variant="outline" className="text-xs">
                Live Data
              </Badge>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <div className="space-y-6">
            {/* Analysis Type Description */}
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-lg p-4 border">
              <div className="flex items-center gap-3 mb-2">
                <Brain className="h-5 w-5 text-purple-600" />
                <h3 className="font-semibold text-gray-900">Comprehensive Analysis</h3>
              </div>
              <p className="text-sm text-gray-600">
                Complete technical, fundamental, and sentiment analysis with risk assessment
              </p>
            </div>

            {/* Generate Analysis Button */}
            <Button
              onClick={() => generateAIAnalysis()}
              disabled={isAnalyzing || !stockData}
              className="w-full h-12 text-base font-medium bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
              size="lg"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                  Generating AI Analysis...
                </>
              ) : (
                <>
                  <Sparkles className="mr-3 h-5 w-5" />
                  Generate Comprehensive Analysis
                </>
              )}
            </Button>

            {/* Error Display */}
            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>{error}</span>
                  <Button size="sm" variant="outline" onClick={clearError}>
                    Dismiss
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {/* AI Analysis Results */}
            {aiAnalysis && (
              <div className="space-y-6">
                {/* Analysis Header with Key Metrics */}
                <div className={`rounded-lg border-2 p-6 ${recommendationConfig.bgColor}`}>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      <Brain className="h-6 w-6 text-purple-600" />
                      AI Analysis Results
                    </h3>
                    <div className="flex items-center gap-3">
                      <Badge
                        className={`${recommendationConfig.color} text-white px-4 py-2 text-sm font-semibold shadow-md`}
                      >
                        {aiAnalysis.recommendation || stockData?.prediction?.recommendation}
                      </Badge>
                      <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 shadow-sm">
                        <Activity className="h-4 w-4 text-blue-600" />
                        <span className="font-semibold text-gray-900">
                          {aiAnalysis.confidence || stockData?.prediction?.confidence || 0}%
                        </span>
                        <span className="text-sm text-gray-600">Confidence</span>
                      </div>
                    </div>
                  </div>

                  {/* Key Metrics Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white rounded-lg p-4 shadow-sm border">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gray-100 rounded-lg">
                          <DollarSign className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Current Price</div>
                          <div className="text-xl font-bold text-gray-900">{safeCurrency(stockData?.currentPrice)}</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4 shadow-sm border">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Target className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">AI Target Price</div>
                          <div className="text-xl font-bold text-blue-600">
                            {safeCurrency(getConsistentTargetPrice())}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg p-4 shadow-sm border">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-100 rounded-lg">
                          <TrendingUp className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-600">Potential Return</div>
                          <div
                            className={`text-xl font-bold ${
                              calculatePotentialReturn() >= 0 ? "text-green-600" : "text-red-600"
                            }`}
                          >
                            {calculatePotentialReturn().toFixed(2)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Confidence Progress Bar */}
                  <div className="bg-white rounded-lg p-4 shadow-sm border">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">Analysis Confidence</span>
                      <span className="text-sm font-bold text-gray-900">
                        {aiAnalysis.confidence || stockData?.prediction?.confidence || 0}%
                      </span>
                    </div>
                    <Progress value={aiAnalysis.confidence || stockData?.prediction?.confidence || 0} className="h-3" />
                  </div>
                </div>

                {/* Detailed Analysis Content */}
                <Card className="border shadow-sm">
                  <CardHeader className="bg-gray-50 border-b">
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Target className="h-5 w-5 text-blue-600" />
                      Comprehensive Analysis of {ticker.toUpperCase()} Stock
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-6">
                      {formatAnalysisText(aiAnalysis.reasoning || aiAnalysis).map((section, index) => (
                        <div key={index} className="border-l-4 border-blue-200 pl-6 py-2">
                          {section.title && (
                            <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                              <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                              {section.title}
                            </h4>
                          )}
                          <div className="prose prose-sm max-w-none">
                            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{section.content}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Feedback Section */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-gray-50 rounded-lg border">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-gray-700">Was this analysis helpful?</span>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => provideFeedback(5)}
                        className="flex items-center gap-1"
                      >
                        <ThumbsUp className="h-3 w-3" />
                        <span>Yes</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => provideFeedback(1)}
                        className="flex items-center gap-1"
                      >
                        <ThumbsDown className="h-3 w-3" />
                        <span>No</span>
                      </Button>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    <span>Generated: {new Date().toLocaleString()}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Custom AI Chat Interface */}
      <Card className="border shadow-sm">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-600" />
            Ask AI About {ticker.toUpperCase()}
            <Badge variant="outline" className="ml-2 text-xs">
              Professional Analysis
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 pb-8">
          <div className="space-y-4">
            {/* Suggested Questions */}
            {messages.length === 0 && !chatError && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                  <Lightbulb className="h-4 w-4 text-yellow-600" />
                  <span>Suggested Questions:</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {suggestedQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleSuggestedQuestion(question)}
                      className="text-left justify-start h-auto p-3 text-xs"
                      disabled={isLoading}
                    >
                      <HelpCircle className="h-3 w-3 mr-2 flex-shrink-0" />
                      <span className="truncate">{question}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Chat Messages */}
            <div className="max-h-[500px] overflow-y-auto space-y-5 bg-gray-50 rounded-lg p-6">
              {messages.length === 0 && !chatError && (
                <div className="text-center text-gray-500 py-8">
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">Start a conversation with AI about {ticker.toUpperCase()}</p>
                  <p className="text-xs text-gray-400 mt-1">Get professional insights and analysis</p>
                </div>
              )}

              {messages.map((message) => {
                const alignmentClass = message.role === "user" ? "ml-8" : "mr-8"

                if (message.role === "assistant") {
                  const { hasDisclaimer, disclaimerText, sanitizedContent } = extractDisclaimerBlock(message.content)
                  const effectiveDisclaimer = disclaimerText || (hasDisclaimer ? DEFAULT_DISCLAIMER_TEXT : null)
                  const markdownContent = sanitizedContent || (hasDisclaimer ? "" : message.content)
                  const hasContent = Boolean(markdownContent && markdownContent.trim())

                  return (
                    <div key={message.id} className={`${alignmentClass} mb-8`}>
                      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-purple-50 via-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-100">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-purple-100 rounded-lg">
                                <Brain className="h-5 w-5 text-purple-600" />
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-semibold text-gray-900">AI Financial Analyst</span>
                                  {message.model && (
                                    <Badge
                                      variant="outline"
                                      className="text-xs bg-white border-purple-200 text-purple-700"
                                    >
                                      {message.model}
                                    </Badge>
                                  )}
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  Professional Market Analysis - {message.timestamp.toLocaleTimeString()}
                                </div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                              <span className="text-xs text-gray-500">Live Analysis</span>
                            </div>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                          <div className="space-y-6">
                            {effectiveDisclaimer && (
                              <div className="bg-amber-50 border-l-4 border-amber-400 p-6 rounded-r-lg">
                                <div className="flex items-start gap-3">
                                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                                  <div>
                                    <h4 className="font-semibold text-amber-800 mb-2">Important Disclaimer</h4>
                                    <p className="text-sm text-amber-700 leading-relaxed">{effectiveDisclaimer}</p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {hasContent && (
                              <div className="space-y-6 text-sm text-gray-800 leading-relaxed">
                                <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                                  {markdownContent}
                                </ReactMarkdown>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Footer */}
                        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <div className="flex items-center gap-2">
                              <Activity className="h-3 w-3" />
                              <span>Powered by Groq AI - Real-time Analysis</span>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{message.timestamp.toLocaleString()}</span>
                              </div>
                              <div className="flex gap-1">
                                <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                                  <ThumbsUp className="h-3 w-3" />
                                </Button>
                                <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                                  <ThumbsDown className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                }

                return (
                  <div key={message.id} className={`${alignmentClass} mb-8`}>
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border-l-4 border-blue-500 p-6 shadow-sm">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-semibold">You</span>
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">Your Question</div>
                          <div className="text-xs text-gray-500">{message.timestamp.toLocaleTimeString()}</div>
                        </div>
                      </div>
                      <div className="ml-11">
                        <p className="text-gray-800 leading-relaxed text-sm">{message.content}</p>
                      </div>
                    </div>
                  </div>
                )
              })}

              {isLoading && (
                <div className="mr-8 mb-8">
                  <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-purple-50 via-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Loader2 className="h-5 w-5 text-purple-600 animate-spin" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-900">AI Financial Analyst</span>
                            <Badge variant="outline" className="text-xs bg-white border-purple-200 text-purple-700">
                              Analyzing...
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Processing market data and generating insights...
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-8">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                          <span className="text-gray-600">Analyzing {ticker.toUpperCase()} market data...</span>
                        </div>
                        <div className="space-y-3">
                          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                          <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Error Display for Chat */}
            {chatError && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>{chatError}</span>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={retryLastMessage}>
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Retry
                    </Button>
                    <Button size="sm" variant="outline" onClick={clearError}>
                      Dismiss
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Input Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={`Ask anything about ${ticker.toUpperCase()}... e.g., "What are the key risks?" or "Should I buy now?"`}
                className="min-h-[100px] resize-none text-sm"
                disabled={isLoading}
              />
              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Send className="mr-2 h-4 w-4" />
                      Ask AI
                    </>
                  )}
                </Button>
                {input.trim() && (
                  <Button type="button" variant="outline" onClick={() => setInput("")} disabled={isLoading}>
                    Clear
                  </Button>
                )}
              </div>
            </form>
          </div>
        </CardContent>
        <CardFooter className="bg-gray-50 border-t">
          <div className="flex items-center justify-between w-full text-xs text-gray-500">
            <div className="flex items-center gap-2">
              <Brain className="h-3 w-3" />
              <span>Powered by Groq Llama 3.1 - Professional Financial Analysis</span>
            </div>
            <div className="flex items-center gap-2">
              <Activity className="h-3 w-3" />
              <span>Real-time responses</span>
            </div>
          </div>
          <div className="w-full text-center mt-2">
            <p className="text-xs text-gray-400">
              This is educational information for research purposes. Not personalized financial advice.
            </p>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

