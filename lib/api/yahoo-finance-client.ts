export class YahooFinanceClient {
  private baseUrl = "https://query1.finance.yahoo.com"

  async getQuote(symbol: string) {
    const response = await fetch(`${this.baseUrl}/v8/finance/chart/${symbol}`)
    if (!response.ok) {
      throw new Error(`Yahoo Finance API error: ${response.statusText}`)
    }
    return response.json()
  }

  async getHistoricalData(symbol: string, period1: number, period2: number, interval = "1d") {
    const response = await fetch(
      `${this.baseUrl}/v8/finance/chart/${symbol}?period1=${period1}&period2=${period2}&interval=${interval}`,
    )
    if (!response.ok) {
      throw new Error(`Yahoo Finance API error: ${response.statusText}`)
    }
    return response.json()
  }

  async getCompanyInfo(symbol: string) {
    const response = await fetch(
      `${this.baseUrl}/v10/finance/quoteSummary/${symbol}?modules=summaryProfile,financialData,defaultKeyStatistics,summaryDetail`,
    )
    if (!response.ok) {
      throw new Error(`Yahoo Finance API error: ${response.statusText}`)
    }
    return response.json()
  }

  async getNews(symbol: string) {
    const response = await fetch(`${this.baseUrl}/v1/finance/search?q=${symbol}&quotesCount=1&newsCount=10`)
    if (!response.ok) {
      throw new Error(`Yahoo Finance API error: ${response.statusText}`)
    }
    return response.json()
  }
}
