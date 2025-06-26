/**
 * Design Tokens - Main Export
 * 
 * Centralized export for all design tokens including colors, typography,
 * spacing, and utility functions for consistent theming.
 */

import colors, { type Theme, type ThemeMode, getThemeColors } from './colors'
import typography, { type TypographyScale } from './typography'
import spacingTokens, { type SpacingKey, type SemanticSpacingCategory } from './spacing'

/**
 * Complete design system tokens
 */
export const designTokens = {
  colors,
  typography,
  spacing: spacingTokens
} as const

/**
 * Theme configuration
 */
export interface ThemeConfig {
  mode: ThemeMode
  colors: Theme
  typography: typeof typography
  spacing: typeof spacingTokens
}

/**
 * Create theme configuration
 * @param mode - Theme mode (light/dark)
 * @returns Complete theme configuration
 */
export function createTheme(mode: ThemeMode = 'light'): ThemeConfig {
  return {
    mode,
    colors: getThemeColors(mode),
    typography,
    spacing: spacingTokens
  }
}

/**
 * CSS custom properties generator
 * @param theme - Theme configuration
 * @returns CSS custom properties object
 */
export function generateCSSVars(theme: ThemeConfig): Record<string, string | number> {
  const cssVars: Record<string, string | number> = {}
  
  // Color variables
  Object.entries(theme.colors).forEach(([category, colorGroup]) => {
    if (typeof colorGroup === 'object') {
      Object.entries(colorGroup).forEach(([key, value]) => {
        if (typeof value === 'string') {
          cssVars[`--color-${category}-${key}`] = value
        } else if (typeof value === 'object') {
          Object.entries(value).forEach(([subKey, subValue]) => {
            cssVars[`--color-${category}-${key}-${subKey}`] = subValue
          })
        }
      })
    }
  })
  
  // Typography variables
  Object.assign(cssVars, typography.cssVars)
  
  // Spacing variables
  Object.assign(cssVars, spacingTokens.cssVars)
  
  return cssVars
}

/**
 * Generate CSS string from variables
 * @param cssVars - CSS variables object
 * @returns CSS string
 */
export function generateCSSString(cssVars: Record<string, string | number>): string {
  const cssEntries = Object.entries(cssVars)
    .map(([key, value]) => `  ${key}: ${value};`)
    .join('\n')
  
  return `:root {\n${cssEntries}\n}`
}

/**
 * Theme utilities
 */
export const themeUtils = {
  /**
   * Get color value from theme
   * @param theme - Theme configuration
   * @param path - Color path (e.g., 'brand.primary')
   * @returns Color value
   */
  getColor: (theme: ThemeConfig, path: string): string => {
    const keys = path.split('.')
    let value: any = theme.colors
    
    for (const key of keys) {
      value = value?.[key]
      if (value === undefined) {
        console.warn(`Color path '${path}' not found in theme`)
        return '#000000'
      }
    }
    
    return typeof value === 'string' ? value : '#000000'
  },
  
  /**
   * Get typography styles from theme
   * @param theme - Theme configuration
   * @param scale - Typography scale
   * @param variant - Typography variant
   * @returns Typography styles
   */
  getTypography: (
    theme: ThemeConfig,
    scale: TypographyScale,
    variant: string
  ): Record<string, string | number> => {
    return theme.typography.utils.getTypographyStyles(scale, variant)
  },
  
  /**
   * Get spacing value from theme
   * @param theme - Theme configuration
   * @param key - Spacing key
   * @returns Spacing value
   */
  getSpacing: (theme: ThemeConfig, key: SpacingKey): string => {
    return theme.spacing.utils.getSpacing(key)
  },
  
  /**
   * Get semantic spacing from theme
   * @param theme - Theme configuration
   * @param category - Spacing category
   * @param size - Size variant
   * @returns Spacing value
   */
  getSemanticSpacing: (
    theme: ThemeConfig,
    category: SemanticSpacingCategory,
    size: keyof typeof spacingTokens.semantic.component
  ): string => {
    return theme.spacing.utils.getSemanticSpacing(category, size)
  }
}

