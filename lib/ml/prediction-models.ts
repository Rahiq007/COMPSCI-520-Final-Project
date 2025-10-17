export class PredictionModels {
  static async ensemblePrediction(features: any): Promise<{
    direction: string
    confidence: number
    targetPrice: number
    factors: any[]
  }> {
    const { currentPrice, technicalScore, sentimentScore, volumeScore, newsScore, fundamentalScore } = features

    // Technical Analysis Model
    const technicalPrediction = this.technicalModel(technicalScore)

    // Sentiment Analysis Model
    const sentimentPrediction = this.sentimentModel(sentimentScore)

    // Fundamental Analysis Model
    const fundamentalPrediction = this.fundamentalModel(fundamentalScore)

    // News Impact Model
    const newsPrediction = this.newsModel(newsScore)

    // Ensemble weights
    const weights = {
      technical: 0.35,
      sentiment: 0.25,
      fundamental: 0.25,
      news: 0.15,
    }

    // Weighted ensemble prediction
    const ensemblePrediction =
      technicalPrediction * weights.technical +
      sentimentPrediction * weights.sentiment +
      fundamentalPrediction * weights.fundamental +
      newsPrediction * weights.news

    const targetPrice = currentPrice * (1 + ensemblePrediction)
    const direction = ensemblePrediction > 0 ? "up" : "down"
    const confidence = Math.min(95, Math.max(60, 75 + Math.abs(ensemblePrediction) * 200))

    const factors = [
      {
        name: "Technical Analysis",
        impact: Math.abs(technicalPrediction) * 100,
        direction: technicalPrediction > 0 ? "positive" : "negative",
      },
      {
        name: "Market Sentiment",
        impact: Math.abs(sentimentPrediction) * 100,
        direction: sentimentPrediction > 0 ? "positive" : "negative",
      },
      {
        name: "Fundamental Analysis",
        impact: Math.abs(fundamentalPrediction) * 100,
        direction: fundamentalPrediction > 0 ? "positive" : "negative",
      },
      {
        name: "News Impact",
        impact: Math.abs(newsPrediction) * 100,
        direction: newsPrediction > 0 ? "positive" : "negative",
      },
    ]

    return {
      direction,
      confidence: Math.round(confidence),
      targetPrice,
      factors,
    }
  }

  private static technicalModel(score: number): number {
    // Sigmoid activation for technical indicators
    return Math.tanh(score * 0.1)
  }

  private static sentimentModel(score: number): number {
    // Linear model for sentiment
    return (score - 0.5) * 0.2
  }

  private static fundamentalModel(score: number): number {
    // Fundamental analysis model
    return Math.tanh(score * 0.05)
  }

  private static newsModel(score: number): number {
    // News impact model with decay
    return (score - 0.5) * 0.15
  }

  static calculateRecommendation(direction: string, confidence: number, riskScore: number): string {
    if (confidence < 65) return "HOLD"

    if (direction === "up") {
      if (confidence > 85 && riskScore < 6) return "BUY"
      if (confidence > 75) return "BUY"
      return "HOLD"
    } else {
      if (confidence > 85 && riskScore > 7) return "SELL"
      if (confidence > 75) return "TRIM"
      return "HOLD"
    }
  }
}
