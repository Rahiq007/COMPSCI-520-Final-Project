import { createGroq } from "@ai-sdk/groq"
import { generateText, streamText } from "ai"

const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY,
})

export class GroqAIClient {
  private model = groq("llama-3.3-70b-versatile")

  async generateStockAnalysis(stockData: {
    ticker: string
    currentPrice: number
    technicalIndicators: any
    sentiment: any
    news: any
    fundamentals: any
  }) {
    try {
      const prompt = `
        As an expert financial analyst, provide a comprehensive analysis of ${stockData.ticker} stock.
        
        Current Data:
        - Price: $${stockData.currentPrice}
        - RSI: ${stockData.technicalIndicators?.rsi || "N/A"}
        - MACD: ${stockData.technicalIndicators?.macd?.value || "N/A"}
        - P/E Ratio: ${stockData.fundamentals?.pe || "N/A"}
        - Market Sentiment: ${(stockData.sentiment?.overall * 100).toFixed(1)}%
        
        Provide:
        1. Technical analysis summary
        2. Fundamental strength assessment
        3. Market sentiment interpretation
        4. Risk factors
        5. Investment recommendation (BUY/SELL/HOLD)
        6. Price target with reasoning
        
        Keep response concise but comprehensive. Focus on actionable insights.
      `

      const { text } = await generateText({
        model: this.model,
        prompt,
        maxTokens: 1000,
        temperature: 0.3,
      })

      return this.parseAnalysisResponse(text)
    } catch (error) {
      console.error("Groq analysis error:", error)
      throw new Error("Failed to generate AI analysis")
    }
  }

  async generateMarketInsights(marketData: {
    topStocks: string[]
    marketTrend: string
    volatility: number
  }) {
    try {
      const prompt = `
        Analyze current market conditions and provide insights:
        
        Market Data:
        - Top performing stocks: ${marketData.topStocks.join(", ")}
        - Market trend: ${marketData.marketTrend}
        - Volatility index: ${marketData.volatility}
        
        Provide:
        1. Overall market assessment
        2. Sector rotation opportunities
        3. Risk management recommendations
        4. Key levels to watch
        
        Keep response under 500 words.
      `

      const { text } = await generateText({
        model: this.model,
        prompt,
        maxTokens: 600,
        temperature: 0.4,
      })

      return text
    } catch (error) {
      console.error("Groq market insights error:", error)
      throw new Error("Failed to generate market insights")
    }
  }

  async generateTradingStrategy(data: {
    ticker: string
    timeframe: string
    riskTolerance: string
    position: number
  }) {
    try {
      const prompt = `
        Create a trading strategy for ${data.ticker}:
        
        Parameters:
        - Timeframe: ${data.timeframe}
        - Risk tolerance: ${data.riskTolerance}
        - Current position: ${data.position} shares
        
        Provide:
        1. Entry/exit strategy
        2. Position sizing recommendations
        3. Stop-loss levels
        4. Profit targets
        5. Risk management rules
        
        Format as actionable trading plan.
      `

      const { text } = await generateText({
        model: this.model,
        prompt,
        maxTokens: 800,
        temperature: 0.2,
      })

      return text
    } catch (error) {
      console.error("Groq trading strategy error:", error)
      throw new Error("Failed to generate trading strategy")
    }
  }

  async streamAnalysis(prompt: string) {
    try {
      const result = streamText({
        model: this.model,
        prompt,
        maxTokens: 1000,
        temperature: 0.3,
      })

      return result
    } catch (error) {
      console.error("Groq stream error:", error)
      throw new Error("Failed to stream analysis")
    }
  }

  private parseAnalysisResponse(text: string) {
    // Extract key components from AI response
    const lines = text.split("\n").filter((line) => line.trim())

    let recommendation = "HOLD"
    let confidence = 75
    let targetPrice = 0
    const reasoning = text

    // Simple parsing logic - in production, use more sophisticated NLP
    if (text.toLowerCase().includes("buy") || text.toLowerCase().includes("bullish")) {
      recommendation = "BUY"
      confidence = 80
    } else if (text.toLowerCase().includes("sell") || text.toLowerCase().includes("bearish")) {
      recommendation = "SELL"
      confidence = 80
    }

    // Extract price target if mentioned
    const priceMatch = text.match(/\$(\d+(?:\.\d{2})?)/g)
    if (priceMatch && priceMatch.length > 0) {
      targetPrice = Number.parseFloat(priceMatch[priceMatch.length - 1].replace("$", ""))
    }

    return {
      recommendation,
      confidence,
      targetPrice,
      reasoning,
      aiGenerated: true,
      timestamp: new Date().toISOString(),
    }
  }

  async generateChatResponse(userMessage: string) {
    try {
      const prompt = `
        You are a helpful AI assistant for QuantPredict Pro, a stock prediction and analysis platform.
        You can help users with:
        - Understanding stock analysis features
        - Explaining technical indicators (RSI, MACD, Bollinger Bands, etc.)
        - Interpreting market data and predictions
        - General investment concepts and terminology
        - How to use the platform features
        
        User question: ${userMessage}
        
        Provide a helpful, concise, and accurate response. If the question is about stock recommendations,
        remind users that this is for informational purposes only and not financial advice.
      `

      const { text } = await generateText({
        model: this.model,
        prompt,
        maxTokens: 500,
        temperature: 0.7,
      })

      return text
    } catch (error) {
      console.error("Chat response error:", error)
      throw new Error("Failed to generate chat response")
    }
  }

