export class TwelveDataClient {
  private baseUrl = "https://api.twelvedata.com"
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async getQuote(symbol: string) {
    const response = await fetch(`${this.baseUrl}/quote?symbol=${symbol}&apikey=${this.apiKey}`)
    if (!response.ok) {
      throw new Error(`Twelve Data API error: ${response.statusText}`)
    }
    return response.json()
  }

  async getTimeSeries(symbol: string, interval: string, outputsize = 5000) {
    const response = await fetch(
      `${this.baseUrl}/time_series?symbol=${symbol}&interval=${interval}&outputsize=${outputsize}&apikey=${this.apiKey}`,
    )
    if (!response.ok) {
      throw new Error(`Twelve Data API error: ${response.statusText}`)
    }
    return response.json()
  }

  async getTechnicalIndicator(symbol: string, indicator: string, interval: string, params: any = {}) {
    const queryParams = new URLSearchParams({
      symbol,
      interval,
      apikey: this.apiKey,
      ...params,
    })

    const response = await fetch(`${this.baseUrl}/${indicator}?${queryParams}`)
    if (!response.ok) {
      throw new Error(`Twelve Data API error: ${response.statusText}`)
    }
    return response.json()
  }

  async getRSI(symbol: string, interval: string, timePeriod = 14) {
    return this.getTechnicalIndicator(symbol, "rsi", interval, { time_period: timePeriod })
  }

  async getMACD(symbol: string, interval: string) {
    return this.getTechnicalIndicator(symbol, "macd", interval)
  }

  async getSMA(symbol: string, interval: string, timePeriod = 20) {
    return this.getTechnicalIndicator(symbol, "sma", interval, { time_period: timePeriod })
  }

  async getEMA(symbol: string, interval: string, timePeriod = 20) {
    return this.getTechnicalIndicator(symbol, "ema", interval, { time_period: timePeriod })
  }
}
