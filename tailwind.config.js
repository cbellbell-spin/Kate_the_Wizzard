/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'bg-offwhite': '#f8f6f1',
        'text-black': '#1a1a1a',
        'accent-maroon': '#800000',
      },
      fontFamily: {
        serif: ['Spectral', 'Georgia', 'serif'],
      },
    },
  },
  plugins: [],
}
