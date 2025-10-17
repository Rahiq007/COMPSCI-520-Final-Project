export interface StockProfile {
  ticker: string
  sector: string
  volatilityProfile: "low" | "medium" | "high"
  growthProfile: "value" | "growth" | "balanced"
  marketCap: "small" | "mid" | "large"
}

export interface PrecisionAnalysisFactors {
  technicalScore: number
  fundamentalScore: number
  sentimentScore: number
  newsScore: number
  volatility: number
  momentum: number
  volume: number
  marketConditions: number
}

export class PrecisionRecommendationEngine {
  private static stockProfiles: Record<string, StockProfile> = {
    TSLA: {
      ticker: "TSLA",
      sector: "automotive/energy",
      volatilityProfile: "high",
      growthProfile: "growth",
      marketCap: "large",
    },
    MSFT: {
      ticker: "MSFT",
      sector: "technology",
      volatilityProfile: "low",
      growthProfile: "balanced",
      marketCap: "large",
    },
    NVDA: {
      ticker: "NVDA",
      sector: "semiconductors",
      volatilityProfile: "medium",
      growthProfile: "growth",
      marketCap: "large",
    },
    AAPL: {
      ticker: "AAPL",
      sector: "technology",
      volatilityProfile: "low",
      growthProfile: "balanced",
      marketCap: "large",
    },
  }

  static generatePrecisionRecommendation(
    ticker: string,
    factors: PrecisionAnalysisFactors,
    currentPrice: number,
    fundamentals: any,
  ) {
    const profile = this.stockProfiles[ticker] || this.getDefaultProfile(ticker)

    // Calculate weighted composite score with profile adjustments
    const weights = this.getProfileWeights(profile)
    const compositeScore = this.calculateCompositeScore(factors, weights)

    // Calculate risk-adjusted score
    const riskScore = this.calculatePreciseRiskScore(factors, profile, fundamentals)
    const riskAdjustment = this.getRiskAdjustment(riskScore)
    const adjustedScore = compositeScore * riskAdjustment

    // Generate confidence with realistic variation
    const baseConfidence = this.calculateBaseConfidence(factors, profile)
    const confidence = this.applyConfidenceVariation(baseConfidence, ticker)

    // Determine recommendation with strict logic
    const recommendation = this.determineRecommendation(adjustedScore, confidence, riskScore, profile)

    // Calculate target price with precision
    const targetPrice = this.calculatePreciseTargetPrice(currentPrice, adjustedScore, profile, confidence)

    // Generate detailed reasoning
    const reasoning = this.generateDetailedReasoning(factors, profile, recommendation, riskScore)

    return {
      recommendation,
      confidence: Math.round(confidence),
      targetPrice,
      riskScore: Math.round(riskScore * 10) / 10,
      compositeScore: Math.round(compositeScore * 100) / 100,
      adjustedScore: Math.round(adjustedScore * 100) / 100,
      reasoning,
      factors: this.formatFactors(factors),
      profile,
      consistencyScore: this.calculateConsistencyScore(recommendation, confidence, riskScore, adjustedScore),
    }
  }

  private static getProfileWeights(profile: StockProfile) {
    const baseWeights = {
      technical: 0.25,
      fundamental: 0.25,
      sentiment: 0.2,
      news: 0.15,
      momentum: 0.1,
      volume: 0.05,
    }

    // Adjust weights based on profile
    if (profile.growthProfile === "growth") {
      baseWeights.sentiment += 0.05
      baseWeights.momentum += 0.05
      baseWeights.fundamental -= 0.1
    } else if (profile.growthProfile === "value") {
      baseWeights.fundamental += 0.1
      baseWeights.sentiment -= 0.05
      baseWeights.momentum -= 0.05
    }

    if (profile.volatilityProfile === "high") {
      baseWeights.technical += 0.05
      baseWeights.sentiment += 0.05
      baseWeights.fundamental -= 0.1
    }

    return baseWeights
  }

  private static calculateCompositeScore(factors: PrecisionAnalysisFactors, weights: any): number {
    return (
      factors.technicalScore * weights.technical +
      factors.fundamentalScore * weights.fundamental +
      factors.sentimentScore * weights.sentiment +
      factors.newsScore * weights.news +
      factors.momentum * weights.momentum +
      factors.volume * weights.volume
    )
  }

