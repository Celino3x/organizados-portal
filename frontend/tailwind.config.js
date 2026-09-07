/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e8eeff',
          100: '#d1ddff',
          200: '#a3bbff',
          300: '#7599ff',
          400: '#4777ff',
          500: '#1a3c6e',
          600: '#153058',
          700: '#102442',
          800: '#0a182c',
          900: '#050c16',
        },
        background: {
          light: '#f1f5f9',
          dark: '#0f172a',
        },
        card: {
          light: '#ffffff',
          dark: '#1e293b',
        },
        border: {
          light: '#e6ecf5',
          dark: '#334155',
        }
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '20px',
      },
      boxShadow: {
        'card': '0 20px 60px rgba(15, 23, 42, 0.1)',
      }
    },
  },
  plugins: [],
}