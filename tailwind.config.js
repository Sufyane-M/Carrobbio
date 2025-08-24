/** @type {import('tailwindcss').Config} */

export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '2rem',
        lg: '4rem',
        xl: '5rem',
        '2xl': '6rem',
      },
    },
    extend: {
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
      },
      
      // Enhanced Typography for Italian Restaurant
      fontFamily: {
        display: ['Playfair Display', 'serif'],        // Elegant serif for headers
        heading: ['Montserrat', 'sans-serif'],         // Clean sans-serif for subheadings
        body: ['Source Sans Pro', 'sans-serif'],       // Readable body text
        accent: ['Dancing Script', 'cursive'],         // Handwritten style for special elements
      },
      
      fontSize: {
        '7xl': ['4.5rem', { lineHeight: '1.1' }],        // 72px - large displays
        '8xl': ['6rem', { lineHeight: '1' }],            // 96px - hero displays
        '9xl': ['8rem', { lineHeight: '1' }],            // 128px - massive displays
      },
      
      // Enhanced spacing for better layouts
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      
      // Custom animations for smooth interactions
      animation: {
        'fade-in-up': 'fadeInUp 0.6s ease-out forwards',
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'slide-in-left': 'slideInLeft 0.5s ease-out forwards',
        'slide-in-right': 'slideInRight 0.5s ease-out forwards',
        'bounce-gentle': 'bounceGentle 2s ease-in-out infinite',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
      },
      
      // Keyframes for animations
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideInLeft: {
          '0%': { opacity: '0', transform: 'translateX(-30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(30px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
      },
      
      // Enhanced shadows for depth
      boxShadow: {
        'soft': '0 2px 8px rgba(0, 0, 0, 0.1)',
        'medium': '0 4px 12px rgba(0, 0, 0, 0.15)',
        'strong': '0 8px 24px rgba(0, 0, 0, 0.2)',
        'glow': '0 0 20px rgba(217, 119, 6, 0.3)',
        'glow-accent': '0 0 20px rgba(220, 38, 38, 0.3)',
      },
      
      // Custom backdrop blur for modern effects
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
