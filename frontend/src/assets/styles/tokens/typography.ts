/**
 * Design Tokens - Typography
 *
 * Centralized typography system for consistent text styling across the application.
 * Includes font families, sizes, weights, line heights, and letter spacing.
 */

/**
 * Font families
 */
export const fontFamilies = {
  sans: [
    'Inter',
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'Oxygen',
    'Ubuntu',
    'Cantarell',
    'Fira Sans',
    'Droid Sans',
    'Helvetica Neue',
    'sans-serif',
  ],
  serif: [
    'Georgia',
    'Cambria',
    'Times New Roman',
    'Times',
    'serif',
  ],
  mono: [
    'JetBrains Mono',
    'Fira Code',
    'Monaco',
    'Consolas',
    'Liberation Mono',
    'Courier New',
    'monospace',
  ],
} as const

/**
 * Font weights
 */
export const fontWeights = {
  thin: 100,
  extraLight: 200,
  light: 300,
  normal: 400,
  medium: 500,
  semiBold: 600,
  bold: 700,
  extraBold: 800,
  black: 900,
} as const

/**
 * Font sizes (in rem)
 */
export const fontSizes = {
  xs: '0.75rem', // 12px
  sm: '0.875rem', // 14px
  base: '1rem', // 16px
  lg: '1.125rem', // 18px
  xl: '1.25rem', // 20px
  '2xl': '1.5rem', // 24px
  '3xl': '1.875rem', // 30px
  '4xl': '2.25rem', // 36px
  '5xl': '3rem', // 48px
  '6xl': '3.75rem', // 60px
  '7xl': '4.5rem', // 72px
  '8xl': '6rem', // 96px
  '9xl': '8rem', // 128px
} as const

/**
 * Line heights
 */
export const lineHeights = {
  none: 1,
  tight: 1.25,
  snug: 1.375,
  normal: 1.5,
  relaxed: 1.625,
  loose: 2,
} as const

/**
 * Letter spacing
 */
export const letterSpacing = {
  tighter: '-0.05em',
  tight: '-0.025em',
  normal: '0em',
  wide: '0.025em',
  wider: '0.05em',
  widest: '0.1em',
} as const

/**
 * Typography scale definitions
 */
