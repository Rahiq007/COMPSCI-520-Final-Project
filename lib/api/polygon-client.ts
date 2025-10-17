export class PolygonClient {
  private baseUrl = "https://api.polygon.io"
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async getQuote(symbol: string) {
    const response = await fetch(`${this.baseUrl}/v2/last/trade/${symbol}?apikey=${this.apiKey}`)
    if (!response.ok) {
      throw new Error(`Polygon API error: ${response.statusText}`)
    }
    return response.json()
  }

  async getAggregates(symbol: string, multiplier: number, timespan: string, from: string, to: string) {
    const response = await fetch(
      `${this.baseUrl}/v2/aggs/ticker/${symbol}/range/${multiplier}/${timespan}/${from}/${to}?adjusted=true&sort=asc&limit=5000&apikey=${this.apiKey}`,
    )
    if (!response.ok) {
      throw new Error(`Polygon API error: ${response.statusText}`)
    }
    return response.json()
  }

  async getTickerDetails(symbol: string) {
    const response = await fetch(`${this.baseUrl}/v3/reference/tickers/${symbol}?apikey=${this.apiKey}`)
    if (!response.ok) {
      throw new Error(`Polygon API error: ${response.statusText}`)
    }
    return response.json()
  }

  async getMarketStatus() {
    const response = await fetch(`${this.baseUrl}/v1/marketstatus/now?apikey=${this.apiKey}`)
    if (!response.ok) {
      throw new Error(`Polygon API error: ${response.statusText}`)
    }
    return response.json()
  }
}
