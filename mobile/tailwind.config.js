/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        saffron: {
          50: '#FFF8F0',
          100: '#FFEDD5',
          200: '#FFD4A3',
          300: '#FFB366',
          400: '#FF9933',
          500: '#FF8C00',
          600: '#E67E00',
          700: '#CC7000',
          800: '#B36200',
          900: '#994F00',
        },
        maroon: {
          500: '#800020',
          600: '#6B001B',
        },
        cream: '#FFFDF7',
      },
    },
  },
  plugins: [],
};