export const typographyScale = {
  // Display styles - for large headings and hero text
  display: {
    '2xl': {
      fontSize: fontSizes['8xl'],
      fontWeight: fontWeights.bold,
      lineHeight: lineHeights.none,
      letterSpacing: letterSpacing.tight,
    },
    xl: {
      fontSize: fontSizes['7xl'],
      fontWeight: fontWeights.bold,
      lineHeight: lineHeights.none,
      letterSpacing: letterSpacing.tight,
    },
    lg: {
      fontSize: fontSizes['6xl'],
      fontWeight: fontWeights.bold,
      lineHeight: lineHeights.none,
      letterSpacing: letterSpacing.tight,
    },
    md: {
      fontSize: fontSizes['5xl'],
      fontWeight: fontWeights.bold,
      lineHeight: lineHeights.tight,
      letterSpacing: letterSpacing.tight,
    },
    sm: {
      fontSize: fontSizes['4xl'],
      fontWeight: fontWeights.semiBold,
      lineHeight: lineHeights.tight,
      letterSpacing: letterSpacing.normal,
    },
  },

  // Heading styles
  heading: {
    h1: {
      fontSize: fontSizes['4xl'],
      fontWeight: fontWeights.bold,
      lineHeight: lineHeights.tight,
      letterSpacing: letterSpacing.tight,
    },
    h2: {
      fontSize: fontSizes['3xl'],
      fontWeight: fontWeights.bold,
      lineHeight: lineHeights.tight,
      letterSpacing: letterSpacing.normal,
    },
    h3: {
      fontSize: fontSizes['2xl'],
      fontWeight: fontWeights.semiBold,
      lineHeight: lineHeights.snug,
      letterSpacing: letterSpacing.normal,
    },
    h4: {
      fontSize: fontSizes.xl,
      fontWeight: fontWeights.semiBold,
      lineHeight: lineHeights.snug,
      letterSpacing: letterSpacing.normal,
    },
    h5: {
      fontSize: fontSizes.lg,
      fontWeight: fontWeights.medium,
      lineHeight: lineHeights.normal,
      letterSpacing: letterSpacing.normal,
    },
    h6: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.medium,
      lineHeight: lineHeights.normal,
      letterSpacing: letterSpacing.normal,
    },
  },

  // Body text styles
  body: {
    xl: {
      fontSize: fontSizes.xl,
      fontWeight: fontWeights.normal,
      lineHeight: lineHeights.relaxed,
      letterSpacing: letterSpacing.normal,
    },
    lg: {
      fontSize: fontSizes.lg,
      fontWeight: fontWeights.normal,
      lineHeight: lineHeights.relaxed,
      letterSpacing: letterSpacing.normal,
    },
    md: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.normal,
      lineHeight: lineHeights.normal,
      letterSpacing: letterSpacing.normal,
    },
    sm: {
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.normal,
      lineHeight: lineHeights.normal,
      letterSpacing: letterSpacing.normal,
    },
    xs: {
      fontSize: fontSizes.xs,
      fontWeight: fontWeights.normal,
      lineHeight: lineHeights.normal,
      letterSpacing: letterSpacing.wide,
    },
  },

  // Label styles
  label: {
    lg: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.medium,
      lineHeight: lineHeights.normal,
      letterSpacing: letterSpacing.normal,
    },
    md: {
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.medium,
      lineHeight: lineHeights.normal,
      letterSpacing: letterSpacing.normal,
    },
    sm: {
      fontSize: fontSizes.xs,
      fontWeight: fontWeights.medium,
      lineHeight: lineHeights.normal,
      letterSpacing: letterSpacing.wide,
    },
  },

  // Caption styles
  caption: {
    lg: {
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.normal,
      lineHeight: lineHeights.normal,
      letterSpacing: letterSpacing.normal,
    },
    md: {
      fontSize: fontSizes.xs,
      fontWeight: fontWeights.normal,
      lineHeight: lineHeights.normal,
      letterSpacing: letterSpacing.wide,
    },
  },

  // Code styles
  code: {
    lg: {
      fontSize: fontSizes.base,
      fontWeight: fontWeights.normal,
      lineHeight: lineHeights.normal,
      letterSpacing: letterSpacing.normal,
      fontFamily: fontFamilies.mono.join(', '),
    },
    md: {
      fontSize: fontSizes.sm,
      fontWeight: fontWeights.normal,
      lineHeight: lineHeights.normal,
      letterSpacing: letterSpacing.normal,
      fontFamily: fontFamilies.mono.join(', '),
    },
    sm: {
      fontSize: fontSizes.xs,
      fontWeight: fontWeights.normal,
      lineHeight: lineHeights.normal,
      letterSpacing: letterSpacing.normal,
      fontFamily: fontFamilies.mono.join(', '),
    },
  },
} as const

/**
 * Typography utilities
 */
export const typographyUtils = {
  /**
   * Generate CSS font-family string
   * @param family - Font family key
   * @returns CSS font-family string
   */
  getFontFamily: (family: keyof typeof fontFamilies): string => {
    return fontFamilies[family].join(', ')
  },

  /**
   * Generate typography CSS properties
   * @param scale - Typography scale
   * @param variant - Variant within scale
   * @returns CSS properties object
   */
  getTypographyStyles: (
    scale: keyof typeof typographyScale,
    variant: string,
  ): Record<string, string | number> => {
    const scaleObj = typographyScale[scale] as any
    const styles = scaleObj?.[variant]

    if (!styles) {
      console.warn(`Typography variant '${variant}' not found in scale '${scale}'`)
      return {}
    }

    return {
      fontSize: styles.fontSize,
      fontWeight: styles.fontWeight,
      lineHeight: styles.lineHeight,
      letterSpacing: styles.letterSpacing,
      ...(styles.fontFamily && { fontFamily: styles.fontFamily }),
    }
  },

  /**
   * Generate responsive typography
   * @param baseVariant - Base typography variant
   * @param responsiveVariants - Responsive variants
   * @returns CSS with media queries
   */
  getResponsiveTypography: (
    baseVariant: { scale: keyof typeof typographyScale, variant: string },
    responsiveVariants?: {
      sm?: { scale: keyof typeof typographyScale, variant: string },
      md?: { scale: keyof typeof typographyScale, variant: string },
      lg?: { scale: keyof typeof typographyScale, variant: string },
      xl?: { scale: keyof typeof typographyScale, variant: string },
    },
  ): Record<string, any> => {
    const baseStyles = typographyUtils.getTypographyStyles(
      baseVariant.scale,
      baseVariant.variant,
    )

    const result: Record<string, any> = { ...baseStyles }

    if (responsiveVariants) {
      if (responsiveVariants.sm) {
        result['@media (min-width: 640px)'] = typographyUtils.getTypographyStyles(
          responsiveVariants.sm.scale,
          responsiveVariants.sm.variant,
        )
      }

      if (responsiveVariants.md) {
        result['@media (min-width: 768px)'] = typographyUtils.getTypographyStyles(
          responsiveVariants.md.scale,
          responsiveVariants.md.variant,
        )
      }

      if (responsiveVariants.lg) {
        result['@media (min-width: 1024px)'] = typographyUtils.getTypographyStyles(
          responsiveVariants.lg.scale,
          responsiveVariants.lg.variant,
        )
      }

      if (responsiveVariants.xl) {
        result['@media (min-width: 1280px)'] = typographyUtils.getTypographyStyles(
          responsiveVariants.xl.scale,
          responsiveVariants.xl.variant,
        )
      }
    }

    return result
  },
}

