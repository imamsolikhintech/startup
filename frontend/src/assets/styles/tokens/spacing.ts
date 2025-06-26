/**
 * Design Tokens - Spacing
 * 
 * Centralized spacing system for consistent layout and component spacing.
 * Includes padding, margin, gap, and positioning values.
 */

/**
 * Base spacing scale (in rem)
 * Based on 4px base unit (0.25rem)
 */
export const spacing = {
  0: '0',
  px: '1px',
  0.5: '0.125rem',  // 2px
  1: '0.25rem',     // 4px
  1.5: '0.375rem',  // 6px
  2: '0.5rem',      // 8px
  2.5: '0.625rem',  // 10px
  3: '0.75rem',     // 12px
  3.5: '0.875rem',  // 14px
  4: '1rem',        // 16px
  5: '1.25rem',     // 20px
  6: '1.5rem',      // 24px
  7: '1.75rem',     // 28px
  8: '2rem',        // 32px
  9: '2.25rem',     // 36px
  10: '2.5rem',     // 40px
  11: '2.75rem',    // 44px
  12: '3rem',       // 48px
  14: '3.5rem',     // 56px
  16: '4rem',       // 64px
  20: '5rem',       // 80px
  24: '6rem',       // 96px
  28: '7rem',       // 112px
  32: '8rem',       // 128px
  36: '9rem',       // 144px
  40: '10rem',      // 160px
  44: '11rem',      // 176px
  48: '12rem',      // 192px
  52: '13rem',      // 208px
  56: '14rem',      // 224px
  60: '15rem',      // 240px
  64: '16rem',      // 256px
  72: '18rem',      // 288px
  80: '20rem',      // 320px
  96: '24rem'       // 384px
} as const

/**
 * Semantic spacing values
 */
export const semanticSpacing = {
  // Component spacing
  component: {
    xs: spacing[1],      // 4px
    sm: spacing[2],      // 8px
    md: spacing[4],      // 16px
    lg: spacing[6],      // 24px
    xl: spacing[8],      // 32px
    '2xl': spacing[12],  // 48px
    '3xl': spacing[16],  // 64px
    '4xl': spacing[20],  // 80px
    '5xl': spacing[24]   // 96px
  },
  
  // Layout spacing
  layout: {
    xs: spacing[4],      // 16px
    sm: spacing[6],      // 24px
    md: spacing[8],      // 32px
    lg: spacing[12],     // 48px
    xl: spacing[16],     // 64px
    '2xl': spacing[20],  // 80px
    '3xl': spacing[24],  // 96px
    '4xl': spacing[32],  // 128px
    '5xl': spacing[40]   // 160px
  },
  
  // Container spacing
  container: {
    xs: spacing[4],      // 16px
    sm: spacing[6],      // 24px
    md: spacing[8],      // 32px
    lg: spacing[12],     // 48px
    xl: spacing[16],     // 64px
    '2xl': spacing[24],  // 96px
    '3xl': spacing[32],  // 128px
    '4xl': spacing[48],  // 192px
    '5xl': spacing[64]   // 256px
  },
  
  // Section spacing
  section: {
    xs: spacing[8],      // 32px
    sm: spacing[12],     // 48px
    md: spacing[16],     // 64px
    lg: spacing[20],     // 80px
    xl: spacing[24],     // 96px
    '2xl': spacing[32],  // 128px
    '3xl': spacing[40],  // 160px
    '4xl': spacing[48],  // 192px
    '5xl': spacing[64]   // 256px
  }
} as const

/**
 * Responsive spacing breakpoints
 */
export const responsiveSpacing = {
  // Mobile-first responsive spacing
  responsive: {
    xs: {
      component: semanticSpacing.component.xs,
      layout: semanticSpacing.layout.xs,
      container: semanticSpacing.container.xs,
      section: semanticSpacing.section.xs
    },
    sm: {
      component: semanticSpacing.component.sm,
      layout: semanticSpacing.layout.sm,
      container: semanticSpacing.container.sm,
      section: semanticSpacing.section.sm
    },
    md: {
      component: semanticSpacing.component.md,
      layout: semanticSpacing.layout.md,
      container: semanticSpacing.container.md,
      section: semanticSpacing.section.md
    },
    lg: {
      component: semanticSpacing.component.lg,
      layout: semanticSpacing.layout.lg,
      container: semanticSpacing.container.lg,
      section: semanticSpacing.section.lg
    },
    xl: {
      component: semanticSpacing.component.xl,
      layout: semanticSpacing.layout.xl,
      container: semanticSpacing.container.xl,
      section: semanticSpacing.section.xl
    }
  }
} as const