  private static calculatePreciseRiskScore(
    factors: PrecisionAnalysisFactors,
    profile: StockProfile,
    fundamentals: any,
  ): number {
    let riskScore = 5 // Base medium risk

    // Volatility impact
    const volatilityMultiplier = {
      low: 0.8,
      medium: 1.0,
      high: 1.4,
    }
    riskScore *= volatilityMultiplier[profile.volatilityProfile]

    // Technical risk factors
    riskScore += factors.volatility * 2
    if (factors.technicalScore > 0.8 || factors.technicalScore < 0.2) riskScore += 0.5

    // Fundamental risk factors
    if (fundamentals?.pe > 30) riskScore += 1
    if (fundamentals?.beta > 1.5) riskScore += 1
    if (fundamentals?.pe < 10) riskScore -= 0.5

    // Market conditions
    riskScore += (1 - factors.marketConditions) * 2

    // Sector-specific adjustments
    if (profile.sector === "semiconductors") riskScore += 0.5
    if (profile.sector === "automotive/energy") riskScore += 1
    if (profile.sector === "technology" && profile.marketCap === "large") riskScore -= 0.5

    return Math.max(1, Math.min(10, riskScore))
  }

  private static getRiskAdjustment(riskScore: number): number {
    // More conservative adjustment for high risk
    if (riskScore >= 8) return 0.6
    if (riskScore >= 6) return 0.8
    if (riskScore >= 4) return 0.95
    return 1.0
  }

  private static calculateBaseConfidence(factors: PrecisionAnalysisFactors, profile: StockProfile): number {
    let confidence = 70 // Base confidence

    // Factor alignment increases confidence
    const factorAlignment = this.calculateFactorAlignment(factors)
    confidence += factorAlignment * 20

    // Profile stability
    if (profile.volatilityProfile === "low") confidence += 5
    if (profile.marketCap === "large") confidence += 3

    // Technical strength
    if (factors.technicalScore > 0.7 || factors.technicalScore < 0.3) confidence += 5

    return Math.max(55, Math.min(90, confidence))
  }

  private static calculateFactorAlignment(factors: PrecisionAnalysisFactors): number {
    const scores = [factors.technicalScore, factors.fundamentalScore, factors.sentimentScore, factors.newsScore]

    const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length

    // Lower variance = higher alignment
    return Math.max(0, 1 - variance * 2)
  }

  private static applyConfidenceVariation(baseConfidence: number, ticker: string): number {
    // Create deterministic but varied confidence based on ticker
    const tickerHash = ticker.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const variation = ((tickerHash % 20) - 10) * 0.5 // -5 to +5 variation
    const timeVariation = ((Date.now() % 10) - 5) * 0.3 // Small time-based variation

    return Math.max(55, Math.min(95, baseConfidence + variation + timeVariation))
  }

  private static determineRecommendation(
    adjustedScore: number,
    confidence: number,
    riskScore: number,
    profile: StockProfile,
  ): "BUY" | "SELL" | "HOLD" | "TRIM" {
    // Strict logic for recommendations

    // High risk override
    if (riskScore >= 8.5) {
      if (adjustedScore > 0.7 && confidence > 85) return "HOLD"
      return "SELL"
    }

    // Very high risk
    if (riskScore >= 7.5) {
      if (adjustedScore > 0.6 && confidence > 80) return "HOLD"
      if (adjustedScore < 0.4) return "SELL"
      return "TRIM"
    }

    // Medium-high risk
    if (riskScore >= 6) {
      if (adjustedScore > 0.65 && confidence > 75) return "BUY"
      if (adjustedScore < 0.35) return "TRIM"
      return "HOLD"
    }

    // Medium risk
    if (riskScore >= 4) {
      if (adjustedScore > 0.6 && confidence > 70) return "BUY"
      if (adjustedScore < 0.4 && confidence > 70) return "TRIM"
      return "HOLD"
    }

    // Low risk
    if (adjustedScore > 0.55 && confidence > 65) return "BUY"
    if (adjustedScore < 0.45 && confidence > 70) return "TRIM"
    return "HOLD"
  }

  private static calculatePreciseTargetPrice(
    currentPrice: number,
    adjustedScore: number,
    profile: StockProfile,
    confidence: number,
  ): number {
    // Base price change from adjusted score
    let priceChangePercent = (adjustedScore - 0.5) * 0.2 // -10% to +10% base range

    // Profile adjustments
    const volatilityMultiplier = {
      low: 0.7,
      medium: 1.0,
      high: 1.5,
    }
    priceChangePercent *= volatilityMultiplier[profile.volatilityProfile]

    // Confidence adjustment
    const confidenceMultiplier = confidence / 75
    priceChangePercent *= confidenceMultiplier

    // Apply realistic bounds
    priceChangePercent = Math.max(-0.25, Math.min(0.35, priceChangePercent))

    return currentPrice * (1 + priceChangePercent)
  }

