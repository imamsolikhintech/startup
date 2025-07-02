/**
 * Theme Utilities
 * Provides type-safe access to theme colors and helper functions
 */

// Theme color names
export type ThemeColor =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'error'
  | 'warning'
  | 'info'
  | 'success'
  | 'surface'
  | 'background'

// Color variants (50-900 scale)
export type ColorVariant =
  | '50'
  | '100'
  | '200'
  | '300'
  | '400'
  | '500'
  | '600'
  | '700'
  | '800'
  | '900'

// Opacity levels
export type OpacityLevel =
  | '10'
  | '20'
  | '30'
  | '40'
  | '50'
  | '60'
  | '70'
  | '80'
  | '90'

/**
 * Get CSS custom property for theme color
 * @param color - Theme color name
 * @param variant - Color variant (optional)
 * @returns CSS custom property string
 */
export function getThemeColor (color: ThemeColor, variant?: ColorVariant): string {
  if (variant) {
    return `var(--v-theme-${color}-${variant})`
  }
  return `var(--v-theme-${color})`
}

/**
 * Get RGB values for theme color
 * @param color - Theme color name
 * @param variant - Color variant (optional)
 * @returns RGB values as string
 */
export function getThemeColorRGB (color: ThemeColor, variant?: ColorVariant): string {
  if (variant) {
    return `var(--v-theme-${color}-${variant})`
  }
  return `var(--v-theme-${color})`
}

/**
 * Create rgba color with opacity
 * @param color - Theme color name
 * @param opacity - Opacity value (0-1)
 * @param variant - Color variant (optional)
 * @returns rgba CSS string
 */
export function getThemeColorWithOpacity (
  color: ThemeColor,
  opacity: number,
  variant?: ColorVariant,
): string {
  const rgbVar = variant ? `--v-theme-${color}-${variant}` : `--v-theme-${color}`
  return `rgba(var(${rgbVar}), ${opacity})`
}

/**
 * Create rgb color
 * @param color - Theme color name
 * @param variant - Color variant (optional)
 * @returns rgb CSS string
 */
export function getThemeColorRgb (
  color: ThemeColor,
  variant?: ColorVariant,
): string {
  const rgbVar = variant ? `--v-theme-${color}-${variant}` : `--v-theme-${color}`
  return `rgb(var(${rgbVar}))`
}

/**
 * Generate CSS class name for theme color
 * @param type - CSS property type ('text', 'bg', 'border')
 * @param color - Theme color name
 * @param variant - Color variant (optional)
 * @param opacity - Opacity level (optional)
 * @returns CSS class name
 */
export function getThemeColorClass (
  type: 'text' | 'bg' | 'border',
  color: ThemeColor,
  variant?: ColorVariant,
  opacity?: OpacityLevel,
): string {
  let className = `${type}-${color}`

  if (variant) {
    className += `-${variant}`
  }

  if (opacity) {
    className += `-opacity-${opacity}`
  }

  return className
}

/**
 * Create gradient background with theme colors
 * @param startColor - Start color
 * @param endColor - End color
 * @param direction - Gradient direction (default: '135deg')
 * @param startVariant - Start color variant (optional)
 * @param endVariant - End color variant (optional)
 * @returns CSS gradient string
 */
export function createThemeGradient (
  startColor: ThemeColor,
  endColor: ThemeColor,
  direction: string = '135deg',
  startVariant?: ColorVariant,
  endVariant?: ColorVariant,
): string {
  const startRgb = startVariant ? `--v-theme-${startColor}-${startVariant}` : `--v-theme-${startColor}`
  const endRgb = endVariant ? `--v-theme-${endColor}-${endVariant}` : `--v-theme-${endColor}`

  return `linear-gradient(${direction}, rgb(var(${startRgb})) 0%, rgb(var(${endRgb})) 100%)`
}

/**
 * Create box shadow with theme color
 * @param color - Theme color name
 * @param opacity - Shadow opacity (default: 0.15)
 * @param blur - Blur radius (default: '20px')
 * @param spread - Spread radius (default: '0px')
 * @param offsetX - X offset (default: '0px')
 * @param offsetY - Y offset (default: '4px')
 * @param variant - Color variant (optional)
 * @returns CSS box-shadow string
 */
export function createThemeShadow (
  color: ThemeColor,
  opacity: number = 0.15,
  blur: string = '20px',
  spread: string = '0px',
  offsetX: string = '0px',
  offsetY: string = '4px',
  variant?: ColorVariant,
): string {
  const rgbVar = variant ? `--v-theme-${color}-${variant}` : `--v-theme-${color}`
  return `${offsetX} ${offsetY} ${blur} ${spread} rgba(var(${rgbVar}), ${opacity})`
}

/**
 * Get current theme mode
 * @returns 'light' | 'dark' | 'auto'
 */
export function getCurrentTheme (): 'light' | 'dark' | 'auto' {
  if (typeof window === 'undefined') return 'light'

  const stored = localStorage.getItem('theme')
  if (stored && ['light', 'dark', 'auto'].includes(stored)) {
    return stored as 'light' | 'dark' | 'auto'
  }

  return 'auto'
}

/**
 * Check if current theme is dark
 * @returns boolean
 */
export function isDarkTheme (): boolean {
  if (typeof window === 'undefined') return false

  const theme = getCurrentTheme()

  if (theme === 'dark') return true
  if (theme === 'light') return false

  // Auto mode - check system preference
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

/**
 * Convert hex color to RGB values
 * @param hex - Hex color string
 * @returns RGB values as string "r, g, b"
 */
export function hexToRgb (hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) {
    throw new Error(`Invalid hex color: ${hex}`)
  }

  const r = parseInt(result[1], 16)
  const g = parseInt(result[2], 16)
  const b = parseInt(result[3], 16)

  return `${r}, ${g}, ${b}`
}

/**
 * Convert RGB values to hex color
 * @param r - Red value (0-255)
 * @param g - Green value (0-255)
 * @param b - Blue value (0-255)
 * @returns Hex color string
 */
export function rgbToHex (r: number, g: number, b: number): string {
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`
}

/**
 * Theme color constants for easy access
 */
export const THEME_COLORS = {
  primary: 'primary',
  secondary: 'secondary',
  accent: 'accent',
  error: 'error',
  warning: 'warning',
  info: 'info',
  success: 'success',
  surface: 'surface',
  background: 'background',
} as const

/**
 * Color variant constants
 */
export const COLOR_VARIANTS = {
  50: '50',
  100: '100',
  200: '200',
  300: '300',
  400: '400',
  500: '500',
  600: '600',
  700: '700',
  800: '800',
  900: '900',
} as const

/**
 * Opacity level constants
 */
export const OPACITY_LEVELS = {
  10: '10',
  20: '20',
  30: '30',
  40: '40',
  50: '50',
  60: '60',
  70: '70',
  80: '80',
  90: '90',
} as const

/**
 * Pre-defined theme color combinations
 */
export const THEME_COMBINATIONS = {
  primaryGradient: {
    start: 'primary',
    end: 'secondary',
    direction: '135deg',
  },
  successGradient: {
    start: 'success',
    end: 'info',
    direction: '135deg',
  },
  warningGradient: {
    start: 'warning',
    end: 'error',
    direction: '135deg',
  },
  neutralGradient: {
    start: 'surface',
    end: 'background',
    direction: '135deg',
  },
} as const
