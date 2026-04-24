/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#665AD8',
          // Optional: You can add shades later if needed
          // light: '#857be0', 
          // dark: '#4e44c2',
        },
      },
    },
  },
  plugins: [],
};