  private static generateDetailedReasoning(
    factors: PrecisionAnalysisFactors,
    profile: StockProfile,
    recommendation: string,
    riskScore: number,
  ): string[] {
    const reasoning = []

    // Technical analysis
    if (factors.technicalScore > 0.6) {
      reasoning.push("Technical indicators show bullish momentum with strong support levels")
    } else if (factors.technicalScore < 0.4) {
      reasoning.push("Technical analysis reveals bearish patterns and potential resistance")
    } else {
      reasoning.push("Technical indicators present mixed signals requiring cautious approach")
    }

    // Fundamental analysis
    if (factors.fundamentalScore > 0.6) {
      reasoning.push("Strong fundamental metrics support positive valuation outlook")
    } else if (factors.fundamentalScore < 0.4) {
      reasoning.push("Fundamental concerns suggest potential overvaluation risks")
    } else {
      reasoning.push("Fundamental analysis shows balanced risk-reward profile")
    }

    // Risk assessment
    if (riskScore >= 7) {
      reasoning.push("Elevated risk profile necessitates conservative positioning")
    } else if (riskScore <= 4) {
      reasoning.push("Favorable risk characteristics support more aggressive allocation")
    } else {
      reasoning.push("Moderate risk profile suggests balanced investment approach")
    }

    // Profile-specific reasoning
    if (profile.volatilityProfile === "high") {
      reasoning.push("High volatility profile requires careful timing and position sizing")
    }

    if (profile.growthProfile === "growth") {
      reasoning.push("Growth-oriented profile benefits from momentum-based strategies")
    }

    // Recommendation justification
    reasoning.push(this.getRecommendationJustification(recommendation, riskScore))

    return reasoning
  }

  private static getRecommendationJustification(recommendation: string, riskScore: number): string {
    switch (recommendation) {
      case "BUY":
        return "Analysis supports accumulation with favorable risk-adjusted return potential"
      case "SELL":
        return `High risk profile (${riskScore.toFixed(1)}/10) warrants position reduction`
      case "TRIM":
        return "Partial position reduction recommended to optimize risk-return balance"
      case "HOLD":
      default:
        return "Current analysis suggests maintaining existing position size"
    }
  }

  private static formatFactors(factors: PrecisionAnalysisFactors) {
    return [
      {
        name: "Technical Analysis",
        score: Math.round(factors.technicalScore * 100),
        impact: Math.abs(factors.technicalScore - 0.5) * 200,
        direction: factors.technicalScore > 0.5 ? "positive" : "negative",
      },
      {
        name: "Fundamental Strength",
        score: Math.round(factors.fundamentalScore * 100),
        impact: Math.abs(factors.fundamentalScore - 0.5) * 200,
        direction: factors.fundamentalScore > 0.5 ? "positive" : "negative",
      },
      {
        name: "Market Sentiment",
        score: Math.round(factors.sentimentScore * 100),
        impact: Math.abs(factors.sentimentScore - 0.5) * 200,
        direction: factors.sentimentScore > 0.5 ? "positive" : "negative",
      },
      {
        name: "News Impact",
        score: Math.round(factors.newsScore * 100),
        impact: Math.abs(factors.newsScore - 0.5) * 200,
        direction: factors.newsScore > 0.5 ? "positive" : "negative",
      },
    ]
  }

  private static calculateConsistencyScore(
    recommendation: string,
    confidence: number,
    riskScore: number,
    adjustedScore: number,
  ): number {
    let score = 100

    // Check recommendation-risk alignment
    if (recommendation === "BUY" && riskScore > 7) score -= 30
    if (recommendation === "SELL" && riskScore < 4) score -= 25
    if ((recommendation === "BUY" || recommendation === "SELL") && confidence < 70) score -= 20

    // Check score-recommendation alignment
    if (recommendation === "BUY" && adjustedScore < 0.5) score -= 25
    if (recommendation === "SELL" && adjustedScore > 0.5) score -= 25

    return Math.max(0, score)
  }

  private static getDefaultProfile(ticker: string): StockProfile {
    return {
      ticker,
      sector: "general",
      volatilityProfile: "medium",
      growthProfile: "balanced",
      marketCap: "large",
    }
  }
}
