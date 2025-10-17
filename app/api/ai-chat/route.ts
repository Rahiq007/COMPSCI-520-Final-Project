import { type NextRequest, NextResponse } from "next/server"

/**
 * NEW: DeepSeek with Brave Search Implementation
 * Uses OpenRouter API with deepseek/deepseek-chat-v3.1 model
 * Performs web search via Brave Search API before generating response
 */
export async function POST(req: NextRequest) {
  try {
    const { message, ticker, stockData } = await req.json()

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    // Verify API keys
    if (!process.env.OPENROUTER_KEY || !process.env.BRAVE_SEARCH) {
      return NextResponse.json({ error: "AI service not configured" }, { status: 503 })
    }

    // Step 1: Perform Brave Search for general context (not stock-specific)
    // Stock data already comes from stockData parameter, search provides broader context
    const searchQuery = message
    const braveResponse = await fetch(
      `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(searchQuery)}`,
      {
        headers: {
          Accept: "application/json",
          "Accept-Encoding": "gzip",
          "X-Subscription-Token": process.env.BRAVE_SEARCH,
        },
      }
    )

    let searchContext = ""
    if (braveResponse.ok) {
      const searchData = await braveResponse.json()
      // Extract top 5 search results for context (increased from 3 for better coverage)
      const results = searchData.web?.results?.slice(0, 5) || []
      searchContext = results.map((r: any) => `- ${r.title}: ${r.description}`).join("\n")
    }

    // Step 2: Build system prompt with stock data and search results
    const systemPrompt = `You are a professional financial analyst providing insights about ${ticker || "the stock"}.

${stockData ? `Current Market Data:
- Price: $${stockData.currentPrice || "N/A"}
- Technical Indicators: ${JSON.stringify(stockData.technicalIndicators || {}, null, 2)}
- Sentiment: ${stockData.sentiment || "N/A"}
- Fundamentals: ${JSON.stringify(stockData.fundamentals || {}, null, 2)}
- Prediction: ${JSON.stringify(stockData.prediction || {}, null, 2)}` : "Limited market data available."}

${searchContext ? `Recent Web Search Results:\n${searchContext}` : ""}

Provide professional, clear, and actionable financial analysis. Keep responses concise but comprehensive. Always mention this is for educational purposes only and not personalized financial advice.`

    // Step 3: Call OpenRouter API with DeepSeek model
    console.log(`debug search result from brave: ${searchContext}.`)
    const openRouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat-v3.1",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        max_tokens: 1000,
        temperature: 0.3,
      }),
    })

    if (!openRouterResponse.ok) {
      const errorText = await openRouterResponse.text()
      console.error("OpenRouter API Error:", openRouterResponse.status, errorText)
      return NextResponse.json({ error: "AI service temporarily unavailable" }, { status: 503 })
    }

    const data = await openRouterResponse.json()
    const aiResponse = data.choices?.[0]?.message?.content || "Sorry, I couldn't generate a response."

    return NextResponse.json({
      response: aiResponse,
      timestamp: new Date().toISOString(),
      model: "deepseek/deepseek-chat-v3.1",
      searchEnabled: !!searchContext,
    })
  } catch (error: any) {
    console.error("AI Chat Error:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}

// ORIGINAL: Groq Implementation
// export async function POST(req: NextRequest) {
//   try {
//     const { message, ticker, stockData } = await req.json()

//     if (!message?.trim()) {
//       return NextResponse.json({ error: "Message is required" }, { status: 400 })
//     }

//     // Check if GROQ_API_KEY is available
//     if (!process.env.GROQ_API_KEY) {
//       return NextResponse.json({ error: "AI service not configured" }, { status: 503 })
//     }

//     // Create system prompt
//     const systemPrompt = `You are a professional financial analyst providing insights about ${ticker || "the stock"}. 

// ${
//   stockData
//     ? `Current Market Data:
// - Price: $${stockData.currentPrice || "N/A"}
// - Technical Indicators: ${JSON.stringify(stockData.technicalIndicators || {}, null, 2)}
// - Sentiment: ${stockData.sentiment || "N/A"}
// - Fundamentals: ${JSON.stringify(stockData.fundamentals || {}, null, 2)}
// - Prediction: ${JSON.stringify(stockData.prediction || {}, null, 2)}`
//     : "Limited market data available."
// }

// Provide professional, clear, and actionable financial analysis. Keep responses concise but comprehensive. Always mention this is for educational purposes only and not personalized financial advice.`

//     // Call Groq API directly with updated model
//     const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         model: "llama-3.1-8b-instant", // Updated to supported model
//         messages: [
//           { role: "system", content: systemPrompt },
//           { role: "user", content: message },
//         ],
//         max_tokens: 1000,
//         temperature: 0.3,
//         top_p: 0.9,
//       }),
//     })

//     if (!groqResponse.ok) {
//       const errorText = await groqResponse.text()
//       console.error("Groq API Error:", groqResponse.status, errorText)

//       // Try alternative model if the first one fails
//       if (groqResponse.status === 400) {
//         console.log("Trying alternative model...")

//         const fallbackResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
//           method: "POST",
//           headers: {
//             Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             model: "llama3-8b-8192", // Fallback model
//             messages: [
//               { role: "system", content: systemPrompt },
//               { role: "user", content: message },
//             ],
//             max_tokens: 1000,
//             temperature: 0.3,
//             top_p: 0.9,
//           }),
//         })

//         if (fallbackResponse.ok) {
//           const fallbackData = await fallbackResponse.json()
//           const aiResponse = fallbackData.choices?.[0]?.message?.content || "Sorry, I couldn't generate a response."

//           return NextResponse.json({
//             response: aiResponse,
//             timestamp: new Date().toISOString(),
//             model: "llama3-8b-8192",
//           })
//         }
//       }

//       return NextResponse.json({ error: "AI service temporarily unavailable" }, { status: 503 })
//     }

//     const groqData = await groqResponse.json()
//     const aiResponse = groqData.choices?.[0]?.message?.content || "Sorry, I couldn't generate a response."

//     return NextResponse.json({
//       response: aiResponse,
//       timestamp: new Date().toISOString(),
//       model: "llama-3.1-8b-instant",
//     })
//   } catch (error: any) {
//     console.error("AI Chat Error:", error)
//     return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
//   }
// }
