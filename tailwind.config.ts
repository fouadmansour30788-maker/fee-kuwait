import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // FEE Kuwait brand greens
        forest:   '#1B4332',
        emerald:  '#2D6A4F',
        brand:    '#40916C',
        medium:   '#52B788',
        light:    '#74C69D',
        mint:     '#B7E4C7',
        pale:     '#D8F3DC',
        // Neutrals
        cream:    '#F9FAF7',
        softcream:'#F1F5F0',
        greengray:'#E8F0E9',
        charcoal: '#1C1F1D',
        gray:     '#4A5568',
        // Accents
        gold:     '#C8A951',
        sand:     '#E8D5A3',
        // Blue (Blue Flag only)
        gulf:     '#006994',
        sky:      '#90E0EF',
        // Dark mode
        dark:     '#0D1F17',
      },
      fontFamily: {
        sans:    ['var(--font-jakarta)', 'sans-serif'],
        arabic:  ['var(--font-cairo)', 'sans-serif'],
      },
      animation: {
        'count-up':    'countUp 2s ease-out forwards',
        'float':       'float 6s ease-in-out infinite',
        'pulse-glow':  'pulseGlow 2s ease-in-out infinite',
        'slide-up':    'slideUp 0.6s ease-out forwards',
        'fade-in':     'fadeIn 0.5s ease-out forwards',
      },
      keyframes: {
        countUp:    { from: { opacity: '0', transform: 'translateY(10px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        float:      { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-12px)' } },
        pulseGlow:  { '0%,100%': { boxShadow: '0 0 20px rgba(64,145,108,0.3)' }, '50%': { boxShadow: '0 0 40px rgba(64,145,108,0.6)' } },
        slideUp:    { from: { opacity: '0', transform: 'translateY(30px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        fadeIn:     { from: { opacity: '0' }, to: { opacity: '1' } },
      },
      backgroundImage: {
        'green-gradient':  'linear-gradient(135deg, #1B4332 0%, #40916C 100%)',
        'hero-overlay':    'linear-gradient(to bottom, rgba(27,67,50,0.7) 0%, rgba(27,67,50,0.4) 50%, rgba(27,67,50,0.8) 100%)',
      },
      boxShadow: {
        'green-sm': '0 2px 8px rgba(64,145,108,0.15)',
        'green-md': '0 4px 16px rgba(64,145,108,0.2)',
        'green-lg': '0 8px 32px rgba(64,145,108,0.25)',
        'green-xl': '0 16px 48px rgba(64,145,108,0.3)',
      },
    },
  },
  plugins: [],
};
export default config;
