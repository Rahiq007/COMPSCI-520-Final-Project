import { type NextRequest, NextResponse } from "next/server"
import { groqClient } from "@/lib/ai/groq-client"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    const { ticker, stockData, analysisType = "comprehensive" } = await request.json()

    if (!ticker || !stockData) {
      return NextResponse.json({ error: "Missing required data" }, { status: 400 })
    }

    let aiAnalysis

    switch (analysisType) {
      case "comprehensive":
        aiAnalysis = await groqClient.generateStockAnalysis(stockData)
        break
      case "trading":
        aiAnalysis = await groqClient.generateTradingStrategy({
          ticker,
          timeframe: stockData.timeframe || "1m",
          riskTolerance: "moderate",
          position: stockData.shares || 0,
        })
        break
      case "market":
        aiAnalysis = await groqClient.generateMarketInsights({
          topStocks: [ticker],
          marketTrend: "neutral",
          volatility: stockData.risk?.volatility || 0.2,
        })
        break
      default:
        aiAnalysis = await groqClient.generateStockAnalysis(stockData)
    }

    // Store AI analysis in database (non-blocking)
    sql`
      INSERT INTO ai_analysis (
        ticker, analysis_type, ai_recommendation, confidence_score, 
        reasoning, created_at, model_used, response_time_ms
      ) VALUES (
        ${ticker}, ${analysisType}, ${aiAnalysis.recommendation || "HOLD"}, 
        ${aiAnalysis.confidence || 75}, ${aiAnalysis.reasoning || aiAnalysis}, 
        NOW(), 'groq-llama-3.1-70b', ${Date.now() - startTime}
      )
    `.catch((err) => {
      console.warn("Non-critical: Failed to store AI analysis in database:", err.message)
    })

    return NextResponse.json({
      success: true,
      analysis: aiAnalysis,
      metadata: {
        model: "groq-llama-3.1-70b",
        responseTime: Date.now() - startTime,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error: any) {
    console.error("AI Analysis error:", error)

    // Log error to database
    await sql`
      INSERT INTO error_logs (
        error_type, message, details, timestamp, request_id, 
        user_message, retryable, stack_trace
      ) VALUES (
        'AI_ANALYSIS_ERROR', ${error.message}, ${JSON.stringify({ ticker: "", analysisType: "" })},
        NOW(), ${"ai_" + Date.now()}, 'AI analysis temporarily unavailable', 
        true, ${error.stack}
      )
    `.catch(() => {})

    return NextResponse.json(
      {
        error: "AI analysis temporarily unavailable",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    )
  }
}
