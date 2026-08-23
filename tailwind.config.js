/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Clash Display"', 'system-ui', 'sans-serif'],
        sans: ['"General Sans"', 'system-ui', 'sans-serif'],
      },
      colors: {
        cream: '#EFE9DD',
        'cream-hi': '#F6F1E6',
        door: '#1E1F21',
        'door-soft': '#3E4044',
        terracotta: '#B85C3E',
        'terracotta-soft': '#C97A5C',
        olive: '#7A7A52',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
    },
  },
  plugins: [],
};
