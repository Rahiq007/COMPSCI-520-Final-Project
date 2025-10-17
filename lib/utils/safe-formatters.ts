/**
 * Safe number formatting utilities to prevent null/undefined errors
 */

export const safeNumber = (value: any, defaultValue = 0): number => {
  if (value === null || value === undefined || isNaN(Number(value))) {
    return defaultValue
  }
  return Number(value)
}

export const safeToFixed = (value: any, decimals = 2, defaultValue = 0): string => {
  const num = safeNumber(value, defaultValue)
  return num.toFixed(decimals)
}

export const safePercentage = (value: any, defaultValue = 0): string => {
  const num = safeNumber(value, defaultValue)
  return `${(num * 100).toFixed(1)}%`
}

// Fixed: Remove duplicate dollar sign
export const safeCurrency = (value: any, defaultValue = 0): string => {
  const num = safeNumber(value, defaultValue)
  return num.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export const safeInteger = (value: any, defaultValue = 0): string => {
  const num = safeNumber(value, defaultValue)
  return Math.round(num).toLocaleString("en-US")
}

export const formatMarketCap = (value: any): string => {
  const num = safeNumber(value, 0)
  if (num >= 1e12) return `$${(num / 1e12).toFixed(1)}T`
  if (num >= 1e9) return `$${(num / 1e9).toFixed(1)}B`
  if (num >= 1e6) return `$${(num / 1e6).toFixed(1)}M`
  if (num >= 1e3) return `$${(num / 1e3).toFixed(1)}K`
  return safeCurrency(num)
}

export const formatVolume = (value: any): string => {
  const num = safeNumber(value, 0)
  if (num >= 1e9) return `${(num / 1e9).toFixed(1)}B`
  if (num >= 1e6) return `${(num / 1e6).toFixed(1)}M`
  if (num >= 1e3) return `${(num / 1e3).toFixed(1)}K`
  return safeInteger(num)
}

// New: Format price without currency symbol for display
export const formatPrice = (value: any, defaultValue = 0): string => {
  const num = safeNumber(value, defaultValue)
  return num.toFixed(2)
}
