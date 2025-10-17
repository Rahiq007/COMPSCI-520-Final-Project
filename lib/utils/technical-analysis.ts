export class TechnicalAnalysis {
  static calculateSMA(prices: number[], period: number): number {
    if (prices.length < period) return prices[prices.length - 1] || 0
    const sum = prices.slice(-period).reduce((a, b) => a + b, 0)
    return sum / period
  }

  static calculateEMA(prices: number[], period: number): number {
    if (prices.length === 0) return 0
    if (prices.length === 1) return prices[0]

    const multiplier = 2 / (period + 1)
    let ema = prices[0]

    for (let i = 1; i < prices.length; i++) {
      ema = prices[i] * multiplier + ema * (1 - multiplier)
    }

    return ema
  }

  static calculateRSI(prices: number[], period = 14): number {
    if (prices.length < period + 1) return 50

    let gains = 0
    let losses = 0

    for (let i = 1; i <= period; i++) {
      const change = prices[i] - prices[i - 1]
      if (change > 0) gains += change
      else losses -= change
    }

    const avgGain = gains / period
    const avgLoss = losses / period

    if (avgLoss === 0) return 100

    const rs = avgGain / avgLoss
    return 100 - 100 / (1 + rs)
  }

  static calculateMACD(prices: number[]): { macd: number; signal: number; histogram: number } {
    const ema12 = this.calculateEMA(prices, 12)
    const ema26 = this.calculateEMA(prices, 26)
    const macd = ema12 - ema26
    const signal = macd * 0.9 // Simplified signal line
    const histogram = macd - signal

    return { macd, signal, histogram }
  }

  static calculateBollingerBands(prices: number[], period = 20, stdDev = 2) {
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

  static calculateVolatility(prices: number[]): number {
    if (prices.length < 2) return 0

    const returns = prices.slice(1).map((price, i) => (price - prices[i]) / prices[i])
    const avgReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length
    const variance = returns.reduce((sum, ret) => sum + Math.pow(ret - avgReturn, 2), 0) / returns.length

    return Math.sqrt(variance) * Math.sqrt(252) // Annualized volatility
  }

  static calculateSharpeRatio(prices: number[], riskFreeRate = 0.02): number {
    const returns = prices.slice(1).map((price, i) => (price - prices[i]) / prices[i])
    const avgReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length
    const annualizedReturn = avgReturn * 252
    const volatility = this.calculateVolatility(prices)

    if (volatility === 0) return 0

    return (annualizedReturn - riskFreeRate) / volatility
  }
}
