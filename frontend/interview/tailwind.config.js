/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        'Inter': ['Inter'],
        'Roboto': ['Roboto']
      },
      colors: {
        '!purple-600': '#5C42B1',
        '!purple-500': '#8A62ED',
        '!green-500': '#68BFC5',
        '!blue-500': '#5CB8F2',
        '!blue-600': '#3F72E1',
        '!black': '#0D1111',
        '!grey-200': '#959F9F',
        '!grey-300': '#454545',
        '!grey-400': '#333333',
        '!grey-600': '#2c2c2c',
        '!grey-800': '#1E1E1E',
        '!off-white': '#DFE9E9',
        '!red-600': '#D13433',
        '!red-800': '#A72928',
        '!green-600': '#34D133',
      },
      backgroundImage: {
        // '!gradient': "url('../public/media/images/background/gradient.png')",
        '!gradient-2': "url('../public/media/images/background/gradient-2.webp')",
        '!gradient-3': "url('../public/media/images/background/gradient-3.webp')",
        '!gradient-4': "url('../public/media/images/background/gradient-4.webp')",
        '!linear-gradient': "url('../public/media/images/background/linear-gradient.webp')",
        '!linear-gradient-sm': "url('../public/media/images/background/linear-gradient-sm.webp')",
      }
    },
  },
  plugins: [],
}

