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
        // ── Luxury eco palette ──────────────────────
        forestdeep: '#182019',  // darkest — primary text / dark sections
        forest:     '#182019',  // primary text / dark sections
        emerald:    '#2C3A2D',  // buttons / secondary dark
        brand:      '#2C3A2D',  // primary button + dark green accent
        sage:       '#8B9B88',  // accents / soft backgrounds
        olive:      '#7B8266',  // highlights / tags
        // Greens (softened, kept for back-compat tokens)
        medium:     '#8B9B88',
        light:      '#A9B6A4',
        mint:       '#D4DCCD',
        pale:       '#E8ECE1',
        // Neutrals — warm
        cream:      '#F7F3EA',  // primary background
        warmwhite:  '#FCFAF5',  // cards / secondary background
        softcream:  '#FCFAF5',
        greengray:  '#ECE9DD',
        charcoal:   '#182019',
        gray:       '#4A544C',  // muted paragraph text
        muted:      '#4A544C',
        // Accents
        gold:       '#C8A951',
        sand:       '#E8D5A3',
        // Blue (Blue Flag only)
        gulf:       '#3A6B6E',
        sky:        '#A9C5C2',
        // Dark mode
        dark:       '#0F140F',
      },
      fontFamily: {
        serif:   ['var(--font-playfair)', 'Georgia', 'serif'],
        sans:    ['var(--font-inter)', 'system-ui', 'sans-serif'],
        arabic:  ['var(--font-cairo)', 'sans-serif'],
      },
      animation: {
        'count-up':    'countUp 2s ease-out forwards',
        'float':       'float 6s ease-in-out infinite',
        'float-slow':  'floatSlow 14s ease-in-out infinite',
        'pulse-glow':  'pulseGlow 2s ease-in-out infinite',
        'slide-up':    'slideUp 0.6s ease-out forwards',
        'fade-in':     'fadeIn 0.5s ease-out forwards',
      },
      keyframes: {
        countUp:    { from: { opacity: '0', transform: 'translateY(10px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        float:      { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-12px)' } },
        floatSlow:  { '0%,100%': { transform: 'translateY(0) rotate(0deg)' }, '50%': { transform: 'translateY(15px) rotate(5deg)' } },
        pulseGlow:  { '0%,100%': { boxShadow: '0 0 20px rgba(139,155,136,0.3)' }, '50%': { boxShadow: '0 0 40px rgba(139,155,136,0.5)' } },
        slideUp:    { from: { opacity: '0', transform: 'translateY(30px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        fadeIn:     { from: { opacity: '0' }, to: { opacity: '1' } },
      },
      backgroundImage: {
        'green-gradient':  'linear-gradient(135deg, #182019 0%, #2C3A2D 100%)',
        'hero-overlay':    'linear-gradient(to bottom, rgba(24,32,25,0.55) 0%, rgba(24,32,25,0.25) 50%, rgba(24,32,25,0.7) 100%)',
      },
      boxShadow: {
        'green-sm': '0 2px 8px rgba(24,32,25,0.06)',
        'green-md': '0 6px 24px rgba(24,32,25,0.08)',
        'green-lg': '0 14px 44px rgba(24,32,25,0.12)',
        'green-xl': '0 24px 64px rgba(24,32,25,0.16)',
      },
    },
  },
  plugins: [],
};
export default config;
