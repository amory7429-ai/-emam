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
        quran: {
          bg: '#0B0F0D',
          surface: 'rgba(255,255,255,0.045)',
          glass: 'rgba(255,255,255,0.05)',
          'glass-border': 'rgba(255,255,255,0.09)',
          emerald: '#17352A',
          'emerald-light': '#1E4A39',
          gold: '#C6A15B',
          'gold-muted': '#A88B4A',
          ivory: '#F4EFE5',
          'ivory-muted': '#9AA39D',
          olive: '#6B7280',
        },
      },
      fontFamily: {
        amiri: ['var(--font-amiri)', 'serif'],
        qalam: ['var(--font-qalam)', 'sans-serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      backdropBlur: {
        glass: '12px',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
};
