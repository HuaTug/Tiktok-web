/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  corePlugins: {
    preflight: false
  },
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FE2C55', // TikTok Red
          50: '#FFF1F3',
          100: '#FFE0E6',
          200: '#FFC7D1',
          300: '#FF9EAF',
          400: '#FF6584',
          500: '#FE2C55',
          600: '#ED1443',
          700: '#C60938',
          800: '#A50A35',
          900: '#8C0D33',
        },
        accent: {
          DEFAULT: '#FACC15', // Yellow accent
        },
        bg: {
          base: 'var(--bg-base)',
          surface: 'var(--bg-surface)',
          'dark-base': '#0f1015',
          'dark-surface': '#161823',
        },
        text: {
          main: 'var(--text-main)',
          muted: 'var(--text-muted)',
        },
        border: {
          DEFAULT: 'var(--border-color)',
        }
      },
      fontFamily: {
        sans: ['PingFang SC', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 20px -5px rgba(254, 44, 85, 0.3)',
      }
    },
  },
  plugins: [],
}
