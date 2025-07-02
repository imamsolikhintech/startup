/**
 * Number Formatting Service
 *
 * Provides consistent number formatting across the application.
 * Supports various formatting options including currency, percentages,
 * and human-readable large numbers.
 */

export interface NumberFormatOptions {
  locale?: string,
  currency?: string,
  minimumFractionDigits?: number,
  maximumFractionDigits?: number,
  notation?: 'standard' | 'scientific' | 'engineering' | 'compact',
  compactDisplay?: 'short' | 'long',
  useGrouping?: boolean,
}

/**
 * Format a number with locale-specific formatting
 * @param value - The number to format
 * @param options - Formatting options
 * @returns Formatted number string
 */
export function formatNumber (
  value: number,
  options: NumberFormatOptions = {},
): string {
  const {
    locale = 'en-US',
    minimumFractionDigits = 0,
    maximumFractionDigits = 2,
    notation = 'standard',
    compactDisplay = 'short',
    useGrouping = true,
  } = options

  try {
    // Handle special cases
    if (!isFinite(value)) {
      return '0'
    }

    // For very large numbers, use compact notation
    if (Math.abs(value) >= 1000000 && notation === 'standard') {
      return new Intl.NumberFormat(locale, {
        notation: 'compact',
        compactDisplay,
        minimumFractionDigits: 0,
        maximumFractionDigits: 1,
        useGrouping,
      }).format(value)
    }

    // For thousands, use K notation
    if (Math.abs(value) >= 1000 && Math.abs(value) < 1000000 && notation === 'standard') {
      const thousands = value / 1000
      if (thousands % 1 === 0) {
        return `${thousands.toLocaleString(locale)}K`
      }
      return `${thousands.toFixed(1)}K`
    }

    // Standard formatting
    return new Intl.NumberFormat(locale, {
      notation,
      compactDisplay,
      minimumFractionDigits,
      maximumFractionDigits,
      useGrouping,
    }).format(value)
  } catch (error) {
    console.warn('Number formatting failed:', error)
    return value.toString()
  }
}

/**
 * Format a number as currency
 * @param value - The number to format
 * @param currency - Currency code (e.g., 'USD', 'EUR')
 * @param locale - Locale for formatting
 * @returns Formatted currency string
 */
export function formatCurrency (
  value: number,
  currency: string = 'USD',
  locale: string = 'en-US',
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value)
  } catch (error) {
    console.warn('Currency formatting failed:', error)
    return `${currency} ${formatNumber(value)}`
  }
}

/**
 * Format a number as percentage
 * @param value - The number to format (0.1 = 10%)
 * @param locale - Locale for formatting
 * @param decimals - Number of decimal places
 * @returns Formatted percentage string
 */
export function formatPercentage (
  value: number,
  locale: string = 'en-US',
  decimals: number = 1,
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value)
  } catch (error) {
    console.warn('Percentage formatting failed:', error)
    return `${(value * 100).toFixed(decimals)}%`
  }
}

/**
 * Format a number with custom suffix
 * @param value - The number to format
 * @param suffix - Suffix to append
 * @param options - Formatting options
 * @returns Formatted number with suffix
 */
export function formatWithSuffix (
  value: number,
  suffix: string,
  options: NumberFormatOptions = {},
): string {
  const formattedNumber = formatNumber(value, options)
  return `${formattedNumber}${suffix}`
}

/**
 * Format bytes to human readable format
 * @param bytes - Number of bytes
 * @param decimals - Number of decimal places
 * @returns Formatted bytes string
 */
export function formatBytes (bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

/**
 * Format duration in milliseconds to human readable format
 * @param milliseconds - Duration in milliseconds
 * @returns Formatted duration string
 */
export function formatDuration (milliseconds: number): string {
  const seconds = Math.floor(milliseconds / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) {
    return `${days}d ${hours % 24}h`
  }
  if (hours > 0) {
    return `${hours}h ${minutes % 60}m`
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds % 60}s`
  }
  return `${seconds}s`
}

/**
 * Parse a formatted number string back to number
 * @param formattedValue - The formatted string
 * @returns Parsed number or NaN if invalid
 */
export function parseFormattedNumber (formattedValue: string): number {
  // Remove common formatting characters
  const cleaned = formattedValue
    .replace(/[,\s]/g, '') // Remove commas and spaces
    .replace(/[^\d.-]/g, '') // Keep only digits, dots, and minus

  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? 0 : parsed
}

/**
 * Check if a value is a valid number
 * @param value - Value to check
 * @returns True if valid number
 */
export function isValidNumber (value: any): value is number {
  return typeof value === 'number' && isFinite(value)
}

/**
 * Round number to specified decimal places
 * @param value - Number to round
 * @param decimals - Number of decimal places
 * @returns Rounded number
 */
export function roundToDecimals (value: number, decimals: number): number {
  const factor = Math.pow(10, decimals)
  return Math.round(value * factor) / factor
}

/**
 * Format number with ordinal suffix (1st, 2nd, 3rd, etc.)
 * @param value - Number to format
 * @returns Number with ordinal suffix
 */
export function formatOrdinal (value: number): string {
  const suffixes = ['th', 'st', 'nd', 'rd']
  const v = value % 100
  return value + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0])
}

// Export default formatter with common options
export const defaultFormatter = {
  number: (value: number) => formatNumber(value),
  currency: (value: number, currency?: string) => formatCurrency(value, currency),
  percentage: (value: number) => formatPercentage(value),
  bytes: (value: number) => formatBytes(value),
  duration: (value: number) => formatDuration(value),
}

/**
 * Vue composable for number formatting
 * Provides reactive number formatting functionality for Vue components
 * @returns Object with formatting methods
 */
export function useNumberFormatter () {
  return {
    formatNumber: (value: number, options?: NumberFormatOptions) => formatNumber(value, options),
    formatCurrency: (value: number, currency?: string, locale?: string) => formatCurrency(value, currency, locale),
    formatPercentage: (value: number, locale?: string, decimals?: number) => formatPercentage(value, locale, decimals),
    formatBytes: (bytes: number, decimals?: number) => formatBytes(bytes, decimals),
    formatDuration: (milliseconds: number) => formatDuration(milliseconds),
    formatWithSuffix: (value: number, suffix: string, options?: NumberFormatOptions) => formatWithSuffix(value, suffix, options),
    formatOrdinal: (value: number) => formatOrdinal(value),
    parseFormattedNumber: (formattedValue: string) => parseFormattedNumber(formattedValue),
    isValidNumber: (value: any) => isValidNumber(value),
    roundToDecimals: (value: number, decimals: number) => roundToDecimals(value, decimals),
  }
}
