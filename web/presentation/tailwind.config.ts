import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        'bg-primary': '#FFFFFF',
        'bg-surface': '#F7F8FA',
        'bg-dark': '#0C1926',
        'text-primary': '#1A1F36',
        'text-secondary': '#4E5A6E',
        'text-muted': '#8492A6',
        'brand-navy': '#1B365D',
        'brand-gold': '#C5922E',
        'brand-copper': '#B87333',
        'brand-iron': '#5C6370',
        'success': '#2D8A4E',
        'amber': '#D97706',
        'border': '#E2E8F0',
      },
      fontFamily: {
        playfair: ['var(--font-playfair)', 'serif'],
        sans: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains)', 'monospace'],
      },
      maxWidth: {
        '7xl': '80rem',
      },
    },
  },
  plugins: [],
}

export default config
