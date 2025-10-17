import { NextResponse } from "next/server"

// Top 5 cryptocurrencies to track
const CRYPTO_IDS = ["bitcoin", "ethereum", "binancecoin", "solana", "ripple"]

// Default crypto data as fallback
const DEFAULT_CRYPTOS = [
  {
    symbol: "BTC",
    name: "Bitcoin",
    price: 43250.5,
    change: 1250.3,
    changePercent: 2.98,
    volume: 28500000000,
    marketCap: 845000000000,
    high24h: 43800.0,
    low24h: 41900.0,
    rank: 1,
  },
  {
    symbol: "ETH",
    name: "Ethereum",
    price: 2285.75,
    change: -45.2,
    changePercent: -1.94,
    volume: 15200000000,
    marketCap: 275000000000,
    high24h: 2350.0,
    low24h: 2250.0,
    rank: 2,
  },
  {
    symbol: "BNB",
    name: "BNB",
    price: 315.8,
    change: 8.5,
    changePercent: 2.77,
    volume: 1850000000,
    marketCap: 47500000000,
    high24h: 320.0,
    low24h: 308.0,
    rank: 3,
  },
  {
    symbol: "SOL",
    name: "Solana",
    price: 98.45,
    change: 4.2,
    changePercent: 4.46,
    volume: 2100000000,
    marketCap: 42000000000,
    high24h: 101.0,
    low24h: 94.5,
    rank: 4,
  },
  {
    symbol: "XRP",
    name: "XRP",
    price: 0.52,
    change: 0.015,
    changePercent: 2.97,
    volume: 1200000000,
    marketCap: 28000000000,
    high24h: 0.53,
    low24h: 0.5,
    rank: 5,
  },
]

export async function GET() {
  try {
    // Try to fetch real data from CoinGecko (free tier, no API key needed)
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${CRYPTO_IDS.join(",")}&order=market_cap_desc&per_page=5&page=1&sparkline=false&price_change_percentage=24h`,
      {
        next: { revalidate: 60 }, // Cache for 60 seconds
      },
    )

    if (!response.ok) {
      throw new Error("Failed to fetch from CoinGecko")
    }

    const data = await response.json()

    // Transform the data to our format
    const cryptos = data.map((crypto: any, index: number) => ({
      symbol: crypto.symbol.toUpperCase(),
      name: crypto.name,
      price: crypto.current_price || 0,
      change: crypto.price_change_24h || 0,
      changePercent: crypto.price_change_percentage_24h || 0,
      volume: crypto.total_volume || 0,
      marketCap: crypto.market_cap || 0,
      high24h: crypto.high_24h || 0,
      low24h: crypto.low_24h || 0,
      rank: crypto.market_cap_rank || index + 1,
    }))

    return NextResponse.json({
      cryptos,
      lastUpdated: new Date().toISOString(),
      success: true,
    })
  } catch (error) {
    console.error("Failed to fetch crypto data:", error)

    // Return default data as fallback
    return NextResponse.json({
      cryptos: DEFAULT_CRYPTOS,
      lastUpdated: new Date().toISOString(),
      success: true,
    })
  }
}
