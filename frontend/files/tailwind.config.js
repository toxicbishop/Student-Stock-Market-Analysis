/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand:   '#7F77DD',
        profit:  '#1DB87A',
        loss:    '#E24B4A',
        warning: '#F0A500',
        surface: '#0F0F18',
        card:    '#15151F',
        border:  '#1E1E2E',
        muted:   '#6B6B8A',
      },
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      animation: {
        'slide-up':   'slideUp 0.3s cubic-bezier(0.16,1,0.3,1)',
        'fade-in':    'fadeIn 0.2s ease',
        'pulse-slow': 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite',
      },
      keyframes: {
        slideUp: {
          '0%':   { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
