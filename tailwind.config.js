/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: This is the unified content scanning for the entire monorepo.
  // It ensures shared UI components and app-specific logic all support Tailwind classes.
  content: [
    "./apps/web/src/**/*.{js,jsx,ts,tsx}",
    "./apps/mobile/App.tsx",
    "./apps/mobile/src/**/*.{js,jsx,ts,tsx}",
    "./packages/ui/src/**/*.{js,jsx,ts,tsx}",
    "./packages/core/src/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // We extend the theme with Raven-Os standard colors while keeping standard Tailwind colors available.
        raven: {
          primary: '#8b5cf6',
          secondary: '#10b981',
          background: '#050505',
          surface: 'rgba(255, 255, 255, 0.03)',
          text: '#f8fafc',
        },
      },
      fontFamily: {
        raven: ["Inter", "System", "sans-serif"],
      },
    },
  },
  plugins: [],
};
