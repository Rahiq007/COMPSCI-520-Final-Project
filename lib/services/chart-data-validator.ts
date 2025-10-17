export class ChartDataValidator {
  static performComprehensiveAudit(data: any[], stats: any) {
    const errors: string[] = []
    const warnings: string[] = []
    let validDataPoints = 0
    const totalDataPoints = data.length

    // Validate each data point
    data.forEach((item, index) => {
      if (!item) {
        errors.push(`Data point ${index} is null or undefined`)
        return
      }

      // Check required fields
      if (typeof item.close !== "number" || isNaN(item.close)) {
        errors.push(`Invalid close price at index ${index}: ${item.close}`)
      } else if (item.close <= 0) {
        errors.push(`Non-positive close price at index ${index}: ${item.close}`)
      } else {
        validDataPoints++
      }

      // OHLC validation
      if (item.high && item.low && item.close && item.open) {
        if (item.high < item.low) {
          errors.push(`High price less than low price at index ${index}`)
        }
        if (item.close > item.high || item.close < item.low) {
          warnings.push(`Close price outside high-low range at index ${index}`)
        }
        if (item.open > item.high || item.open < item.low) {
          warnings.push(`Open price outside high-low range at index ${index}`)
        }
      }

      // Volume validation
      if (item.volume && (typeof item.volume !== "number" || item.volume < 0)) {
        warnings.push(`Invalid volume at index ${index}: ${item.volume}`)
      }

      // Date validation
      if (!item.date || isNaN(new Date(item.date).getTime())) {
        errors.push(`Invalid date at index ${index}: ${item.date}`)
      }
    })

    const accuracy = totalDataPoints > 0 ? (validDataPoints / totalDataPoints) * 100 : 0
    const errorRate = totalDataPoints > 0 ? (errors.length / totalDataPoints) * 100 : 0

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      correctedData: data.filter(
        (item) => item && typeof item.close === "number" && !isNaN(item.close) && item.close > 0,
      ),
      auditReport: {
        accuracy,
        errorRate,
        dataPoints: totalDataPoints,
        validDataPoints,
        timestamp: new Date().toISOString(),
      },
    }
  }
}
