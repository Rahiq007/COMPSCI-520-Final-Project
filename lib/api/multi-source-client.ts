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

  async getQuote(symbol: string, requireVolume = true) {
    // For live market data, prioritize Yahoo Finance as it provides the most complete data
    // (price, volume, etc. in a single call)
    // Other sources like Finnhub don't include volume in their quote endpoint
    const sources = [
      { name: "yahoo", client: this.yahoo },
      { name: "twelveData", client: this.twelveData },
      { name: "polygon", client: this.polygon },
      { name: "finnhub", client: this.finnhub },
    ]

    let lastValidQuote: any = null

    for (const source of sources) {
      if (!source.client) continue

      try {
        console.log(`[${symbol}] Trying ${source.name} for quote data...`)
        const data = await source.client.getQuote(symbol)

        let normalizedQuote: any = null
        if (source.name === "yahoo") {
          normalizedQuote = this.normalizeYahooQuote(data)
        } else if (source.name === "finnhub") {
          normalizedQuote = this.normalizeFinnhubQuote(data, symbol)
        } else if (source.name === "polygon") {
          normalizedQuote = this.normalizePolygonQuote(data)
        } else if (source.name === "twelveData") {
          normalizedQuote = this.normalizeTwelveDataQuote(data)
        }

        if (normalizedQuote) {
          // Check if the quote has valid price
          if (!normalizedQuote.currentPrice || normalizedQuote.currentPrice <= 0) {
            console.warn(`[${symbol}] ${source.name} returned invalid price, trying next source...`)
            continue
          }

          // If we require volume and it's missing, save this quote but try next source
          if (requireVolume && (!normalizedQuote.volume || normalizedQuote.volume <= 0)) {
            console.warn(`[${symbol}] ${source.name} returned no volume data, trying next source...`)
            if (!lastValidQuote) {
              lastValidQuote = normalizedQuote
            }
            continue
          }

          console.log(`[${symbol}] Using ${source.name} quote data (price: $${normalizedQuote.currentPrice.toFixed(2)}, volume: ${normalizedQuote.volume?.toLocaleString() || 'N/A'})`)
          return normalizedQuote
        }
      } catch (error) {
        console.warn(`[${symbol}] ${source.name} failed:`, error)
        continue
      }
    }

    // If we have a valid quote without volume, return it as fallback
    if (lastValidQuote) {
      console.warn(`[${symbol}] No source provided volume, using best available quote`)
      return lastValidQuote
    }

    throw new Error(`All stock data sources failed for ${symbol}`)
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
    // Prioritize Yahoo Finance for company info as it provides more accurate market cap
    // Finnhub returns market cap in millions which can cause display issues
    let lastValidInfo: any = null

    // Try Yahoo Finance first (most reliable for market cap)
    try {
      console.log(`[${symbol}] Trying Yahoo Finance for company info...`)
      const data = await this.yahoo.getCompanyInfo(symbol)
      const normalizedInfo = this.normalizeYahooCompanyInfo(data)
      
      // Validate market cap
      if (normalizedInfo.marketCap && normalizedInfo.marketCap > 0) {
        console.log(`[${symbol}] Using Yahoo Finance company info (marketCap: ${normalizedInfo.marketCap >= 1e12 ? `${(normalizedInfo.marketCap/1e12).toFixed(2)}T` : normalizedInfo.marketCap >= 1e9 ? `${(normalizedInfo.marketCap/1e9).toFixed(2)}B` : normalizedInfo.marketCap})`)
        return normalizedInfo
      } else {
        console.warn(`[${symbol}] Yahoo Finance returned no market cap, trying next source...`)
        lastValidInfo = normalizedInfo
      }
    } catch (error) {
      console.warn(`[${symbol}] Yahoo Finance company info failed:`, error)
    }

    // Fallback to Finnhub
    if (this.finnhub) {
      try {
        console.log(`[${symbol}] Trying Finnhub for company info...`)
        const [profile, financials] = await Promise.all([
          this.finnhub.getCompanyProfile(symbol),
          this.finnhub.getBasicFinancials(symbol),
        ])
        const normalizedInfo = this.normalizeFinnhubCompanyInfo(profile, financials)
        
        if (normalizedInfo.marketCap && normalizedInfo.marketCap > 0) {
          console.log(`[${symbol}] Using Finnhub company info (marketCap: ${normalizedInfo.marketCap >= 1e12 ? `${(normalizedInfo.marketCap/1e12).toFixed(2)}T` : normalizedInfo.marketCap >= 1e9 ? `${(normalizedInfo.marketCap/1e9).toFixed(2)}B` : normalizedInfo.marketCap})`)
          return normalizedInfo
        } else if (!lastValidInfo) {
          lastValidInfo = normalizedInfo
        }
      } catch (error) {
        console.warn(`[${symbol}] Finnhub company info failed:`, error)
      }
    }

    // Return whatever we have
    if (lastValidInfo) {
      console.warn(`[${symbol}] Using partial company info (market cap may be missing)`)
      return lastValidInfo
    }

    throw new Error(`All company info sources failed for ${symbol}`)
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

    // Get volume - Yahoo Finance chart API provides volume in multiple ways:
    // 1. meta.regularMarketVolume - the current trading day's total volume (most reliable)
    // 2. quote.volume[] array - historical volume data for the chart period
    // 3. Sum of quote.volume[] - if we need to calculate total volume from intraday data
    let volume = 0
    
    // Primary source: regularMarketVolume from meta (this is the official daily volume)
    if (typeof meta.regularMarketVolume === 'number' && meta.regularMarketVolume > 0) {
      volume = meta.regularMarketVolume
      console.log(`[normalizeYahooQuote] ${meta.symbol} - Using regularMarketVolume: ${volume.toLocaleString()}`)
    } 
    // Secondary: Sum all volumes from the quote array (for intraday data, this gives total volume)
    else if (quote.volume && Array.isArray(quote.volume) && quote.volume.length > 0) {
      // For intraday charts, we may need to sum all volume entries
      // For daily charts, we can use the last valid entry
      const validVolumes = quote.volume.filter((v: number | null) => typeof v === 'number' && v > 0)
      
      if (validVolumes.length > 0) {
        // If it's a single day's data (chart period is 1 day), sum all volumes
        // Otherwise, use the most recent valid volume
        if (quote.volume.length > 1 && meta.dataGranularity && meta.dataGranularity !== '1d') {
          // Intraday data - sum all volumes to get daily total
          volume = validVolumes.reduce((sum: number, v: number) => sum + v, 0)
          console.log(`[normalizeYahooQuote] ${meta.symbol} - Summed intraday volumes: ${volume.toLocaleString()} (${validVolumes.length} entries)`)
        } else {
          // Daily or longer granularity - use the last valid value
          volume = validVolumes[validVolumes.length - 1]
          console.log(`[normalizeYahooQuote] ${meta.symbol} - Using last valid volume: ${volume.toLocaleString()}`)
        }
      }
    }
    // Tertiary: Try meta.volume as last resort
    else if (typeof meta.volume === 'number' && meta.volume > 0) {
      volume = meta.volume
      console.log(`[normalizeYahooQuote] ${meta.symbol} - Using meta.volume fallback: ${volume.toLocaleString()}`)
    }

    // Log warning if no volume found
    if (volume === 0) {
      console.warn(`[normalizeYahooQuote] No volume found for ${meta.symbol}`, {
        regularMarketVolume: meta.regularMarketVolume,
        metaVolume: meta.volume,
        hasVolumeArray: !!quote.volume,
        volumeArrayLength: quote.volume?.length || 0,
        dataGranularity: meta.dataGranularity
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
    // Finnhub returns marketCapitalization in millions
    // e.g., Apple with ~3.5T market cap returns ~3500000 (3.5 million millions)
    // So we need to multiply by 1,000,000 to get actual value
    let marketCap = profile.marketCapitalization || 0
    if (marketCap > 0 && marketCap < 1e9) {
      // Value seems to be in millions, convert to actual value
      marketCap = marketCap * 1e6
    }

    return {
      pe: financials.metric?.peBasicExclExtraTTM || 0,
      eps: financials.metric?.epsBasicExclExtraTTM || 0,
      marketCap: marketCap,
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
      console.warn("Yahoo Finance company info: Invalid response structure", { 
        hasQuoteSummary: !!data.quoteSummary,
        hasResult: !!data.quoteSummary?.result,
        resultLength: data.quoteSummary?.result?.length 
      })
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

    // Helper to safely extract numeric value from Yahoo Finance response
    // Yahoo returns values as { raw: number, fmt: string } or just as numbers
    const extractNumeric = (value: any): number => {
      if (value === null || value === undefined) return 0
      if (typeof value === 'number') return value
      if (typeof value === 'object' && value.raw !== undefined) return value.raw
      return 0
    }

    // Extract market cap - try multiple sources in order of reliability
    // Yahoo Finance quoteSummary API returns market cap in these modules:
    // 1. price.marketCap - most up-to-date
    // 2. summaryDetail.marketCap - reliable backup
    // 3. defaultKeyStatistics.enterpriseValue - approximation if market cap unavailable
    let marketCap = 0
    let marketCapSource = ''
    
    if (price?.marketCap) {
      marketCap = extractNumeric(price.marketCap)
      marketCapSource = 'price.marketCap'
    }
    if (marketCap === 0 && summaryDetail?.marketCap) {
      marketCap = extractNumeric(summaryDetail.marketCap)
      marketCapSource = 'summaryDetail.marketCap'
    }
    if (marketCap === 0 && defaultKeyStatistics?.marketCap) {
      marketCap = extractNumeric(defaultKeyStatistics.marketCap)
      marketCapSource = 'defaultKeyStatistics.marketCap'
    }
    // Enterprise value as last resort (not exactly market cap but close)
    if (marketCap === 0 && defaultKeyStatistics?.enterpriseValue) {
      marketCap = extractNumeric(defaultKeyStatistics.enterpriseValue)
      marketCapSource = 'defaultKeyStatistics.enterpriseValue (approximation)'
    }

    // Extract volume from multiple sources
    let volume = 0
    let volumeSource = ''
    
    if (price?.regularMarketVolume) {
      volume = extractNumeric(price.regularMarketVolume)
      volumeSource = 'price.regularMarketVolume'
    }
    if (volume === 0 && summaryDetail?.volume) {
      volume = extractNumeric(summaryDetail.volume)
      volumeSource = 'summaryDetail.volume'
    }
    if (volume === 0 && summaryDetail?.regularMarketVolume) {
      volume = extractNumeric(summaryDetail.regularMarketVolume)
      volumeSource = 'summaryDetail.regularMarketVolume'
    }

    // Extract average volume for fallback
    let avgVolume = 0
    if (price?.averageDailyVolume10Day) {
      avgVolume = extractNumeric(price.averageDailyVolume10Day)
    } else if (summaryDetail?.averageVolume) {
      avgVolume = extractNumeric(summaryDetail.averageVolume)
    } else if (summaryDetail?.averageVolume10days) {
      avgVolume = extractNumeric(summaryDetail.averageVolume10days)
    } else if (defaultKeyStatistics?.averageVolume) {
      avgVolume = extractNumeric(defaultKeyStatistics.averageVolume)
    }

    // Extract price data
    const currentPrice = extractNumeric(price?.regularMarketPrice)
    const change = extractNumeric(price?.regularMarketChange)
    // Yahoo returns changePercent as decimal (e.g., 0.0234 for 2.34%)
    let changePercent = extractNumeric(price?.regularMarketChangePercent)
    // Convert to percentage if it looks like a decimal
    if (changePercent !== 0 && Math.abs(changePercent) < 1) {
      changePercent = changePercent * 100
    }

    // Log extraction results
    const symbol = price?.symbol || 'UNKNOWN'
    if (marketCap > 0) {
      const formatted = marketCap >= 1e12 
        ? `${(marketCap/1e12).toFixed(2)}T` 
        : marketCap >= 1e9 
          ? `${(marketCap/1e9).toFixed(2)}B`
          : `${(marketCap/1e6).toFixed(2)}M`
      console.log(`[normalizeYahooCompanyInfo] ${symbol} - Market cap: ${formatted} (source: ${marketCapSource})`)
    } else {
      console.warn(`[normalizeYahooCompanyInfo] ${symbol} - Market cap not found`, {
        priceMarketCap: price?.marketCap,
        summaryDetailMarketCap: summaryDetail?.marketCap,
        defaultKeyStatsMarketCap: defaultKeyStatistics?.marketCap
      })
    }

    if (volume > 0) {
      console.log(`[normalizeYahooCompanyInfo] ${symbol} - Volume: ${volume.toLocaleString()} (source: ${volumeSource})`)
    } else if (avgVolume > 0) {
      console.log(`[normalizeYahooCompanyInfo] ${symbol} - No current volume, avgVolume: ${avgVolume.toLocaleString()}`)
    }

    return {
      pe: extractNumeric(summaryDetail?.trailingPE) || extractNumeric(defaultKeyStatistics?.trailingPE) || 0,
      eps: extractNumeric(defaultKeyStatistics?.trailingEps) || 0,
      marketCap: marketCap,
      dividend: extractNumeric(summaryDetail?.dividendYield) * 100 || extractNumeric(defaultKeyStatistics?.dividendYield) * 100 || 0,
      beta: extractNumeric(summaryDetail?.beta) || extractNumeric(defaultKeyStatistics?.beta) || 1,
      avgVolume: avgVolume,
      volume: volume,
      price: currentPrice,
      change: change,
      changePercent: changePercent,
      fiftyTwoWeekHigh: extractNumeric(summaryDetail?.fiftyTwoWeekHigh) || extractNumeric(defaultKeyStatistics?.fiftyTwoWeekHigh) || 0,
      fiftyTwoWeekLow: extractNumeric(summaryDetail?.fiftyTwoWeekLow) || extractNumeric(defaultKeyStatistics?.fiftyTwoWeekLow) || 0,
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
