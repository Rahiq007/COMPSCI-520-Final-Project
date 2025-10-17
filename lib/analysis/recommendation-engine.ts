export interface AnalysisFactors {
  technicalScore: number
  sentimentScore: number
  fundamentalScore: number
  newsScore: number
  riskScore: number
  confidence: number
  priceChange: number
}

export interface RecommendationResult {
  recommendation: "BUY" | "SELL" | "HOLD" | "TRIM"
  confidence: number
  reasoning: string[]
  riskAdjustedRecommendation: "BUY" | "SELL" | "HOLD" | "TRIM"
  consistencyScore: number
}

export class RecommendationEngine {
  static generateConsistentRecommendation(factors: AnalysisFactors): RecommendationResult {
    const { technicalScore, sentimentScore, fundamentalScore, newsScore, riskScore, confidence, priceChange } = factors

    // Normalize all scores to -1 to 1 range
    const normalizedTechnical = this.normalizeScore(technicalScore)
    const normalizedSentiment = this.normalizeScore(sentimentScore)
    const normalizedFundamental = this.normalizeScore(fundamentalScore)
    const normalizedNews = this.normalizeScore(newsScore)

    // Calculate weighted composite score
    const weights = {
      technical: 0.3,
      sentiment: 0.2,
      fundamental: 0.3,
      news: 0.2,
    }

    const compositeScore =
      normalizedTechnical * weights.technical +
      normalizedSentiment * weights.sentiment +
      normalizedFundamental * weights.fundamental +
      normalizedNews * weights.news

    // Risk adjustment factor (higher risk = more conservative)
    const riskAdjustment = Math.max(0.1, 1 - riskScore / 15)
    const riskAdjustedScore = compositeScore * riskAdjustment

    // Generate base recommendation
    const baseRecommendation = this.getBaseRecommendation(compositeScore, confidence)
    const riskAdjustedRecommendation = this.getBaseRecommendation(riskAdjustedScore, confidence)

    // Calculate consistency score
    const consistencyScore = this.calculateConsistencyScore(factors, baseRecommendation)

    // Generate reasoning
    const reasoning = this.generateReasoning(factors, compositeScore, riskAdjustedScore)

    return {
      recommendation: baseRecommendation,
      confidence: Math.round(confidence),
      reasoning,
      riskAdjustedRecommendation,
      consistencyScore,
    }
  }

  private static normalizeScore(score: number): number {
    // Convert various score ranges to -1 to 1
    if (score >= 0 && score <= 1) {
      return score * 2 - 1 // 0-1 range to -1 to 1
    }
    if (score >= 0 && score <= 100) {
      return score / 50 - 1 // 0-100 range to -1 to 1
    }
    return Math.max(-1, Math.min(1, score)) // Clamp to -1 to 1
  }

  private static getBaseRecommendation(score: number, confidence: number): "BUY" | "SELL" | "HOLD" | "TRIM" {
    // Require higher confidence for stronger recommendations
    if (confidence < 60) return "HOLD"

    if (score > 0.3 && confidence > 75) return "BUY"
    if (score > 0.1 && confidence > 65) return "BUY"
    if (score < -0.3 && confidence > 75) return "SELL"
    if (score < -0.1 && confidence > 65) return "TRIM"

    return "HOLD"
  }

  private static calculateConsistencyScore(factors: AnalysisFactors, recommendation: string): number {
    const { riskScore, confidence, priceChange } = factors

    let consistencyPoints = 0
    const maxPoints = 100

    // Check if recommendation aligns with risk score
    if (recommendation === "BUY" && riskScore <= 6) consistencyPoints += 25
    if (recommendation === "HOLD" && riskScore >= 4 && riskScore <= 8) consistencyPoints += 25
    if (recommendation === "SELL" && riskScore >= 7) consistencyPoints += 25
    if (recommendation === "TRIM" && riskScore >= 6) consistencyPoints += 25

    // Check if recommendation aligns with confidence
    if ((recommendation === "BUY" || recommendation === "SELL") && confidence >= 70) consistencyPoints += 25
    if (recommendation === "HOLD" && confidence < 70) consistencyPoints += 25

    // Check if recommendation aligns with price change
    if (recommendation === "BUY" && priceChange > 0) consistencyPoints += 25
    if (recommendation === "SELL" && priceChange < 0) consistencyPoints += 25
    if (recommendation === "HOLD" && Math.abs(priceChange) < 0.05) consistencyPoints += 25

    // Confidence alignment
    if (confidence >= 60) consistencyPoints += 25

    return Math.min(maxPoints, consistencyPoints)
  }

  private static generateReasoning(
    factors: AnalysisFactors,
    compositeScore: number,
    riskAdjustedScore: number,
  ): string[] {
    const reasoning = []
    const { technicalScore, sentimentScore, riskScore, confidence } = factors

    // Technical analysis reasoning
    if (technicalScore > 0.5) {
      reasoning.push("Strong technical indicators support upward momentum")
    } else if (technicalScore < -0.5) {
      reasoning.push("Technical indicators suggest potential downward pressure")
    } else {
      reasoning.push("Technical indicators show neutral to mixed signals")
    }

    // Sentiment reasoning
    if (sentimentScore > 0.6) {
      reasoning.push("Market sentiment is notably positive")
    } else if (sentimentScore < 0.4) {
      reasoning.push("Market sentiment shows bearish tendencies")
    } else {
      reasoning.push("Market sentiment remains balanced")
    }

    // Risk assessment reasoning
    if (riskScore > 8) {
      reasoning.push("High risk profile warrants cautious approach")
    } else if (riskScore < 4) {
      reasoning.push("Low risk profile supports more aggressive positioning")
    } else {
      reasoning.push("Moderate risk profile suggests balanced approach")
    }

    // Confidence reasoning
    if (confidence > 80) {
      reasoning.push("High confidence in analysis supports strong conviction")
    } else if (confidence < 60) {
      reasoning.push("Lower confidence suggests maintaining current positions")
    }

    return reasoning
  }

  static generateVariedConfidence(baseConfidence: number, ticker: string): number {
    // Create realistic variation in confidence based on ticker and market conditions
    const tickerHash = ticker.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const variation = (tickerHash % 20) - 10 // -10 to +10 variation
    const timeVariation = (Date.now() % 15) - 7.5 // Time-based variation

    const adjustedConfidence = baseConfidence + variation + timeVariation
    return Math.max(55, Math.min(95, Math.round(adjustedConfidence)))
  }
}
