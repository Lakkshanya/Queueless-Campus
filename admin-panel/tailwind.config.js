import { colors } from './src/theme/colors';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#9A3412',
          primaryButton: '#C2410C',
          secondaryButton: '#FDBA74',
          bg: '#1C1917',
          card: '#292524',
          textPrimary: '#FAFAF9',
          textSecondary: '#D6D3D1',
        }
      }
    },
  },
  plugins: [],
}
