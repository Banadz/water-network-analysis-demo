/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0ea5e9',
        primaryDark: '#0284c7',
        primaryLight: '#e0f2fe',
        accent: '#38bdf8',
        bgSoft: '#f8fafc'
      }
    }
  },
  plugins: [],
}