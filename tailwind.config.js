/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
      },
      colors: {
        forest: {
          50: '#f0f7f3',
          100: '#dcf0e3',
          200: '#b9e0c9',
          300: '#8acaa8',
          400: '#54ac82',
          500: '#2f8d62',
          600: '#1f7050',
          700: '#1a5a42',
          800: '#164836',
          900: '#0f3326',
          950: '#082018',
        },
        slate2: {
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',
          300: '#cbd5e1',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
        },
        accent: {
          amber: '#f59e0b',
          rust: '#c2410c',
          sky: '#0ea5e9',
          lime: '#84cc16',
        },
      },
      borderRadius: {
        xl: '0.875rem',
        '2xl': '1.25rem',
      },
      boxShadow: {
        soft: '0 1px 2px rgba(15, 51, 38, 0.04), 0 4px 16px rgba(15, 51, 38, 0.06)',
        card: '0 1px 3px rgba(15, 51, 38, 0.05), 0 8px 24px rgba(15, 51, 38, 0.06)',
        glow: '0 0 0 4px rgba(47, 141, 98, 0.15)',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-dot': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.5', transform: 'scale(0.85)' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in-right': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'glow-pulse': {
          '0%, 100%': { filter: 'drop-shadow(0 0 2px rgba(132,204,22,0.6))' },
          '50%': { filter: 'drop-shadow(0 0 6px rgba(132,204,22,0.9))' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.4s ease-out',
        'slide-up': 'slide-up 0.5s ease-out',
    'slide-in-right': 'slide-in-right 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
    'glow-pulse': 'glow-pulse 2.5s ease-in-out infinite',
        'pulse-dot': 'pulse-dot 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
      },
    },
  },
  plugins: [],
};