/**
 * Breakpoints for responsive design
 */
export const breakpoints = {
  xs: '0px',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px'
} as const

/**
 * Media query utilities
 */
export const mediaQueries = {
  xs: `@media (min-width: ${breakpoints.xs})`,
  sm: `@media (min-width: ${breakpoints.sm})`,
  md: `@media (min-width: ${breakpoints.md})`,
  lg: `@media (min-width: ${breakpoints.lg})`,
  xl: `@media (min-width: ${breakpoints.xl})`,
  '2xl': `@media (min-width: ${breakpoints['2xl']})`,
  
  // Max width queries
  maxXs: `@media (max-width: ${breakpoints.sm})`,
  maxSm: `@media (max-width: ${breakpoints.md})`,
  maxMd: `@media (max-width: ${breakpoints.lg})`,
  maxLg: `@media (max-width: ${breakpoints.xl})`,
  maxXl: `@media (max-width: ${breakpoints['2xl']})`,
  
  // Range queries
  smToMd: `@media (min-width: ${breakpoints.sm}) and (max-width: ${breakpoints.md})`,
  mdToLg: `@media (min-width: ${breakpoints.md}) and (max-width: ${breakpoints.lg})`,
  lgToXl: `@media (min-width: ${breakpoints.lg}) and (max-width: ${breakpoints.xl})`,
  
  // Device queries
  mobile: '@media (max-width: 767px)',
  tablet: '@media (min-width: 768px) and (max-width: 1023px)',
  desktop: '@media (min-width: 1024px)',
  
  // Orientation queries
  portrait: '@media (orientation: portrait)',
  landscape: '@media (orientation: landscape)',
  
  // High DPI queries
  retina: '@media (-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)'
} as const

/**
 * Animation and transition tokens
 */
export const animations = {
  // Duration
  duration: {
    fast: '150ms',
    normal: '250ms',
    slow: '350ms',
    slower: '500ms'
  },
  
  // Easing functions
  easing: {
    linear: 'linear',
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)'
  },
  
  // Common transitions
  transition: {
    all: 'all 250ms cubic-bezier(0.4, 0, 0.2, 1)',
    colors: 'color 250ms cubic-bezier(0.4, 0, 0.2, 1), background-color 250ms cubic-bezier(0.4, 0, 0.2, 1), border-color 250ms cubic-bezier(0.4, 0, 0.2, 1)',
    opacity: 'opacity 250ms cubic-bezier(0.4, 0, 0.2, 1)',
    transform: 'transform 250ms cubic-bezier(0.4, 0, 0.2, 1)',
    shadow: 'box-shadow 250ms cubic-bezier(0.4, 0, 0.2, 1)'
  }
} as const

/**
 * Shadow tokens
 */
export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)'
} as const

/**
 * Export types
 */
export type {
  Theme,
  ThemeMode,
  TypographyScale,
  SpacingKey,
  SemanticSpacingCategory
} from './colors'

export type {
  FontFamily,
  FontWeight,
  FontSize,
  LineHeight,
  LetterSpacing
} from './typography'

export type {
  SemanticSpacingSize,
  BorderRadiusKey,
  ZIndexKey
} from './spacing'

export type Breakpoint = keyof typeof breakpoints
export type MediaQuery = keyof typeof mediaQueries
export type AnimationDuration = keyof typeof animations.duration
export type AnimationEasing = keyof typeof animations.easing
export type Shadow = keyof typeof shadows

/**
 * Re-export individual token modules
 */
export { colors, getThemeColors } from './colors'
export { typography } from './typography'
export { spacingTokens as spacing } from './spacing'

/**
 * Default export
 */
export default {
  designTokens,
  createTheme,
  generateCSSVars,
  generateCSSString,
  themeUtils,
  breakpoints,
  mediaQueries,
  animations,
  shadows
}