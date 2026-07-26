/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: {
    colors: {
      'bg-main': 'var(--color-bg-main)', surface: 'var(--color-surface)', 'surface-hover': 'var(--color-surface-hover)', 'surface-raised': 'var(--color-surface-raised)', border: 'var(--color-border)', main: 'var(--color-main)', muted: 'var(--color-muted)', 'brand-primary': 'var(--color-brand-primary)', 'alert-accent': 'var(--color-alert-accent)', 'alert-dark': 'var(--color-alert-dark)', 'alert-light': 'var(--color-alert-light)', 'alert-danger': 'var(--color-alert-danger)'
    }
  } }, plugins: []
}
