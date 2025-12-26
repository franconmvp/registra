/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e8eef5',
          100: '#c5d4e6',
          200: '#9fb7d4',
          300: '#799ac2',
          400: '#5c84b5',
          500: '#3f6ea7',
          600: '#37619a',
          700: '#2d508a',
          800: '#1e3a5f', // Color principal del logo
          900: '#152a45',
        },
        secondary: {
          50: '#fdf8eb',
          100: '#f9eccc',
          200: '#f5dfaa',
          300: '#f0d188',
          400: '#ecc66f',
          500: '#d4a84b', // Color dorado del logo
          600: '#c49a3e',
          700: '#a98432',
          800: '#8e6e28',
          900: '#6a5219',
        },
        accent: {
          50: '#f0f4f8',
          100: '#d9e2ec',
          200: '#bcccdc',
          300: '#9fb3c8',
          400: '#829ab1',
          500: '#627d98',
          600: '#486581',
          700: '#334e68',
          800: '#243b53',
          900: '#102a43',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
