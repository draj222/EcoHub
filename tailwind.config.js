/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e6f5ea',
          100: '#c3e6cc',
          200: '#9fd6ab',
          300: '#7bc689',
          400: '#5eb970',
          500: '#41ad57',
          600: '#3ba14f',
          700: '#329246',
          800: '#2a833c',
          900: '#1b672c',
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
      },
      fontFamily: {
        geist: ["var(--font-geist-sans)"],
      },
      animation: {
        "grid": "grid 15s linear infinite",
      },
      keyframes: {
        grid: {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(var(--cell-size))" },
        },
      },
    },
  },
  plugins: [],
} 