/**
 * Grid and flexbox spacing
 */
export const gridSpacing = {
  // Gap values for CSS Grid and Flexbox
  gap: {
    none: spacing[0],
    xs: spacing[1],      // 4px
    sm: spacing[2],      // 8px
    md: spacing[4],      // 16px
    lg: spacing[6],      // 24px
    xl: spacing[8],      // 32px
    '2xl': spacing[12],  // 48px
    '3xl': spacing[16],  // 64px
    '4xl': spacing[20],  // 80px
    '5xl': spacing[24]   // 96px
  },
  
  // Column gaps
  columnGap: {
    none: spacing[0],
    xs: spacing[2],      // 8px
    sm: spacing[4],      // 16px
    md: spacing[6],      // 24px
    lg: spacing[8],      // 32px
    xl: spacing[12],     // 48px
    '2xl': spacing[16],  // 64px
    '3xl': spacing[20],  // 80px
    '4xl': spacing[24]   // 96px
  },
  
  // Row gaps
  rowGap: {
    none: spacing[0],
    xs: spacing[2],      // 8px
    sm: spacing[4],      // 16px
    md: spacing[6],      // 24px
    lg: spacing[8],      // 32px
    xl: spacing[12],     // 48px
    '2xl': spacing[16],  // 64px
    '3xl': spacing[20],  // 80px
    '4xl': spacing[24]   // 96px
  }
} as const

/**
 * Border radius values
 */
export const borderRadius = {
  none: '0',
  sm: '0.125rem',      // 2px
  base: '0.25rem',     // 4px
  md: '0.375rem',      // 6px
  lg: '0.5rem',        // 8px
  xl: '0.75rem',       // 12px
  '2xl': '1rem',       // 16px
  '3xl': '1.5rem',     // 24px
  full: '9999px'
} as const

/**
 * Z-index scale
 */
export const zIndex = {
  auto: 'auto',
  0: 0,
  10: 10,
  20: 20,
  30: 30,
  40: 40,
  50: 50,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modal: 1040,
  popover: 1050,
  tooltip: 1060,
  toast: 1070,
  overlay: 1080,
  max: 2147483647
} as const

/**
 * Spacing utilities
 */
export const spacingUtils = {
  /**
   * Get spacing value by key
   * @param key - Spacing key
   * @returns Spacing value
   */
  getSpacing: (key: keyof typeof spacing): string => {
    return spacing[key]
  },
  
  /**
   * Get semantic spacing value
   * @param category - Spacing category
   * @param size - Size variant
   * @returns Spacing value
   */
  getSemanticSpacing: (
    category: keyof typeof semanticSpacing,
    size: keyof typeof semanticSpacing.component
  ): string => {
    return semanticSpacing[category][size]
  },
  
  /**
   * Generate responsive spacing CSS
   * @param property - CSS property (margin, padding, gap, etc.)
   * @param values - Responsive values
   * @returns CSS object with media queries
   */
  getResponsiveSpacing: (
    property: string,
    values: {
      base: string
      sm?: string
      md?: string
      lg?: string
      xl?: string
    }
  ): Record<string, any> => {
    const result: Record<string, any> = {
      [property]: values.base
    }
    
    if (values.sm) {
      result['@media (min-width: 640px)'] = { [property]: values.sm }
    }
    
    if (values.md) {
      result['@media (min-width: 768px)'] = { [property]: values.md }
    }
    
    if (values.lg) {
      result['@media (min-width: 1024px)'] = { [property]: values.lg }
    }
    
    if (values.xl) {
      result['@media (min-width: 1280px)'] = { [property]: values.xl }
    }
    
    return result
  },
  
  /**
   * Generate margin utilities
   * @param value - Spacing value
   * @param sides - Which sides to apply (top, right, bottom, left)
   * @returns CSS margin properties
   */
  getMargin: (
    value: string,
    sides?: ('top' | 'right' | 'bottom' | 'left')[]
  ): Record<string, string> => {
    if (!sides || sides.length === 0) {
      return { margin: value }
    }
    
    const result: Record<string, string> = {}
    sides.forEach(side => {
      result[`margin${side.charAt(0).toUpperCase() + side.slice(1)}`] = value
    })
    
    return result
  },
  
  /**
   * Generate padding utilities
   * @param value - Spacing value
   * @param sides - Which sides to apply (top, right, bottom, left)
   * @returns CSS padding properties
   */
  getPadding: (
    value: string,
    sides?: ('top' | 'right' | 'bottom' | 'left')[]
  ): Record<string, string> => {
    if (!sides || sides.length === 0) {
      return { padding: value }
    }
    
    const result: Record<string, string> = {}
    sides.forEach(side => {
      result[`padding${side.charAt(0).toUpperCase() + side.slice(1)}`] = value
    })
    
    return result
  }
}

