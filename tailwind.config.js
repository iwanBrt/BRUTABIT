/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-bebas)', 'sans-serif'],
        mono:    ['var(--font-space-mono)', 'monospace'],
        body:    ['var(--font-dm-sans)', 'sans-serif'],
      },
      colors: {
        brand: {
          red:    '#ff3c00',
          yellow: '#ffe600',
          blue:   '#00c2ff',
          purple: '#7b2fff',
          green:  '#00e676',
          orange: '#ff9100',
          pink:   '#ff6b9d',
        },
        neo: {
          bg:     '#f2ede3',
          bgDark: '#111111',
          card:   '#ffffff',
          cardDk: '#1c1c1c',
          black:  '#0a0a0a',
          muted:  '#888888',
        },
      },
      boxShadow: {
        'neo-sm': '3px 3px 0px #0a0a0a',
        'neo':    '5px 5px 0px #0a0a0a',
        'neo-lg': '8px 8px 0px #0a0a0a',
        'neo-sm-dk': '3px 3px 0px #f0f0f0',
        'neo-dk':    '5px 5px 0px #f0f0f0',
        'neo-lg-dk': '8px 8px 0px #f0f0f0',
      },
      borderRadius: {
        'neo': '0px',
      },
      animation: {
        'fade-in':    'fadeIn 0.2s ease-out',
        'slide-up':   'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.2s ease-out',
        'bounce-neo': 'bounceNeo 0.15s ease-out',
      },
      keyframes: {
        fadeIn:    { from: { opacity: '0' }, to: { opacity: '1' } },
        slideUp:   { from: { opacity: '0', transform: 'translateY(12px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        slideDown: { from: { opacity: '0', transform: 'translateY(-8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        bounceNeo: { '0%': { transform: 'translate(0,0)' }, '50%': { transform: 'translate(2px,2px)' }, '100%': { transform: 'translate(0,0)' } },
      },
    },
  },
  plugins: [],
}
