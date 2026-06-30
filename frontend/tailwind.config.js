/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        verdeco: {
          lightBg: '#F8F9FA',
          darkBg: '#0B0F19',
          cardLight: 'rgba(255, 255, 255, 0.8)',
          cardDark: 'rgba(21, 29, 48, 0.7)',
          primary: '#0F5132',
          primaryDark: '#E2E8F0',
          accent: '#10B981',
          danger: '#EF4444',
          info: '#3B82F6',
          warning: '#F59E0B'
        }
      }
    },
  },
  plugins: [],
}
