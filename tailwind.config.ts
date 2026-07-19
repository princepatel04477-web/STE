import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        expo: {
          midnight: "#050505",
          black: "#0B0B0B",
          gold: "#D6A066",
          champagne: "#E5A96A",
          warm: "#F7F4EF",
          copper: "#B87333",
          border: "rgba(255,255,255,0.08)",
          glow: "rgba(184,115,51,0.25)"
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gold-gradient': 'linear-gradient(135deg, #E5A96A 0%, #D6A066 50%, #B87333 100%)',
        'metallic-text': 'linear-gradient(to bottom, #F7F4EF 0%, #E5A96A 40%, #D6A066 80%, #B87333 100%)'
      },
      fontSize: {
        'hero-mobile': 'clamp(30px, 8vw, 48px)',
        'h2-mobile': 'clamp(24px, 6vw, 36px)',
        'h3-mobile': 'clamp(18px, 4.5vw, 24px)',
      },
      fontFamily: {
        sans: ['var(--font-inter)'],
        serif: ['var(--font-playfair)'],
        display: ['var(--font-inter)'],
        cormorant: ['var(--font-playfair)', 'serif'],
      },
      transitionTimingFunction: {
        'luxury': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        }
      }
    },
  },
  plugins: [],
};
export default config;
