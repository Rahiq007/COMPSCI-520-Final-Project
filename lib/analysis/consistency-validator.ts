export interface ValidationResult {
  isConsistent: boolean
  score: number
  issues: string[]
  corrections: any
  confidence: number
}

export interface AnalysisData {
  ticker: string
  currentPrice: number
  prediction: any
  risk: any
  technicalIndicators: any
  sentiment: any
  fundamentals: any
  aiAnalysis?: any
}

export class ConsistencyValidator {
  static validateAnalysis(data: AnalysisData): ValidationResult {
    const issues: string[] = []
    let score = 100
    const corrections: any = {}

    // 1. Validate Risk-Recommendation Alignment
    const riskRecommendationCheck = this.validateRiskRecommendationAlignment(data)
    if (!riskRecommendationCheck.valid) {
      issues.push(...riskRecommendationCheck.issues)
      score -= riskRecommendationCheck.penalty
      corrections.recommendation = riskRecommendationCheck.correctedRecommendation
    }

    // 2. Validate Price-Direction Consistency
    const priceDirectionCheck = this.validatePriceDirectionConsistency(data)
    if (!priceDirectionCheck.valid) {
      issues.push(...priceDirectionCheck.issues)
      score -= priceDirectionCheck.penalty
      corrections.direction = priceDirectionCheck.correctedDirection
    }

    // 3. Validate Confidence-Recommendation Strength
    const confidenceCheck = this.validateConfidenceAlignment(data)
    if (!confidenceCheck.valid) {
      issues.push(...confidenceCheck.issues)
      score -= confidenceCheck.penalty
      corrections.confidence = confidenceCheck.correctedConfidence
    }

    // 4. Validate Technical-Fundamental Alignment
    const technicalFundamentalCheck = this.validateTechnicalFundamentalAlignment(data)
    if (!technicalFundamentalCheck.valid) {
      issues.push(...technicalFundamentalCheck.issues)
      score -= technicalFundamentalCheck.penalty
    }

    // 5. Validate AI Analysis Consistency
    const aiConsistencyCheck = this.validateAIConsistency(data)
    if (!aiConsistencyCheck.valid) {
      issues.push(...aiConsistencyCheck.issues)
      score -= aiConsistencyCheck.penalty
      corrections.aiAnalysis = aiConsistencyCheck.correctedAI
    }

    return {
      isConsistent: issues.length === 0,
      score: Math.max(0, score),
      issues,
      corrections,
      confidence: this.calculateOverallConfidence(data, score),
    }
  }

  private static validateRiskRecommendationAlignment(data: AnalysisData) {
    const riskScore = data.risk?.riskScore || 5
    const recommendation = data.prediction?.recommendation || "HOLD"
    const issues: string[] = []
    let penalty = 0

    // High risk (8-10) should not have BUY recommendations
    if (riskScore >= 8 && recommendation === "BUY") {
      issues.push(`High risk score (${riskScore.toFixed(1)}) conflicts with BUY recommendation`)
      penalty = 30
      return {
        valid: false,
        issues,
        penalty,
        correctedRecommendation: riskScore >= 9 ? "SELL" : "HOLD",
      }
    }

    // Very low risk (1-3) with SELL recommendation is questionable
    if (riskScore <= 3 && recommendation === "SELL") {
      issues.push(`Low risk score (${riskScore.toFixed(1)}) conflicts with SELL recommendation`)
      penalty = 25
      return {
        valid: false,
        issues,
        penalty,
        correctedRecommendation: "HOLD",
      }
    }

    // Medium risk (4-7) should generally be HOLD unless strong signals
    if (riskScore >= 4 && riskScore <= 7 && (recommendation === "BUY" || recommendation === "SELL")) {
      const confidence = data.prediction?.confidence || 0
      if (confidence < 80) {
        issues.push(`Medium risk with low confidence should be HOLD, not ${recommendation}`)
        penalty = 15
        return {
          valid: false,
          issues,
          penalty,
          correctedRecommendation: "HOLD",
        }
      }
    }

    return { valid: true, issues: [], penalty: 0, correctedRecommendation: recommendation }
  }

  private static validatePriceDirectionConsistency(data: AnalysisData) {
    const currentPrice = data.currentPrice
    const targetPrice = data.prediction?.targetPrice || currentPrice
    const direction = data.prediction?.direction
    const recommendation = data.prediction?.recommendation
    const issues: string[] = []
    let penalty = 0

    const actualDirection = targetPrice > currentPrice ? "up" : targetPrice < currentPrice ? "down" : "neutral"

    // Direction should match price movement
    if (direction !== actualDirection && actualDirection !== "neutral") {
      issues.push(`Direction "${direction}" doesn't match price movement (${actualDirection})`)
      penalty = 20
    }

    // Recommendation should align with direction
    if (actualDirection === "up" && (recommendation === "SELL" || recommendation === "TRIM")) {
      issues.push(`Upward price prediction conflicts with ${recommendation} recommendation`)
      penalty = 25
    }

    if (actualDirection === "down" && recommendation === "BUY") {
      issues.push(`Downward price prediction conflicts with BUY recommendation`)
      penalty = 25
    }

    return {
      valid: issues.length === 0,
      issues,
      penalty,
      correctedDirection: actualDirection,
    }
  }

