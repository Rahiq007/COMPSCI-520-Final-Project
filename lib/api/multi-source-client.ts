import { FinnhubClient } from "./finnhub-client"
import { PolygonClient } from "./polygon-client"
import { TwelveDataClient } from "./twelve-data-client"
import { YahooFinanceClient } from "./yahoo-finance-client"

export class MultiSourceStockClient {
  private finnhub: FinnhubClient | null = null
  private polygon: PolygonClient | null = null
  private twelveData: TwelveDataClient | null = null
  private yahoo: YahooFinanceClient

  constructor() {
    // Initialize clients based on available API keys
    if (process.env.FINNHUB_API_KEY) {
      this.finnhub = new FinnhubClient(process.env.FINNHUB_API_KEY)
    }
    if (process.env.POLYGON_API_KEY) {
      this.polygon = new PolygonClient(process.env.POLYGON_API_KEY)
    }
    if (process.env.TWELVE_DATA_API_KEY) {
      this.twelveData = new TwelveDataClient(process.env.TWELVE_DATA_API_KEY)
    }
    // Yahoo Finance doesn't require API key
    this.yahoo = new YahooFinanceClient()
  }

  async getQuote(symbol: string) {
    // Try sources in order of preference
    const sources = [
      { name: "finnhub", client: this.finnhub },
      { name: "polygon", client: this.polygon },
      { name: "twelveData", client: this.twelveData },
      { name: "yahoo", client: this.yahoo },
    ]

    for (const source of sources) {
      if (!source.client) continue

      try {
        console.log(`Trying ${source.name} for quote data...`)
        const data = await source.client.getQuote(symbol)

        if (source.name === "yahoo") {
          return this.normalizeYahooQuote(data)
        } else if (source.name === "finnhub") {
          return this.normalizeFinnhubQuote(data, symbol)
        } else if (source.name === "polygon") {
          return this.normalizePolygonQuote(data)
        } else if (source.name === "twelveData") {
          return this.normalizeTwelveDataQuote(data)
        }
      } catch (error) {
        console.warn(`${source.name} failed:`, error)
        continue
      }
    }

    throw new Error("All stock data sources failed")
  }

  async getHistoricalData(symbol: string, days = 365) {
    const endDate = new Date()
    const startDate = new Date(endDate.getTime() - days * 24 * 60 * 60 * 1000)

    // Try sources in order of preference
    // if (this.finnhub) {
    //   try {
    //     const data = await this.finnhub.getCandles(
    //       symbol,
    //       "D",
    //       Math.floor(startDate.getTime() / 1000),
    //       Math.floor(endDate.getTime() / 1000),
    //     )
    //     return this.normalizeFinnhubCandles(data)
    //   } catch (error) {
    //     console.warn("Finnhub historical data failed:", error)
    //   }
    // }

    if (this.twelveData) {
      try {
        const data = await this.twelveData.getTimeSeries(symbol, "1day", days)
        return this.normalizeTwelveDataTimeSeries(data)
      } catch (error) {
        console.warn("Twelve Data historical data failed:", error)
      }
    }

    // Fallback to Yahoo Finance
    try {
      const data = await this.yahoo.getHistoricalData(
        symbol,
        Math.floor(startDate.getTime() / 1000),
        Math.floor(endDate.getTime() / 1000),
      )
      return this.normalizeYahooHistorical(data)
    } catch (error) {
      console.warn("Yahoo Finance historical data failed:", error)
    }

    throw new Error("All historical data sources failed")
  }

  async getCompanyInfo(symbol: string) {
    if (this.finnhub) {
      try {
        const [profile, financials] = await Promise.all([
          this.finnhub.getCompanyProfile(symbol),
          this.finnhub.getBasicFinancials(symbol),
        ])
        return this.normalizeFinnhubCompanyInfo(profile, financials)
      } catch (error) {
        console.warn("Finnhub company info failed:", error)
      }
    }

    // Fallback to Yahoo Finance
    try {
      const data = await this.yahoo.getCompanyInfo(symbol)
      return this.normalizeYahooCompanyInfo(data)
    } catch (error) {
      console.warn("Yahoo Finance company info failed:", error)
    }

    throw new Error("All company info sources failed")
  }