/**
 * CSS custom properties for typography
 */
export const typographyCSSVars = {
  // Font families
  '--font-family-sans': fontFamilies.sans.join(', '),
  '--font-family-serif': fontFamilies.serif.join(', '),
  '--font-family-mono': fontFamilies.mono.join(', '),

  // Font sizes
  '--font-size-xs': fontSizes.xs,
  '--font-size-sm': fontSizes.sm,
  '--font-size-base': fontSizes.base,
  '--font-size-lg': fontSizes.lg,
  '--font-size-xl': fontSizes.xl,
  '--font-size-2xl': fontSizes['2xl'],
  '--font-size-3xl': fontSizes['3xl'],
  '--font-size-4xl': fontSizes['4xl'],
  '--font-size-5xl': fontSizes['5xl'],
  '--font-size-6xl': fontSizes['6xl'],
  '--font-size-7xl': fontSizes['7xl'],
  '--font-size-8xl': fontSizes['8xl'],
  '--font-size-9xl': fontSizes['9xl'],

  // Font weights
  '--font-weight-thin': fontWeights.thin,
  '--font-weight-extralight': fontWeights.extraLight,
  '--font-weight-light': fontWeights.light,
  '--font-weight-normal': fontWeights.normal,
  '--font-weight-medium': fontWeights.medium,
  '--font-weight-semibold': fontWeights.semiBold,
  '--font-weight-bold': fontWeights.bold,
  '--font-weight-extrabold': fontWeights.extraBold,
  '--font-weight-black': fontWeights.black,

  // Line heights
  '--line-height-none': lineHeights.none,
  '--line-height-tight': lineHeights.tight,
  '--line-height-snug': lineHeights.snug,
  '--line-height-normal': lineHeights.normal,
  '--line-height-relaxed': lineHeights.relaxed,
  '--line-height-loose': lineHeights.loose,

  // Letter spacing
  '--letter-spacing-tighter': letterSpacing.tighter,
  '--letter-spacing-tight': letterSpacing.tight,
  '--letter-spacing-normal': letterSpacing.normal,
  '--letter-spacing-wide': letterSpacing.wide,
  '--letter-spacing-wider': letterSpacing.wider,
  '--letter-spacing-widest': letterSpacing.widest,
} as const

/**
 * Typography types
 */
export type FontFamily = keyof typeof fontFamilies
export type FontWeight = keyof typeof fontWeights
export type FontSize = keyof typeof fontSizes
export type LineHeight = keyof typeof lineHeights
export type LetterSpacing = keyof typeof letterSpacing
export type TypographyScale = keyof typeof typographyScale

/**
 * Export all typography tokens
 */
export const typography = {
  families: fontFamilies,
  weights: fontWeights,
  sizes: fontSizes,
  lineHeights,
  letterSpacing,
  scale: typographyScale,
  utils: typographyUtils,
  cssVars: typographyCSSVars,
} as const

export default typography