  private static validateConfidenceAlignment(data: AnalysisData) {
    const confidence = data.prediction?.confidence || 0
    const recommendation = data.prediction?.recommendation
    const riskScore = data.risk?.riskScore || 5
    const issues: string[] = []
    let penalty = 0

    // Strong recommendations (BUY/SELL) should have high confidence
    if ((recommendation === "BUY" || recommendation === "SELL") && confidence < 70) {
      issues.push(`Strong recommendation (${recommendation}) requires higher confidence than ${confidence}%`)
      penalty = 20
      return {
        valid: false,
        issues,
        penalty,
        correctedConfidence: Math.max(75, confidence),
      }
    }

    // High risk with high confidence is suspicious
    if (riskScore >= 8 && confidence >= 85) {
      issues.push(`High risk (${riskScore.toFixed(1)}) with very high confidence (${confidence}%) is inconsistent`)
      penalty = 15
      return {
        valid: false,
        issues,
        penalty,
        correctedConfidence: Math.min(75, confidence),
      }
    }

    return { valid: true, issues: [], penalty: 0, correctedConfidence: confidence }
  }

  private static validateTechnicalFundamentalAlignment(data: AnalysisData) {
    const technical = data.technicalIndicators
    const fundamental = data.fundamentals
    const recommendation = data.prediction?.recommendation
    const issues: string[] = []
    let penalty = 0

    // RSI overbought (>70) with BUY recommendation
    if (technical?.rsi > 70 && recommendation === "BUY") {
      issues.push(`Overbought RSI (${technical.rsi.toFixed(1)}) conflicts with BUY recommendation`)
      penalty = 15
    }

    // RSI oversold (<30) with SELL recommendation
    if (technical?.rsi < 30 && recommendation === "SELL") {
      issues.push(`Oversold RSI (${technical.rsi.toFixed(1)}) conflicts with SELL recommendation`)
      penalty = 15
    }

    // High P/E ratio with strong BUY
    if (fundamental?.pe > 30 && recommendation === "BUY") {
      issues.push(`High P/E ratio (${fundamental.pe.toFixed(1)}) may not support strong BUY recommendation`)
      penalty = 10
    }

    return { valid: issues.length === 0, issues, penalty }
  }

  private static validateAIConsistency(data: AnalysisData) {
    const aiAnalysis = data.aiAnalysis
    const prediction = data.prediction
    const issues: string[] = []
    let penalty = 0

    if (!aiAnalysis) {
      return { valid: true, issues: [], penalty: 0, correctedAI: null }
    }

    // AI recommendation should match prediction recommendation
    if (aiAnalysis.recommendation !== prediction?.recommendation) {
      issues.push(
        `AI recommendation (${aiAnalysis.recommendation}) differs from prediction (${prediction?.recommendation})`,
      )
      penalty = 20
    }

    // AI confidence should be within reasonable range of prediction confidence
    const confidenceDiff = Math.abs((aiAnalysis.confidence || 0) - (prediction?.confidence || 0))
    if (confidenceDiff > 15) {
      issues.push(`AI confidence differs significantly from prediction confidence (${confidenceDiff}% difference)`)
      penalty = 10
    }

    return {
      valid: issues.length === 0,
      issues,
      penalty,
      correctedAI: {
        ...aiAnalysis,
        recommendation: prediction?.recommendation,
        confidence: prediction?.confidence,
      },
    }
  }

  private static calculateOverallConfidence(data: AnalysisData, consistencyScore: number): number {
    const baseConfidence = data.prediction?.confidence || 0
    const riskAdjustment = Math.max(0, (10 - (data.risk?.riskScore || 5)) * 2)
    const consistencyAdjustment = (consistencyScore - 50) / 5

    const adjustedConfidence = baseConfidence + riskAdjustment + consistencyAdjustment
    return Math.max(50, Math.min(95, Math.round(adjustedConfidence)))
  }

  static applyCorrections(data: AnalysisData, corrections: any): AnalysisData {
    const correctedData = { ...data }

    if (corrections.recommendation) {
      correctedData.prediction = {
        ...correctedData.prediction,
        recommendation: corrections.recommendation,
      }
    }

    if (corrections.direction) {
      correctedData.prediction = {
        ...correctedData.prediction,
        direction: corrections.direction,
      }
    }

    if (corrections.confidence) {
      correctedData.prediction = {
        ...correctedData.prediction,
        confidence: corrections.confidence,
      }
    }

    if (corrections.aiAnalysis) {
      correctedData.aiAnalysis = corrections.aiAnalysis
    }

    return correctedData
  }
}
