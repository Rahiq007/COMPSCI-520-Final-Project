import { NextResponse } from "next/server"

// Default news data as fallback
const DEFAULT_NEWS = [
  {
    id: "1",
    title: "Bitcoin ETF Sees Record Inflows as Institutional Interest Surges",
    summary:
      "Major Bitcoin ETFs recorded over $500M in net inflows this week, signaling growing institutional adoption and bullish sentiment in the crypto market.",
    category: "Institutional",
    sentiment: "positive",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    source: "CryptoNews",
  },
  {
    id: "2",
    title: "Ethereum Network Upgrade Promises 40% Gas Fee Reduction",
    summary:
      "The upcoming Ethereum Dencun upgrade is set to significantly reduce transaction costs through improved data availability and Layer 2 scaling solutions.",
    category: "Technology",
    sentiment: "positive",
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    source: "Ethereum Foundation",
  },
  {
    id: "3",
    title: "SEC Delays Decision on Multiple Spot Crypto ETF Applications",
    summary:
      "The Securities and Exchange Commission has postponed rulings on several cryptocurrency ETF proposals, citing need for additional review time.",
    category: "Regulation",
    sentiment: "neutral",
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    source: "Regulatory Watch",
  },
  {
    id: "4",
    title: "DeFi Protocol Launches Cross-Chain Bridge for Major Blockchains",
    summary:
      "A new decentralized finance protocol has introduced seamless asset transfers between Ethereum, Solana, and Binance Smart Chain networks.",
    category: "DeFi",
    sentiment: "positive",
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    source: "DeFi Pulse",
  },
  {
    id: "5",
    title: "Bitcoin Mining Difficulty Reaches All-Time High",
    summary:
      "Network security strengthens as Bitcoin mining difficulty adjusts to new record levels, reflecting increased computational power securing the blockchain.",
    category: "Mining",
    sentiment: "neutral",
    timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
    source: "Mining Report",
  },
]

const TRENDING_TOPICS = [
  { topic: "Bitcoin ETF Approval", mentions: 15420, trend: "up" },
  { topic: "Ethereum 2.0 Upgrade", mentions: 12800, trend: "up" },
  { topic: "DeFi Yield Farming", mentions: 9650, trend: "stable" },
  { topic: "NFT Marketplace Growth", mentions: 8200, trend: "down" },
  { topic: "Layer 2 Scaling Solutions", mentions: 7400, trend: "up" },
  { topic: "Crypto Regulation", mentions: 6900, trend: "up" },
]

export async function GET() {
  try {
    // In production, you would fetch from a real crypto news API
    // For now, we'll use our curated default data with dynamic timestamps

    const news = DEFAULT_NEWS.map((item) => ({
      ...item,
      // Make timestamps more recent
      timestamp: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
    }))

    return NextResponse.json({
      news,
      trendingTopics: TRENDING_TOPICS,
      lastUpdated: new Date().toISOString(),
      success: true,
    })
  } catch (error) {
    console.error("Failed to fetch crypto news:", error)

    return NextResponse.json({
      news: DEFAULT_NEWS,
      trendingTopics: TRENDING_TOPICS,
      lastUpdated: new Date().toISOString(),
      success: true,
    })
  }
}
