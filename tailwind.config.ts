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
          champagne: "#F0C48A",
          warm: "#F7F4EF",
          copper: "#B87333",
          border: "rgba(255,255,255,0.08)",
          glow: "rgba(214,160,102,0.25)"
        }
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'gold-gradient': 'linear-gradient(135deg, #F0C48A 0%, #D6A066 50%, #B87333 100%)',
        'metallic-text': 'linear-gradient(to bottom, #F7F4EF 0%, #F0C48A 40%, #D6A066 80%, #B87333 100%)'
      },
      fontFamily: {
        sans: ['var(--font-inter)'],
        serif: ['var(--font-playfair)'],
        display: ['var(--font-oswald)'],
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
