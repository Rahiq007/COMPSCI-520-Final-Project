"use client"

import type React from "react"
import { Component, type ReactNode } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle, RefreshCw, Bug, Home } from "lucide-react"

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface State {
  hasError: boolean
  error?: Error
  errorId?: string
  retryCount: number
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, retryCount: 0 }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, retryCount: 0 }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Generate a more descriptive error ID
    const errorId = `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    this.setState({ errorId })

    // Enhanced error logging
    const errorDetails = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId,
      timestamp: new Date().toISOString(),
      userAgent: typeof window !== "undefined" ? window.navigator.userAgent : "unknown",
      url: typeof window !== "undefined" ? window.location.href : "unknown",
      errorBoundaryInfo: {
        retryCount: this.state.retryCount,
        hasError: this.state.hasError,
      },
    }

    console.error("🚨 React Error Boundary:", errorDetails)

    // Call optional error handler
    this.props.onError?.(error, errorInfo)

    // Send to logging endpoint with more details
    fetch("/api/logging/error", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "REACT_ERROR_BOUNDARY",
        message: error.message,
        details: {
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          userAgent: errorDetails.userAgent,
          url: errorDetails.url,
        },
        timestamp: new Date().toISOString(),
        requestId: errorId,
        userMessage: "A component error occurred in the error boundary",
        retryable: true,
        severity: "high",
      }),
    }).catch(() => {
      // Fail silently to avoid recursive errors
      console.warn("Failed to send error to logging endpoint")
    })
  }

  handleRetry = () => {
    this.setState((prevState) => ({
      hasError: false,
      error: undefined,
      retryCount: prevState.retryCount + 1,
    }))
  }

  handleGoHome = () => {
    window.location.href = "/"
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertTriangle className="h-5 w-5" />
                Something went wrong
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <Bug className="h-4 w-4" />
                <AlertDescription>
                  An unexpected error occurred. Our team has been notified and is working on a fix.
                </AlertDescription>
              </Alert>

              {this.state.errorId && (
                <div className="text-sm text-gray-600">
                  <strong>Error ID:</strong> {this.state.errorId}
                </div>
              )}

              {process.env.NODE_ENV === "development" && this.state.error && (
                <div className="text-xs text-gray-500 bg-gray-100 p-2 rounded">
                  <strong>Debug Info:</strong>
                  <br />
                  {this.state.error.message}
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={this.handleRetry} className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </Button>
                <Button variant="outline" onClick={this.handleGoHome} className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Go Home
                </Button>
              </div>

              {this.state.retryCount > 2 && (
                <Alert>
                  <AlertDescription>
                    If the problem persists, please contact support with the error ID above.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}
