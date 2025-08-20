/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],

  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // you can name these whatever you like:
        primary: '#2563EB',
        secondary: '#F59E0B',
        accent: '#10B981',
        background: '#1F2937',
        surface: '#374151',
      },
    },
  },
  plugins: [],
};
