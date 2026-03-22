/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-main': '#0a0a0a',
        'surface': '#141414',
        'surface-hover': '#1e1e1e',
        'surface-subtle': '#1a1a1a',
        'border': '#262626',
        'main': '#ffffff',
        'muted': '#a3a3a3',
        'brand-primary': '#38a169',
        'alert-accent': '#e53e3e',
        'alert-dark': '#fed7d7'
      },
      fontFamily: {
        display: ['Inter', 'sans-serif']
      }
    },
  },
  plugins: [],
}
