export enum ErrorType {
  API_ERROR = "API_ERROR",
  DATABASE_ERROR = "DATABASE_ERROR",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  NETWORK_ERROR = "NETWORK_ERROR",
  RATE_LIMIT_ERROR = "RATE_LIMIT_ERROR",
  AUTHENTICATION_ERROR = "AUTHENTICATION_ERROR",
  DATA_PROCESSING_ERROR = "DATA_PROCESSING_ERROR",
  REAL_TIME_ERROR = "REAL_TIME_ERROR",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

export interface AppError {
  type: ErrorType
  message: string
  details?: any
  timestamp: Date
  userId?: string
  requestId?: string
  stack?: string
  retryable: boolean
  userMessage: string
}

export class ErrorManager {
  private static instance: ErrorManager
  private errorLog: AppError[] = []
  private maxLogSize = 1000

  static getInstance(): ErrorManager {
    if (!ErrorManager.instance) {
      ErrorManager.instance = new ErrorManager()
    }
    return ErrorManager.instance
  }

  createError(type: ErrorType, message: string, details?: any, retryable = false, userMessage?: string): AppError {
    const error: AppError = {
      type,
      message,
      details,
      timestamp: new Date(),
      requestId: this.generateRequestId(),
      retryable,
      userMessage: userMessage || this.getDefaultUserMessage(type),
      stack: new Error().stack,
    }

    this.logError(error)
    return error
  }

  private logError(error: AppError): void {
    // Add to in-memory log
    this.errorLog.unshift(error)
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog.pop()
    }

    // Console logging with structured format
    console.error("🚨 Application Error:", {
      type: error.type,
      message: error.message,
      timestamp: error.timestamp.toISOString(),
      requestId: error.requestId,
      retryable: error.retryable,
      details: error.details,
    })

    // Send to external logging service in production
    if (process.env.NODE_ENV === "production") {
      this.sendToLoggingService(error)
    }
  }

  private sendToLoggingService(error: AppError): void {
    // In production, send to services like Sentry, LogRocket, etc.
    // For now, we'll just log to console
    fetch("/api/logging/error", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(error),
    }).catch(() => {
      // Fail silently to avoid recursive errors
    })
  }

  getRecentErrors(limit = 50): AppError[] {
    return this.errorLog.slice(0, limit)
  }

  getErrorsByType(type: ErrorType): AppError[] {
    return this.errorLog.filter((error) => error.type === type)
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private getDefaultUserMessage(type: ErrorType): string {
    switch (type) {
      case ErrorType.API_ERROR:
        return "Unable to fetch stock data. Please try again in a moment."
      case ErrorType.DATABASE_ERROR:
        return "Database temporarily unavailable. Your request will be retried automatically."
      case ErrorType.VALIDATION_ERROR:
        return "Please check your input and try again."
      case ErrorType.NETWORK_ERROR:
        return "Network connection issue. Please check your internet connection."
      case ErrorType.RATE_LIMIT_ERROR:
        return "Too many requests. Please wait a moment before trying again."
      case ErrorType.AUTHENTICATION_ERROR:
        return "Authentication failed. Please check your API credentials."
      case ErrorType.DATA_PROCESSING_ERROR:
        return "Error processing stock data. Our team has been notified."
      case ErrorType.REAL_TIME_ERROR:
        return "Real-time updates temporarily unavailable. Data may be delayed."
      default:
        return "An unexpected error occurred. Please try again."
    }
  }

  // Retry mechanism for retryable errors
  async withRetry<T>(operation: () => Promise<T>, maxRetries = 3, backoffMs = 1000): Promise<T> {
    let lastError: any

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error: any) {
        lastError = error

        if (attempt === maxRetries) {
          throw this.createError(
            ErrorType.UNKNOWN_ERROR,
            `Operation failed after ${maxRetries} attempts`,
            { originalError: error.message, attempts: attempt },
            false,
          )
        }

        // Exponential backoff
        const delay = backoffMs * Math.pow(2, attempt - 1)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }

    throw lastError
  }
}

export const errorManager = ErrorManager.getInstance()
