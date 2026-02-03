import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'ft-dark': '#1A2850',
        'ft-light': '#01A2E9',
        'ft-secondary-1': '#2D3E50',
        'ft-secondary-2': '#475569',
        'ft-neutral': '#94A3B8',
        'klaus-bg': '#0B1121', // Deep space black/blue
        'klaus-sidebar': '#151E32', // Slightly lighter sidebar
        'klaus-card': '#1E293B', // Slate 800 for cards
        'klaus-border': '#334155', // Slate 700 for borders
        'klaus-text': '#E2E8F0', // Slate 200 for text
        'klaus-muted': '#94A3B8', // Slate 400 for muted text
      },
      fontFamily: {
        heading: ['Gill Sans', 'sans-serif'],
        body: ['Avenir Next', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
