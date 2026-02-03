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
