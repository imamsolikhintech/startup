/**
 * Design Tokens - Colors
 * 
 * Centralized color system for consistent theming across the application.
 * Supports both light and dark themes with semantic color naming.
 */

/**
 * Base color palette
 */
export const baseColors = {
  // Primary brand colors
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9',
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
    950: '#082f49'
  },
  
  // Secondary colors
  secondary: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617'
  },
  
  // Accent colors
  accent: {
    50: '#fdf4ff',
    100: '#fae8ff',
    200: '#f5d0fe',
    300: '#f0abfc',
    400: '#e879f9',
    500: '#d946ef',
    600: '#c026d3',
    700: '#a21caf',
    800: '#86198f',
    900: '#701a75',
    950: '#4a044e'
  },
  
  // Neutral grays
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0a0a0a'
  },
  
  // Semantic colors
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    950: '#052e16'
  },
  
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    400: '#fbbf24',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    950: '#451a03'
  },
  
  error: {
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
    800: '#991b1b',
    900: '#7f1d1d',
    950: '#450a0a'
  },
  
  info: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554'
  }
} as const

/**
 * Light theme colors
 */
export const lightTheme = {
  // Background colors
  background: {
    primary: baseColors.neutral[50],
    secondary: baseColors.neutral[100],
    tertiary: baseColors.neutral[200],
    elevated: '#ffffff',
    overlay: 'rgba(0, 0, 0, 0.5)'
  },
  
  // Surface colors
  surface: {
    primary: '#ffffff',
    secondary: baseColors.neutral[50],
    tertiary: baseColors.neutral[100],
    hover: baseColors.neutral[100],
    active: baseColors.neutral[200],
    disabled: baseColors.neutral[100]
  },
  
  // Text colors
  text: {
    primary: baseColors.neutral[900],
    secondary: baseColors.neutral[700],
    tertiary: baseColors.neutral[500],
    disabled: baseColors.neutral[400],
    inverse: '#ffffff',
    link: baseColors.primary[600],
    linkHover: baseColors.primary[700]
  },
  
  // Border colors
  border: {
    primary: baseColors.neutral[200],
    secondary: baseColors.neutral[300],
    focus: baseColors.primary[500],
    error: baseColors.error[500],
    success: baseColors.success[500],
    warning: baseColors.warning[500]
  },
  
  // Brand colors
  brand: {
    primary: baseColors.primary[600],
    primaryHover: baseColors.primary[700],
    primaryActive: baseColors.primary[800],
    secondary: baseColors.secondary[600],
    accent: baseColors.accent[600]
  },
  
  // Semantic colors
  semantic: {
    success: baseColors.success[600],
    successBg: baseColors.success[50],
    successBorder: baseColors.success[200],
    warning: baseColors.warning[600],
    warningBg: baseColors.warning[50],
    warningBorder: baseColors.warning[200],
    error: baseColors.error[600],
    errorBg: baseColors.error[50],
    errorBorder: baseColors.error[200],
    info: baseColors.info[600],
    infoBg: baseColors.info[50],
    infoBorder: baseColors.info[200]
  }
} as const

/**
 * Dark theme colors
 */
export const darkTheme = {
  // Background colors
  background: {
    primary: baseColors.neutral[900],
    secondary: baseColors.neutral[800],
    tertiary: baseColors.neutral[700],
    elevated: baseColors.neutral[800],
    overlay: 'rgba(0, 0, 0, 0.7)'
  },
  
  // Surface colors
  surface: {
    primary: baseColors.neutral[800],
    secondary: baseColors.neutral[700],
    tertiary: baseColors.neutral[600],
    hover: baseColors.neutral[700],
    active: baseColors.neutral[600],
    disabled: baseColors.neutral[800]
  },
  
  // Text colors
  text: {
    primary: baseColors.neutral[100],
    secondary: baseColors.neutral[300],
    tertiary: baseColors.neutral[400],
    disabled: baseColors.neutral[600],
    inverse: baseColors.neutral[900],
    link: baseColors.primary[400],
    linkHover: baseColors.primary[300]
  },
  
  // Border colors
  border: {
    primary: baseColors.neutral[700],
    secondary: baseColors.neutral[600],
    focus: baseColors.primary[400],
    error: baseColors.error[400],
    success: baseColors.success[400],
    warning: baseColors.warning[400]
  },
  
  // Brand colors
  brand: {
    primary: baseColors.primary[500],
    primaryHover: baseColors.primary[400],
    primaryActive: baseColors.primary[300],
    secondary: baseColors.secondary[400],
    accent: baseColors.accent[400]
  },
  
  // Semantic colors
  semantic: {
    success: baseColors.success[400],
    successBg: baseColors.success[950],
    successBorder: baseColors.success[800],
    warning: baseColors.warning[400],
    warningBg: baseColors.warning[950],
    warningBorder: baseColors.warning[800],
    error: baseColors.error[400],
    errorBg: baseColors.error[950],
    errorBorder: baseColors.error[800],
    info: baseColors.info[400],
    infoBg: baseColors.info[950],
    infoBorder: baseColors.info[800]
  }
} as const

/**
 * Color utilities
 */
export const colorUtils = {
  /**
   * Get color with opacity
   * @param color - Base color
   * @param opacity - Opacity value (0-1)
   * @returns Color with opacity
   */
  withOpacity: (color: string, opacity: number): string => {
    if (color.startsWith('#')) {
      const hex = color.slice(1)
      const r = parseInt(hex.slice(0, 2), 16)
      const g = parseInt(hex.slice(2, 4), 16)
      const b = parseInt(hex.slice(4, 6), 16)
      return `rgba(${r}, ${g}, ${b}, ${opacity})`
    }
    return color
  },
  
  /**
   * Convert hex to RGB
   * @param hex - Hex color
   * @returns RGB values
   */
  hexToRgb: (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
  },
  
  /**
   * Get contrast color (black or white)
   * @param color - Background color
   * @returns Contrast color
   */
  getContrastColor: (color: string): string => {
    const rgb = colorUtils.hexToRgb(color)
    if (!rgb) return '#000000'
    
    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000
    return brightness > 128 ? '#000000' : '#ffffff'
  }
}

/**
 * Theme type
 */
export type Theme = typeof lightTheme
export type ThemeMode = 'light' | 'dark'

/**
 * Get theme colors
 * @param mode - Theme mode
 * @returns Theme colors
 */
export function getThemeColors(mode: ThemeMode): Theme {
  return mode === 'dark' ? darkTheme : lightTheme
}

/**
 * Export all colors
 */
export const colors = {
  base: baseColors,
  light: lightTheme,
  dark: darkTheme,
  utils: colorUtils
} as const

export default colors