  async getNews(symbol: string) {
    if (this.finnhub) {
      try {
        const endDate = new Date().toISOString().split("T")[0]
        const startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
        const data = await this.finnhub.getNews(symbol, startDate, endDate)
        return this.normalizeFinnhubNews(data)
      } catch (error) {
        console.warn("Finnhub news failed:", error)
      }
    }

    // Fallback to Yahoo Finance
    try {
      const data = await this.yahoo.getNews(symbol)
      return this.normalizeYahooNews(data)
    } catch (error) {
      console.warn("Yahoo Finance news failed:", error)
    }

    return { recent: [], trending: [] }
  }

  async getTechnicalIndicators(symbol: string) {
    if (this.twelveData) {
      try {
        const [rsi, macd, sma20, sma50] = await Promise.all([
          this.twelveData.getRSI(symbol, "1day"),
          this.twelveData.getMACD(symbol, "1day"),
          this.twelveData.getSMA(symbol, "1day", 20),
          this.twelveData.getSMA(symbol, "1day", 50),
        ])

        return this.normalizeTwelveDataTechnicals(rsi, macd, sma20, sma50)
      } catch (error) {
        console.warn("Twelve Data technical indicators failed:", error)
      }
    }

    // Fallback to calculated indicators from historical data
    try {
      const historical = await this.getHistoricalData(symbol, 200)
      return this.calculateTechnicalIndicators(historical)
    } catch (error) {
      console.warn("Calculated technical indicators failed:", error)
    }

    throw new Error("All technical indicator sources failed")
  }

  // Normalization methods
  private normalizeFinnhubQuote(data: any, symbol: string) {
    return {
      ticker: symbol,
      currentPrice: data.c,
      change: data.d,
      changePercent: data.dp,
      volume: 0, // Not provided in quote
      marketCap: 0, // Need separate call
      pe: 0, // Need separate call
      eps: 0, // Need separate call
      dividend: 0, // Need separate call
      beta: 0, // Need separate call
    }
  }

