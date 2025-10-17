import { type NextRequest, NextResponse } from "next/server"
import { groqClient } from "@/lib/ai/groq-client"

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    // Generate response using Groq
    const response = await groqClient.generateChatResponse(message)

    return NextResponse.json({
      success: true,
      response,
    })
  } catch (error: any) {
    console.error("Chat error:", error)

    return NextResponse.json(
      {
        error: "Failed to generate response",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    )
  }
}

