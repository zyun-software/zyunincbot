/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],
  theme: {
    extend: {
      colors: {
        'tg-bg-color': 'var(--tg-theme-bg-color)',
        'tg-text-color': 'var(--tg-theme-text-color)',
        'tg-hint-color': 'var(--tg-theme-hint-color)',
        'tg-link-color': 'var(--tg-theme-link-color)',
        'tg-button-color': 'var(--tg-theme-button-color)',
        'tg-button-text-color': 'var(--tg-theme-button-text-color)',
        'tg-secondary-bg-color': 'var(--tg-theme-secondary-bg-color)',
      },
    },
  },
  plugins: [],
};