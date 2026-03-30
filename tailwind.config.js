/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // IMOVAI OS Design System — "Obsidian Luxury"
        obsidian: {
          bg:      '#020408',
          surface: '#070C14',
          hover:   '#0C1220',
          card:    '#080E1A',
          border:  '#0F1A2E',
          light:   '#162440',
        },
        brand: {
          accent:  '#3B82F6',
          emerald: '#10B981',
          amber:   '#F59E0B',
          rose:    '#F43F5E',
          violet:  '#8B5CF6',
          cyan:    '#06B6D4',
          gold:    '#EAB308',
        },
        text: {
          primary: '#F0F6FF',
          soft:    '#5A7090',
          dim:     '#1E2D42',
        },
      },
      fontFamily: {
        mono:  ['IBM Plex Mono', 'Courier New', 'monospace'],
        syne:  ['Syne', 'sans-serif'],
        grotesk: ['Cabinet Grotesk', 'Inter', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-up': 'fadeUp 0.2s ease',
        'glow': 'glow 2s ease-in-out infinite',
        'toast-in': 'toastIn 0.2s ease',
      },
      keyframes: {
        fadeUp: {
          'from': { opacity: '0', transform: 'translateY(10px)' },
          'to':   { opacity: '1', transform: 'translateY(0)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 4px #F43F5E40' },
          '50%':       { boxShadow: '0 0 16px #F43F5E80' },
        },
        toastIn: {
          'from': { opacity: '0', transform: 'translateX(20px)' },
          'to':   { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
};
