import { type NextRequest, NextResponse } from "next/server"
import { streamText } from "ai"
import { groq } from "@ai-sdk/groq"

export const runtime = "edge"

export async function POST(req: NextRequest) {
  try {
    // Parse request body with error handling
    let body
    try {
      body = await req.json()
    } catch (parseError) {
      console.error("JSON parse error:", parseError)
      return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 })
    }

    const { messages, ticker, stockData } = body

    // Validate required fields
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Messages array is required" }, { status: 400 })
    }

    if (messages.length === 0) {
      return NextResponse.json({ error: "At least one message is required" }, { status: 400 })
    }

    // Get the user's message
    const lastMessage = messages[messages.length - 1]
    if (!lastMessage?.content?.trim()) {
      return NextResponse.json({ error: "Message content cannot be empty" }, { status: 400 })
    }

    console.log(`AI Stream Request for ${ticker || "UNKNOWN"}:`, {
      messageCount: messages.length,
      hasStockData: !!stockData,
      lastMessageLength: lastMessage.content.length,
    })

    // Create system prompt with available data
    const systemPrompt = `You are a professional financial analyst providing insights about ${ticker || "the stock"}. 

${
  stockData
    ? `Current Market Data:
- Price: $${stockData.currentPrice || "N/A"}
- Technical Indicators: ${JSON.stringify(stockData.technicalIndicators || {}, null, 2)}
- Sentiment: ${stockData.sentiment || "N/A"}
- Fundamentals: ${JSON.stringify(stockData.fundamentals || {}, null, 2)}
- Prediction: ${JSON.stringify(stockData.prediction || {}, null, 2)}`
    : "Limited market data available."
}

Provide professional, clear, and actionable financial analysis. Always mention this is for educational purposes only and not personalized financial advice.`

    // Prepare messages for AI
    const aiMessages = [
      { role: "system" as const, content: systemPrompt },
      ...messages.map((msg: any) => ({
        role: msg.role as "user" | "assistant",
        content: String(msg.content || ""),
      })),
    ]

    console.log("Calling Groq API...")

    // Call Groq API with error handling
    let result
    try {
      result = await streamText({
        model: groq("llama-3.1-70b-versatile"),
        messages: aiMessages,
        maxTokens: 1000,
        temperature: 0.3,
        topP: 0.9,
      })
    } catch (groqError: any) {
      console.error("Groq API Error:", groqError)
      return NextResponse.json(
        {
          error: "AI service temporarily unavailable",
          details: groqError.message || "Unknown AI service error",
        },
        { status: 503 },
      )
    }

    console.log("Groq API call successful, returning stream...")

    // Return streaming response
    return result.toDataStreamResponse({
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    })
  } catch (error: any) {
    console.error("AI Stream Route Error:", {
      name: error.name,
      message: error.message,
      stack: error.stack,
    })

    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message || "Unknown error occurred",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}
