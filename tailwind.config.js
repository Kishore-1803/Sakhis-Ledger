/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fef3e2',
          100: '#fde4b9',
          200: '#fcd58c',
          300: '#fbc55f',
          400: '#fab83d',
          500: '#f9ab1c',
          600: '#f59d18',
          700: '#ef8a13',
          800: '#e97810',
          900: '#df580a',
        },
        sakhi: {
          rose: '#E84C6F',
          coral: '#FF6B6B',
          gold: '#F9AB1C',
          green: '#2ECC71',
          teal: '#1ABC9C',
          blue: '#3498DB',
          purple: '#9B59B6',
          dark: '#1A1A2E',
          darker: '#16213E',
          card: '#0F3460',
        },
      },
      fontFamily: {
        sans: ['Inter', 'System'],
      },
    },
  },
  plugins: [],
};
