/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './pages/**/*.{js,ts,jsx,tsx}',
  ],
  safelist: [
    {
      pattern: /bg-(blue|green|red|yellow|purple|indigo|teal|sky)-*/,
    },
    {
      pattern: /bg-conic(-\d+)?/,
    },
    {
      pattern: /from-(blue|green|red|yellow|purple|indigo|teal|sky)-*/,
    },
    {
      pattern: /to-(blue|green|red|yellow|purple|indigo|teal|sky)-*/,
    },
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-conic': 'conic-gradient(from 110deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
};