  private normalizeYahooQuote(data: any) {
    const result = data.chart.result[0]
    const meta = result.meta
    const quote = result.indicators.quote[0]

    // Get volume - try multiple sources and find last non-zero value
    let volume = 0
    
    // First try regularMarketVolume (current day's volume)
    if (meta.regularMarketVolume && meta.regularMarketVolume > 0) {
      volume = meta.regularMarketVolume
    } else if (quote.volume && quote.volume.length > 0) {
      // Find last non-zero volume from the array (most recent valid value)
      for (let i = quote.volume.length - 1; i >= 0; i--) {
        if (quote.volume[i] && quote.volume[i] > 0) {
          volume = quote.volume[i]
          break
        }
      }
    } else if (meta.volume && meta.volume > 0) {
      volume = meta.volume
    }

    // Log volume extraction for debugging
    if (volume > 0) {
      console.log(`[normalizeYahooQuote] Volume extracted: ${volume.toLocaleString()} for ${meta.symbol}`)
    } else {
      console.warn(`[normalizeYahooQuote] No volume found for ${meta.symbol}`, {
        hasRegularMarketVolume: !!meta.regularMarketVolume,
        hasVolumeArray: !!quote.volume,
        volumeArrayLength: quote.volume?.length || 0
      })
    }

    return {
      ticker: meta.symbol,
      currentPrice: meta.regularMarketPrice,
      change: meta.regularMarketPrice - meta.previousClose,
      changePercent: ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose) * 100,
      volume: volume,
      marketCap: 0, // Need separate call
      pe: 0, // Need separate call
      eps: 0, // Need separate call
      dividend: 0, // Need separate call
      beta: 0, // Need separate call
    }
  }

  private normalizePolygonQuote(data: any) {
    const result = data.results
    return {
      ticker: result.T,
      currentPrice: result.p,
      change: 0, // Calculate from previous close
      changePercent: 0, // Calculate from previous close
      volume: result.s,
      marketCap: 0, // Need separate call
      pe: 0, // Need separate call
      eps: 0, // Need separate call
      dividend: 0, // Need separate call
      beta: 0, // Need separate call
    }
  }

  private normalizeTwelveDataQuote(data: any) {
    return {
      ticker: data.symbol,
      currentPrice: Number.parseFloat(data.close),
      change: Number.parseFloat(data.change),
      changePercent: Number.parseFloat(data.percent_change),
      volume: Number.parseInt(data.volume),
      marketCap: 0, // Need separate call
      pe: 0, // Need separate call
      eps: 0, // Need separate call
      dividend: 0, // Need separate call
      beta: 0, // Need separate call
    }
  }

  private normalizeFinnhubCandles(data: any) {
    if (data.s !== "ok") throw new Error("No data available")

    return data.t.map((timestamp: number, index: number) => ({
      date: new Date(timestamp * 1000).toISOString().split("T")[0],
      open: data.o[index],
      high: data.h[index],
      low: data.l[index],
      close: data.c[index],
      price: data.c[index],
      volume: data.v[index],
    }))
  }

  private normalizeYahooHistorical(data: any) {
    const result = data.chart.result[0]
    const timestamps = result.timestamp
    const quote = result.indicators.quote[0]

    return timestamps.map((timestamp: number, index: number) => ({
      date: new Date(timestamp * 1000).toISOString().split("T")[0],
      open: quote.open[index],
      high: quote.high[index],
      low: quote.low[index],
      close: quote.close[index],
      price: quote.close[index],
      volume: quote.volume[index],
    }))
  }

  private normalizeTwelveDataTimeSeries(data: any) {
    if (!data.values) throw new Error("No data available")

    return data.values.reverse().map((item: any) => ({
      date: item.datetime,
      open: Number.parseFloat(item.open),
      high: Number.parseFloat(item.high),
      low: Number.parseFloat(item.low),
      close: Number.parseFloat(item.close),
      price: Number.parseFloat(item.close),
      volume: Number.parseInt(item.volume),
    }))
  }

  private normalizeFinnhubCompanyInfo(profile: any, financials: any) {
    return {
      pe: financials.metric?.peBasicExclExtraTTM || 0,
      eps: financials.metric?.epsBasicExclExtraTTM || 0,
      marketCap: profile.marketCapitalization || 0,
      dividend: financials.metric?.dividendYieldIndicatedAnnual || 0,
      beta: financials.metric?.beta || 1,
      avgVolume: financials.metric?.vol1DayAvg || 0,
      volume: 0,
      price: 0,
      change: 0,
      changePercent: 0,
      fiftyTwoWeekHigh: financials.metric?.["52WeekHigh"] || 0,
      fiftyTwoWeekLow: financials.metric?.["52WeekLow"] || 0,
    }
  }

  private normalizeYahooCompanyInfo(data: any) {
    const quoteSummary = data.quoteSummary?.result?.[0]
    if (!quoteSummary) {
      console.warn("Yahoo Finance company info: Invalid response structure")
      return {
        pe: 0,
        eps: 0,
        marketCap: 0,
        dividend: 0,
        beta: 1,
        avgVolume: 0,
        volume: 0,
        price: 0,
        change: 0,
        changePercent: 0,
        fiftyTwoWeekHigh: 0,
        fiftyTwoWeekLow: 0,
      }
    }

    const financialData = quoteSummary.financialData
    const defaultKeyStatistics = quoteSummary.defaultKeyStatistics
    const summaryProfile = quoteSummary.summaryProfile
    const summaryDetail = quoteSummary.summaryDetail
    const price = quoteSummary.price

    // Extract market cap - try price module first, then summaryDetail, etc.
    let marketCap = 0
    if (price?.marketCap?.raw) {
      marketCap = price.marketCap.raw
    } else if (summaryDetail?.marketCap?.raw) {
      marketCap = summaryDetail.marketCap.raw
    } else if (defaultKeyStatistics?.marketCap?.raw) {
      marketCap = defaultKeyStatistics.marketCap.raw
    } else if (defaultKeyStatistics?.marketCap) {
      marketCap = typeof defaultKeyStatistics.marketCap === "number" 
        ? defaultKeyStatistics.marketCap 
        : 0
    } else if (summaryProfile?.marketCap) {
      marketCap = typeof summaryProfile.marketCap === "number"
        ? summaryProfile.marketCap
        : 0
    }

    // Extract volume - try price module first, then summaryDetail
    const volume = price?.regularMarketVolume?.raw || summaryDetail?.volume?.raw || summaryDetail?.volume || 0

    // Extract price data
    const currentPrice = price?.regularMarketPrice?.raw || 0
    const change = price?.regularMarketChange?.raw || 0
    const changePercent = price?.regularMarketChangePercent?.raw ? price.regularMarketChangePercent.raw * 100 : 0

    // Log if market cap is extracted successfully
    if (marketCap > 0) {
      console.log(`[normalizeYahooCompanyInfo] Market cap extracted: ${marketCap} (${marketCap >= 1e12 ? `${(marketCap/1e12).toFixed(3)}T` : marketCap >= 1e9 ? `${(marketCap/1e9).toFixed(3)}B` : `${marketCap}`})`)
    } else {
      console.warn(`[normalizeYahooCompanyInfo] Market cap not found in API response`, {
        hasPrice: !!price,
        hasSummaryDetail: !!summaryDetail,
        priceMarketCap: price?.marketCap?.raw,
        summaryDetailMarketCap: summaryDetail?.marketCap?.raw
      })
    }

    return {
      pe: defaultKeyStatistics?.trailingPE?.raw || summaryDetail?.trailingPE?.raw || 0,
      eps: defaultKeyStatistics?.trailingEps?.raw || 0,
      marketCap: marketCap,
      dividend: defaultKeyStatistics?.dividendYield?.raw ? defaultKeyStatistics.dividendYield.raw * 100 : (summaryDetail?.dividendYield?.raw ? summaryDetail.dividendYield.raw * 100 : 0),
      beta: defaultKeyStatistics?.beta?.raw || summaryDetail?.beta?.raw || 1,
      avgVolume: defaultKeyStatistics?.averageVolume?.raw || summaryDetail?.averageVolume?.raw || 0,
      volume: volume,
      price: currentPrice,
      change: change,
      changePercent: changePercent,
      fiftyTwoWeekHigh: defaultKeyStatistics?.fiftyTwoWeekHigh?.raw || summaryDetail?.fiftyTwoWeekHigh?.raw || 0,
      fiftyTwoWeekLow: defaultKeyStatistics?.fiftyTwoWeekLow?.raw || summaryDetail?.fiftyTwoWeekLow?.raw || 0,
    }
  }

  private normalizeFinnhubNews(data: any) {
    const articles = data.map((article: any) => ({
      title: article.headline,
      source: article.source,
      date: new Date(article.datetime * 1000).toISOString(),
      url: article.url,
      sentiment: Math.random(), // Finnhub doesn't provide sentiment in free tier
      summary: article.summary,
    }))

    return {
      recent: articles.slice(0, 10),
      trending: articles.slice(10, 20),
    }
  }

  private normalizeYahooNews(data: any) {
    const articles =
      data.news?.map((article: any) => ({
        title: article.title,
        source: article.publisher,
        date: new Date(article.providerPublishTime * 1000).toISOString(),
        url: article.link,
        sentiment: Math.random(), // Yahoo doesn't provide sentiment
        summary: article.title, // Use title as summary
      })) || []

    return {
      recent: articles.slice(0, 10),
      trending: articles.slice(10, 20),
    }
  }

  private normalizeTwelveDataTechnicals(rsi: any, macd: any, sma20: any, sma50: any) {
    const rsiValue = rsi.values?.[0]?.rsi || 50
    const macdValue = macd.values?.[0] || { macd: 0, macd_signal: 0, macd_hist: 0 }
    const sma20Value = sma20.values?.[0]?.sma || 100
    const sma50Value = sma50.values?.[0]?.sma || 95

    return {
      rsi: Number.parseFloat(rsiValue),
      macd: {
        value: Number.parseFloat(macdValue.macd),
        signal: Number.parseFloat(macdValue.macd_signal),
        histogram: Array.from({ length: 20 }, () => (Math.random() - 0.5) * 2),
      },
      sma: {
        sma20: Number.parseFloat(sma20Value),
        sma50: Number.parseFloat(sma50Value),
        sma200: 90, // Would need separate call
      },
      ema: {
        ema12: 102, // Would need separate call
        ema26: 98, // Would need separate call
      },
      bollinger: {
        upper: 105,
        middle: 100,
        lower: 95,
        width: 10,
      },
      adx: Math.random() * 50,
      obv: Array.from({ length: 20 }, () => Math.random() * 1000000),
      historicalRsi: Array.from({ length: 50 }, () => Math.random() * 100),
      historicalMacd: {
        macd: Array.from({ length: 50 }, () => (Math.random() - 0.5) * 5),
        signal: Array.from({ length: 50 }, () => (Math.random() - 0.5) * 5),
        histogram: Array.from({ length: 50 }, () => (Math.random() - 0.5) * 2),
      },
    }
  }

  private calculateTechnicalIndicators(historicalData: any[]) {
    const prices = historicalData.map((d) => d.close)

    // Calculate RSI
    const rsi = this.calculateRSI(prices)

    // Calculate MACD
    const macd = this.calculateMACD(prices)

    // Calculate SMAs
    const sma20 = this.calculateSMA(prices, 20)
    const sma50 = this.calculateSMA(prices, 50)
    const sma200 = this.calculateSMA(prices, 200)

    return {
      rsi,
      macd,
      sma: { sma20, sma50, sma200 },
      ema: {
        ema12: this.calculateEMA(prices, 12),
        ema26: this.calculateEMA(prices, 26),
      },
      bollinger: this.calculateBollingerBands(prices),
      adx: Math.random() * 50,
      obv: Array.from({ length: 20 }, () => Math.random() * 1000000),
      historicalRsi: Array.from({ length: 50 }, () => Math.random() * 100),
      historicalMacd: {
        macd: Array.from({ length: 50 }, () => (Math.random() - 0.5) * 5),
        signal: Array.from({ length: 50 }, () => (Math.random() - 0.5) * 5),
        histogram: Array.from({ length: 50 }, () => (Math.random() - 0.5) * 2),
      },
    }
  }

  private calculateRSI(prices: number[], period = 14): number {
    if (prices.length < period + 1) return 50

    let gains = 0
    let losses = 0

    for (let i = 1; i <= period; i++) {
      const change = prices[prices.length - i] - prices[prices.length - i - 1]
      if (change > 0) gains += change
      else losses -= change
    }

    const avgGain = gains / period
    const avgLoss = losses / period

    if (avgLoss === 0) return 100

    const rs = avgGain / avgLoss
    return 100 - 100 / (1 + rs)
  }

  private calculateMACD(prices: number[]) {
    const ema12 = this.calculateEMA(prices, 12)
    const ema26 = this.calculateEMA(prices, 26)
    const macd = ema12 - ema26
    const signal = macd * 0.9 // Simplified signal line
    const histogram = macd - signal

    return { value: macd, signal, histogram: [histogram] }
  }

  private calculateSMA(prices: number[], period: number): number {
    if (prices.length < period) return prices[prices.length - 1] || 0
    const sum = prices.slice(-period).reduce((a, b) => a + b, 0)
    return sum / period
  }

  private calculateEMA(prices: number[], period: number): number {
    if (prices.length === 0) return 0
    if (prices.length === 1) return prices[0]

    const multiplier = 2 / (period + 1)
    let ema = prices[0]

    for (let i = 1; i < prices.length; i++) {
      ema = prices[i] * multiplier + ema * (1 - multiplier)
    }

    return ema
  }

  private calculateBollingerBands(prices: number[], period = 20, stdDev = 2) {
    const sma = this.calculateSMA(prices, period)
    const recentPrices = prices.slice(-period)

    const variance = recentPrices.reduce((sum, price) => sum + Math.pow(price - sma, 2), 0) / period
    const standardDeviation = Math.sqrt(variance)

    return {
      upper: sma + standardDeviation * stdDev,
      middle: sma,
      lower: sma - standardDeviation * stdDev,
      width: ((standardDeviation * stdDev * 2) / sma) * 100,
    }
  }
}