/**
 * CSS custom properties for spacing
 */
export const spacingCSSVars = {
  // Base spacing
  '--spacing-0': spacing[0],
  '--spacing-px': spacing.px,
  '--spacing-0-5': spacing[0.5],
  '--spacing-1': spacing[1],
  '--spacing-1-5': spacing[1.5],
  '--spacing-2': spacing[2],
  '--spacing-2-5': spacing[2.5],
  '--spacing-3': spacing[3],
  '--spacing-3-5': spacing[3.5],
  '--spacing-4': spacing[4],
  '--spacing-5': spacing[5],
  '--spacing-6': spacing[6],
  '--spacing-7': spacing[7],
  '--spacing-8': spacing[8],
  '--spacing-9': spacing[9],
  '--spacing-10': spacing[10],
  '--spacing-11': spacing[11],
  '--spacing-12': spacing[12],
  '--spacing-14': spacing[14],
  '--spacing-16': spacing[16],
  '--spacing-20': spacing[20],
  '--spacing-24': spacing[24],
  '--spacing-28': spacing[28],
  '--spacing-32': spacing[32],
  '--spacing-36': spacing[36],
  '--spacing-40': spacing[40],
  '--spacing-44': spacing[44],
  '--spacing-48': spacing[48],
  '--spacing-52': spacing[52],
  '--spacing-56': spacing[56],
  '--spacing-60': spacing[60],
  '--spacing-64': spacing[64],
  '--spacing-72': spacing[72],
  '--spacing-80': spacing[80],
  '--spacing-96': spacing[96],
  
  // Border radius
  '--radius-none': borderRadius.none,
  '--radius-sm': borderRadius.sm,
  '--radius-base': borderRadius.base,
  '--radius-md': borderRadius.md,
  '--radius-lg': borderRadius.lg,
  '--radius-xl': borderRadius.xl,
  '--radius-2xl': borderRadius['2xl'],
  '--radius-3xl': borderRadius['3xl'],
  '--radius-full': borderRadius.full,
  
  // Z-index
  '--z-auto': zIndex.auto,
  '--z-0': zIndex[0],
  '--z-10': zIndex[10],
  '--z-20': zIndex[20],
  '--z-30': zIndex[30],
  '--z-40': zIndex[40],
  '--z-50': zIndex[50],
  '--z-dropdown': zIndex.dropdown,
  '--z-sticky': zIndex.sticky,
  '--z-fixed': zIndex.fixed,
  '--z-modal': zIndex.modal,
  '--z-popover': zIndex.popover,
  '--z-tooltip': zIndex.tooltip,
  '--z-toast': zIndex.toast,
  '--z-overlay': zIndex.overlay,
  '--z-max': zIndex.max
} as const

/**
 * Spacing types
 */
export type SpacingKey = keyof typeof spacing
export type SemanticSpacingCategory = keyof typeof semanticSpacing
export type SemanticSpacingSize = keyof typeof semanticSpacing.component
export type BorderRadiusKey = keyof typeof borderRadius
export type ZIndexKey = keyof typeof zIndex

/**
 * Export all spacing tokens
 */
export const spacingTokens = {
  base: spacing,
  semantic: semanticSpacing,
  responsive: responsiveSpacing,
  grid: gridSpacing,
  borderRadius,
  zIndex,
  utils: spacingUtils,
  cssVars: spacingCSSVars
} as const

export default spacingTokens