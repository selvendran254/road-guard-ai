/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        roadguard: { primary: '#DC2626', dark: '#1E293B', accent: '#059669' },
      },
    },
  },
  plugins: [],
};
