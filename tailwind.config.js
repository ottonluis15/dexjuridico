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
        dex: {
          cream: '#F9ECE2',
          peach: '#F0CBAE',
          beige: '#EAE0DA',
          navy: {
            DEFAULT: '#0F2733',
            950: '#0F2733',
            900: '#162B37',
            850: '#1B3442',
            800: '#214154',
          },
          teal: {
            DEFAULT: '#4A808E',
            bg: '#4A808E',
            sidebar: '#5A97A5',
            light: '#6BA7B5',
            dark: '#3A6874',
          },
          coral: {
            DEFAULT: '#F4665C',
            hover: '#E2554B',
            light: '#FAA099',
          },
          slate: {
            dark: '#35474B',
            darkHover: '#2A393C',
          },
          terracotta: {
            DEFAULT: '#C48A5C',
            hover: '#AD774C',
          },
          input: '#DCE5E4',
          support: '#8F8A87',
          placeholder: '#D9D9D9',
          border: '#D8C3B5',
          kpi: {
            peach: '#F9D9C3',
            peachText: '#C48A5C',
            mint: '#CBEBD8',
            mintText: '#2B8255',
            purple: '#E0D7F5',
            purpleText: '#6B46C1',
            cream: '#FDF0CD',
            creamText: '#B7791F',
          },
          chart: {
            receitas: '#48BB78',
            despesas: '#F56565',
          }
        },
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae0fd',
          300: '#7cc5fb',
          400: '#38a5f6',
          500: '#4A808E',
          600: '#3A6874',
          700: '#162B37',
          800: '#0F2733',
          900: '#091A23',
          950: '#051117',
        },
      },
      fontFamily: {
        serif: ['Lora', 'Georgia', 'Cambria', 'serif'],
        display: ['"DM Serif Display"', 'Lora', 'Georgia', 'serif'],
        sans: ['Lora', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      }
    },
  },
  plugins: [],
}