  async generateNewsSummary(ticker: string, news: any[]) {
    try {
      const newsText = news
        .slice(0, 5)
        .map((item) => `${item.title || item.headline}: ${item.summary || item.description || ""}`)
        .join("\n\n")

      const prompt = `
        Analyze the following news articles about ${ticker} and provide:
        1. A brief 2-3 sentence summary
        2. 3-4 key bullet points
        3. Overall sentiment (positive/negative/neutral)
        4. Impact level (high/medium/low)
        
        News articles:
        ${newsText}
        
        Format your response as JSON with this structure:
        {
          "summary": "brief summary here",
          "keyPoints": ["point 1", "point 2", "point 3"],
          "sentiment": "positive|negative|neutral",
          "impact": "high|medium|low"
        }
      `

      const { text } = await generateText({
        model: this.model,
        prompt,
        maxTokens: 600,
        temperature: 0.4,
      })

      // Try to parse JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }

      // Fallback if JSON parsing fails
      return {
        summary: text.substring(0, 300),
        keyPoints: ["News analysis completed", "Multiple factors at play", "Monitoring situation"],
        sentiment: "neutral",
        impact: "medium",
      }
    } catch (error) {
      console.error("News summary error:", error)
      throw new Error("Failed to generate news summary")
    }
  }

  async generateTradingSignal(stockData: any) {
    try {
      const prompt = `
        Based on the following stock data, generate a trading signal:
        
        Ticker: ${stockData.ticker}
        Current Price: $${stockData.currentPrice}
        RSI: ${stockData.technicalIndicators?.rsi || "N/A"}
        MACD: ${stockData.technicalIndicators?.macd?.value || "N/A"}
        Volume: ${stockData.volume || "N/A"}
        Price Change: ${stockData.change || "N/A"}%
        
        Provide:
        1. Signal: BUY/SELL/HOLD
        2. Strength: STRONG/MODERATE/WEAK
        3. Reason (1 sentence)
        4. Confidence score (0-100)
        
        Format as JSON:
        {
          "signal": "BUY|SELL|HOLD",
          "strength": "STRONG|MODERATE|WEAK",
          "reason": "brief reason",
          "confidence": 85
        }
      `

      const { text } = await generateText({
        model: this.model,
        prompt,
        maxTokens: 300,
        temperature: 0.3,
      })

      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }

      return {
        signal: "HOLD",
        strength: "MODERATE",
        reason: "Awaiting clearer market signals",
        confidence: 65,
      }
    } catch (error) {
      console.error("Trading signal error:", error)
      throw new Error("Failed to generate trading signal")
    }
  }

  async generatePredictiveAlert(ticker: string, prediction: any, volatility: number) {
    try {
      const prompt = `
        Generate a smart reminder for ${ticker}:
        
        Current Price: $${prediction.currentPrice}
        Predicted Price: $${prediction.targetPrice}
        Volatility: ${volatility}
        Timeframe: ${prediction.timeframe || "1 month"}
        
        Suggest:
        1. When to check back (e.g., "in 3 days", "next week")
        2. What to watch for (e.g., "earnings report", "price breakout")
        3. Priority (high/medium/low)
        
        Format as JSON:
        {
          "checkBackIn": "3 days",
          "watchFor": "earnings report on [date]",
          "priority": "high|medium|low",
          "reason": "brief explanation"
        }
      `

      const { text } = await generateText({
        model: this.model,
        prompt,
        maxTokens: 300,
        temperature: 0.5,
      })

      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }

      return {
        checkBackIn: "3-5 days",
        watchFor: "price movement and volume changes",
        priority: "medium",
        reason: "Based on current market conditions",
      }
    } catch (error) {
      console.error("Predictive alert error:", error)
      throw new Error("Failed to generate predictive alert")
    }
  }

  async generatePortfolioOptimization(portfolio: any[]) {
    try {
      const portfolioText = portfolio
        .map((p) => `${p.ticker}: ${p.shares} shares at $${p.currentPrice} (${p.allocation}%)`)
        .join("\n")

      const prompt = `
        Analyze this portfolio and suggest optimizations:
        
        ${portfolioText}
        
        Total Value: $${portfolio.reduce((sum, p) => sum + p.shares * p.currentPrice, 0).toFixed(2)}
        
        Provide:
        1. Overall assessment (diversification, risk level)
        2. 2-3 specific rebalancing suggestions
        3. Stocks to increase/decrease
        4. Risk score (0-100, where 100 is highest risk)
        
        Format as JSON:
        {
          "assessment": "brief overall assessment",
          "suggestions": ["suggestion 1", "suggestion 2"],
          "rebalancing": [
            {"action": "SELL", "ticker": "AAPL", "percentage": "10%", "reason": "overweight"},
            {"action": "BUY", "ticker": "NVDA", "percentage": "5%", "reason": "underweight"}
          ],
          "riskScore": 65
        }
      `

      const { text } = await generateText({
        model: this.model,
        prompt,
        maxTokens: 800,
        temperature: 0.4,
      })

      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0])
      }

      return {
        assessment: "Portfolio analysis completed",
        suggestions: ["Consider diversifying across sectors", "Review allocation percentages"],
        rebalancing: [],
        riskScore: 50,
      }
    } catch (error) {
      console.error("Portfolio optimization error:", error)
      throw new Error("Failed to generate portfolio optimization")
    }
  }
}

export const groqClient = new GroqAIClient()
