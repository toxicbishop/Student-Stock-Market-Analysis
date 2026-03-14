/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        "primary": "#10c16c",
        "background-light": "#F7F9FC",
        "background-dark": "#102219",
        "surface": "#FFFFFF",
        "text-main": "#12151A",
        "text-muted": "#8A94A6",
        "accent-blue": "#0066FF"
      },
      fontFamily: {
        "display": ["Inter", "sans-serif"]
      },
      borderRadius: {
        "DEFAULT": "0.5rem",
        "md": "1rem",
        "lg": "1.5rem",
        "xl": "24px",
        "full": "9999px"
      },
      boxShadow: {
        'card': '0 12px 40px rgba(0, 102, 255, 0.05)',
        'chart-glow': '0 8px 32px rgba(0, 102, 255, 0.2)',
        'soft': '0 4px 20px rgba(0, 102, 255, 0.03)',
        'soft-hover': '0 12px 40px rgba(0, 102, 255, 0.08)',
        'panel': '-12px 0 40px rgba(0, 102, 255, 0.05)',
        'sticky': '0 -12px 40px rgba(0, 102, 255, 0.05)',
      },
      animation: {
        'slide-up': 'slideUp 0.3s cubic-bezier(0.16,1,0.3,1)',
        'fade-in': 'fadeIn 0.2s ease',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
}
