/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Semantic color utilities using CSS custom properties
        'primary': 'var(--color-primary)',
        'secondary': 'var(--color-secondary)',
        'tertiary': 'var(--color-tertiary)',
        'surface': 'var(--color-surface)',
        'overlay': 'var(--color-overlay)',
        
        'text': {
          'primary': 'var(--color-text-primary)',
          'secondary': 'var(--color-text-secondary)',
          'tertiary': 'var(--color-text-tertiary)',
          'inverse': 'var(--color-text-inverse)',
        },
        
        'border': {
          DEFAULT: 'var(--color-border)',
          'light': 'var(--color-border-light)',
          'dark': 'var(--color-border-dark)',
        },
        
        'hover': 'var(--color-hover)',
        'active': 'var(--color-active)',
        'disabled': 'var(--color-disabled)',
      },
      boxShadow: {
        'theme-sm': 'var(--shadow-sm)',
        'theme-md': 'var(--shadow-md)',
        'theme-lg': 'var(--shadow-lg)',
      },
    },
  },
  plugins: [],
}
