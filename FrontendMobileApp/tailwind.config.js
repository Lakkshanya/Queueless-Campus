/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        primary: '#9A3412', // Burnt Orange
        buttonPrimary: '#C2410C', // Deep Ember Orange
        buttonSecondary: '#FDBA74', // Muted Copper
        buttonSecondaryText: '#7C2D12',
        background: '#1C1917', // Dark Warm Gray
        card: '#292524',
        textPrimary: '#FAFAF9',
        textSecondary: '#D6D3D1',
      },
      fontFamily: {
        serif: ['Times New Roman', 'serif'],
        sans: ['Times New Roman', 'serif'], 
      },
    },
  },
  plugins: [],
};
