// Design System Configuration
// Centralizes spacing, typography, colors, and other design tokens

export const designSystem = {
  // Spacing Scale (based on 4px grid)
  spacing: {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '0.75rem',    // 12px
    lg: '1rem',       // 16px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    '3xl': '2rem',    // 32px
    '4xl': '2.5rem',  // 40px
    '5xl': '3rem',    // 48px
    '6xl': '4rem',    // 64px
  },

  // Typography Scale
  typography: {
    // Font Families for Italian Restaurant Theme
    fontFamily: {
      display: ['Playfair Display', 'serif'],        // Elegant serif for headers
      heading: ['Montserrat', 'sans-serif'],         // Clean sans-serif for subheadings
      body: ['Source Sans Pro', 'sans-serif'],       // Readable body text
      accent: ['Dancing Script', 'cursive'],         // Handwritten style for special elements
    },
    
    // Font Sizes with Italian Restaurant Typography Scale
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1rem' }],         // 12px
      sm: ['0.875rem', { lineHeight: '1.25rem' }],     // 14px
      base: ['1rem', { lineHeight: '1.6rem' }],        // 16px - improved readability
      lg: ['1.125rem', { lineHeight: '1.75rem' }],     // 18px
      xl: ['1.25rem', { lineHeight: '1.8rem' }],       // 20px
      '2xl': ['1.5rem', { lineHeight: '2rem' }],       // 24px
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }],  // 30px
      '4xl': ['2.25rem', { lineHeight: '2.5rem' }],    // 36px
      '5xl': ['3rem', { lineHeight: '1.2' }],          // 48px - hero headings
      '6xl': ['3.75rem', { lineHeight: '1.1' }],       // 60px - display headings
      '7xl': ['4.5rem', { lineHeight: '1.1' }],        // 72px - large displays
    },
    
    // Font Weights
    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },
    
    // Letter Spacing optimized for restaurant typography
    letterSpacing: {
      tighter: '-0.05em',   // For large display headings
      tight: '-0.025em',    // For headings
      normal: '0em',        // For body text
      wide: '0.01em',       // For improved readability
      wider: '0.025em',     // For small caps
      widest: '0.1em',      // For emphasis
    },
  },

  // Italian Restaurant Color Palette
  colors: {
    // Primary: Warm terracotta inspired by Italian pottery
    primary: {
      50: '#fef7f0',
      100: '#fdeee0',
      200: '#fad4b8',
      300: '#f7b88a',
      400: '#f2965c',
      500: '#d97706',  // Warm terracotta base
      600: '#c2671d',
      700: '#a55a1a',
      800: '#8b4d1b',
      900: '#744019',
      950: '#5a2f0f',
    },
    
    // Secondary: Deep forest green for natural, fresh feeling
    secondary: {
      50: '#f0f9f4',
      100: '#dcf4e3',
      200: '#bde8cc',
      300: '#8dd5aa',
      400: '#58bc82',
      500: '#22c55e',  // Fresh herb green
      600: '#15803d',
      700: '#166534',
      800: '#14532d',
      900: '#0f3f23',
      950: '#052e16',
    },
    
    // Accent: Warm brick red for call-to-action elements
    accent: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#dc2626',  // Classic Italian red
      600: '#b91c1c',
      700: '#991b1b',
      800: '#7f1d1d',
      900: '#701a1a',
      950: '#450a0a',
    },
    
    // Neutral: Warm cream tones
    neutral: {
      50: '#fefdfb',
      100: '#fefaf6',
      200: '#fcf5ec',
      300: '#f9f0e3',
      400: '#f5e6d3',
      500: '#e7d2b8',  // Warm cream
      600: '#d4b896',
      700: '#b5967a',
      800: '#957a63',
      900: '#6b5a4f',
      950: '#4a3f36',
    },
    
    // Semantic Colors
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
    },
    
    warning: {
      50: '#fffbeb',
      100: '#fef3c7',
      500: '#f59e0b',
      600: '#d97706',
      700: '#b45309',
    },
    
    error: {
      50: '#fef2f2',
      100: '#fee2e2',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
    },
    
    info: {
      50: '#eff6ff',
      100: '#dbeafe',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
    },
  },

  // Border Radius
  borderRadius: {
    none: '0px',
    sm: '0.125rem',   // 2px
    base: '0.25rem',  // 4px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    '3xl': '1.5rem',  // 24px
    full: '9999px',
  },

  // Shadows
  boxShadow: {
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  },

  // Animation Durations
  animation: {
    duration: {
      fast: '150ms',
      normal: '200ms',
      slow: '300ms',
      slower: '500ms',
    },
    
    easing: {
      linear: 'linear',
      in: 'cubic-bezier(0.4, 0, 1, 1)',
      out: 'cubic-bezier(0, 0, 0.2, 1)',
      inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },

  // Breakpoints
  breakpoints: {
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // Z-Index Scale
  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800,
  },
} as const

// Type definitions for better TypeScript support
export type SpacingKey = keyof typeof designSystem.spacing
export type ColorKey = keyof typeof designSystem.colors
export type FontSizeKey = keyof typeof designSystem.typography.fontSize
export type FontWeightKey = keyof typeof designSystem.typography.fontWeight

// Utility functions for accessing design tokens
export const getSpacing = (key: SpacingKey) => designSystem.spacing[key]
export const getColor = (category: ColorKey, shade?: number) => {
  const colorCategory = designSystem.colors[category]
  if (typeof colorCategory === 'object' && shade) {
    return (colorCategory as any)[shade]
  }
  return colorCategory
}

// CSS Custom Properties Generator
export const generateCSSVariables = () => {
  const cssVars: Record<string, string> = {}
  
  // Spacing variables
  Object.entries(designSystem.spacing).forEach(([key, value]) => {
    cssVars[`--spacing-${key}`] = value
  })
  
  // Color variables
  Object.entries(designSystem.colors).forEach(([category, colors]) => {
    if (typeof colors === 'object') {
      Object.entries(colors).forEach(([shade, value]) => {
        cssVars[`--color-${category}-${shade}`] = value
      })
    } else {
      cssVars[`--color-${category}`] = colors
    }
  })
  
  return cssVars
}