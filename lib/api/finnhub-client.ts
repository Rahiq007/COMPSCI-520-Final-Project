export class FinnhubClient {
  private baseUrl = "https://finnhub.io/api/v1"
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async getQuote(symbol: string) {
    const response = await fetch(`${this.baseUrl}/quote?symbol=${symbol}&token=${this.apiKey}`)
    if (!response.ok) {
      throw new Error(`Finnhub API error: ${response.statusText}`)
    }
    return response.json()
  }

  async getCompanyProfile(symbol: string) {
    const response = await fetch(`${this.baseUrl}/stock/profile2?symbol=${symbol}&token=${this.apiKey}`)
    if (!response.ok) {
      throw new Error(`Finnhub API error: ${response.statusText}`)
    }
    return response.json()
  }

  // async getCandles(symbol: string, resolution: string, from: number, to: number) {
  //   const response = await fetch(
  //     `${this.baseUrl}/stock/candle?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${to}&token=${this.apiKey}`,
  //   )
  //   if (!response.ok) {
  //     throw new Error(`Finnhub API error: ${response.statusText}`)
  //   }
  //   return response.json()
  // }

  async getNews(symbol: string, from: string, to: string) {
    const response = await fetch(
      `${this.baseUrl}/company-news?symbol=${symbol}&from=${from}&to=${to}&token=${this.apiKey}`,
    )
    if (!response.ok) {
      throw new Error(`Finnhub API error: ${response.statusText}`)
    }
    return response.json()
  }

  async getBasicFinancials(symbol: string) {
    const response = await fetch(`${this.baseUrl}/stock/metric?symbol=${symbol}&metric=all&token=${this.apiKey}`)
    if (!response.ok) {
      throw new Error(`Finnhub API error: ${response.statusText}`)
    }
    return response.json()
  }

  async getEarnings(symbol: string) {
    const response = await fetch(`${this.baseUrl}/stock/earnings?symbol=${symbol}&token=${this.apiKey}`)
    if (!response.ok) {
      throw new Error(`Finnhub API error: ${response.statusText}`)
    }
    return response.json()
  }

  async getRecommendations(symbol: string) {
    const response = await fetch(`${this.baseUrl}/stock/recommendation?symbol=${symbol}&token=${this.apiKey}`)
    if (!response.ok) {
      throw new Error(`Finnhub API error: ${response.statusText}`)
    }
    return response.json()
  }
}
