/**
 * Production Data Validator
 *
 * A comprehensive validation system for real-time market data
 * to ensure 100% accuracy and reliability.
 */

import { RealTimeDataManager } from "@/lib/services/real-time-data-manager"

export class ProductionDataValidator {
  private static instance: ProductionDataValidator
  private dataManager: RealTimeDataManager
  private validationCache: Map<string, any>
  private validationTimers: Map<string, NodeJS.Timeout>

  private constructor() {
    this.dataManager = RealTimeDataManager.getInstance()
    this.validationCache = new Map()
    this.validationTimers = new Map()
  }

  public static getInstance(): ProductionDataValidator {
    if (!ProductionDataValidator.instance) {
      ProductionDataValidator.instance = new ProductionDataValidator()
    }
    return ProductionDataValidator.instance
  }

  /**
   * Validate data for a specific symbol
   */
  public async validateSymbol(symbol: string): Promise<any> {
    const normalizedSymbol = symbol.toUpperCase()

    // Check cache first
    if (this.validationCache.has(normalizedSymbol)) {
      const cachedResult = this.validationCache.get(normalizedSymbol)
      const now = Date.now()

      // Return cached result if it's less than 5 minutes old
      if (now - cachedResult.timestamp < 5 * 60 * 1000) {
        return cachedResult.result
      }
    }

    try {
      // Get consistency report from data manager
      const consistencyReport = this.dataManager.getConsistencyReport(normalizedSymbol)

      // Perform additional validation
      const issues: string[] = [...(consistencyReport.issues || [])]
      let accuracy = 100

      // Check for data quality issues
      if (consistencyReport.consistency < 100) {
        accuracy = consistencyReport.consistency
      }

      // Create validation result
      const result = {
        symbol: normalizedSymbol,
        isValid: issues.length === 0 && accuracy >= 95,
        accuracy,
        issues,
        timestamp: Date.now(),
      }

      // Cache the result
      this.validationCache.set(normalizedSymbol, {
        timestamp: Date.now(),
        result,
      })

      return result
    } catch (error) {
      console.error(`Error validating data for ${normalizedSymbol}:`, error)

      // Return error result
      return {
        symbol: normalizedSymbol,
        isValid: false,
        accuracy: 0,
        issues: [`Validation error: ${error.message}`],
        timestamp: Date.now(),
      }
    }
  }

  /**
   * Start continuous validation for a symbol
   */
  public startContinuousValidation(symbol: string, interval = 60000): void {
    const normalizedSymbol = symbol.toUpperCase()

    // Clear existing timer if any
    if (this.validationTimers.has(normalizedSymbol)) {
      clearInterval(this.validationTimers.get(normalizedSymbol)!)
    }

    // Set up new timer
    const timer = setInterval(() => {
      this.validateSymbol(normalizedSymbol).catch((error) =>
        console.error(`Continuous validation error for ${normalizedSymbol}:`, error),
      )
    }, interval)

    this.validationTimers.set(normalizedSymbol, timer)
  }

  /**
   * Stop continuous validation for a symbol
   */
  public stopContinuousValidation(symbol: string): void {
    const normalizedSymbol = symbol.toUpperCase()

    if (this.validationTimers.has(normalizedSymbol)) {
      clearInterval(this.validationTimers.get(normalizedSymbol)!)
      this.validationTimers.delete(normalizedSymbol)
    }
  }

  /**
   * Validate all symbols
   */
  public async validateAll(): Promise<Map<string, any>> {
    const results = new Map()

    // Get all symbols from validation cache
    const symbols = Array.from(this.validationCache.keys())

    // Validate each symbol
    for (const symbol of symbols) {
      const result = await this.validateSymbol(symbol)
      results.set(symbol, result)
    }

    return results
  }

  /**
   * Get validation statistics
   */
  public getValidationStats(): any {
    let totalSymbols = 0
    let validSymbols = 0
    let totalAccuracy = 0
    let totalIssues = 0

    this.validationCache.forEach((cached) => {
      const result = cached.result
      totalSymbols++
      if (result.isValid) validSymbols++
      totalAccuracy += result.accuracy
      totalIssues += result.issues.length
    })

    return {
      totalSymbols,
      validSymbols,
      validPercentage: totalSymbols > 0 ? (validSymbols / totalSymbols) * 100 : 100,
      averageAccuracy: totalSymbols > 0 ? totalAccuracy / totalSymbols : 100,
      totalIssues,
    }
  }
}
