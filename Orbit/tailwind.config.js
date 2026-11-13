/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        orbit: {
          dark: '#0a0d14',
          card: '#121824',
          cardHover: '#182030',
          border: 'rgba(255, 255, 255, 0.08)',
          glow: '#6366f1',
          cyan: '#06b6d4',
          accent: '#8b5cf6',
          teal: '#14b8a6',
          rose: '#f43f5e',
          amber: '#f59e0b',
          emerald: '#10b981',
          text: {
            primary: '#f8fafc',
            secondary: '#94a3b8',
            muted: '#64748b',
          },
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'orbit-spin': 'spin 20s linear infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};
