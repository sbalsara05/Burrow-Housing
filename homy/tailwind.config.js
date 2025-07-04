/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // Add prefix to all Tailwind classes
  prefix: 'tw-',
  theme: {
    extend: {
      colors: {
        'primary': '#ff6725',
        'dashboard-bg': '#f8f9fa',
      },
      fontFamily: {
        'gordita': ['Gordita', 'sans-serif'],
      }
    },
  },
  plugins: [],
  corePlugins: {
    preflight: false,
  },
}

// Usage: className="tw-bg-blue-500 tw-text-white tw-p-4"