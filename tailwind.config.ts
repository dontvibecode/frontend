import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      dropShadow: {
        customShadow: '0 0 20px rgba(0, 0, 0, 0.1)',
        customShadowDark: '0 0 20px rgba(0, 0, 0, 0.08)',
        customShadowLight: '0 0 20px rgba(0, 0, 0, 0.02)'
      },
    },
  },
} satisfies Config;