import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Game color palette
        'game-dark': '#1a1a2e',
        'game-dark-alt': '#16213e',
        'game-dark-light': '#393e46',
        'game-teal': '#4ecca3',
        'game-teal-dark': '#38b58a',
        'game-red': '#e94560',
        'game-red-dark': '#c73e54',
        'game-cyan': '#a8dadc',
        'game-bomb': '#2d2d2d',
        'game-gold': '#ffd700',
        'game-pineapple': '#f4a020',
      },
      animation: {
        'gradient-bg': 'gradientBG 15s ease infinite',
        'blob-move': 'blobMove 20s infinite alternate',
        'slither': 'slither 30s linear infinite',
        'shake': 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both',
        'float-score': 'floatingScore 0.8s ease-out forwards',
        'pulse-bomb': 'pulseBomb 0.15s ease-in-out infinite',
      },
      keyframes: {
        gradientBG: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        blobMove: {
          '0%': { transform: 'translate(0, 0) scale(1)' },
          '33%': { transform: 'translate(100px, 50px) scale(1.1)' },
          '66%': { transform: 'translate(-50px, 100px) scale(0.9)' },
          '100%': { transform: 'translate(0, 0) scale(1)' },
        },
        slither: {
          '0%': { transform: 'translateX(0) translateY(0) rotate(5deg)' },
          '25%': { transform: 'translateX(calc(100vw + 600px)) translateY(100px) rotate(-5deg)' },
          '50%': { transform: 'translateX(calc(200vw + 1200px)) translateY(0) rotate(5deg)' },
          '51%': { transform: 'translateX(-400px) translateY(0)' },
          '100%': { transform: 'translateX(0) translateY(0) rotate(5deg)' },
        },
        shake: {
          '10%, 90%': { transform: 'translateX(-1px)' },
          '20%, 80%': { transform: 'translateX(2px)' },
          '30%, 50%, 70%': { transform: 'translateX(-4px)' },
          '40%, 60%': { transform: 'translateX(4px)' },
        },
        floatingScore: {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(-60px)', opacity: '0' },
        },
        pulseBomb: {
          '0%, 100%': { boxShadow: '0 0 12px #ff0000' },
          '50%': { boxShadow: '0 0 18px #ff0000' },
        },
      },
      fontFamily: {
        sans: ['Segoe UI', 'Tahoma', 'Geneva', 'Verdana', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
