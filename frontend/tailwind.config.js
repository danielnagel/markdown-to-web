/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js}'],
  theme: {
    extend: {
      colors: {
        primary: '#ffffff',
        secondary: '#111111',
        accent: '#2563eb',
      },
    },
  },
  plugins: [],
};
