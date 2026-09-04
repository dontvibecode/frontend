import type { Config } from "tailwindcss";

// Not loaded: Tailwind v4 only reads this file via a @config directive, which
// globals.css deliberately does not use. The colours below are defined again in
// the @theme block there, and dark mode is set by @custom-variant. Editing this
// file has no effect; change globals.css instead.
export default {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Theme-aware colors that automatically switch with dark mode
        'primary-text': 'var(--primary-text)',
        'secondary-text': 'var(--secondary-text)',
        'base-5': 'var(--base-5)',
        'base-10': 'var(--base-10)',
        'base-15': 'var(--base-15)',
        'base-20': 'var(--base-20)',
        'base-25': 'var(--base-25)',
        'base-30': 'var(--base-30)',
        'base-35': 'var(--base-35)',
        'base-40': 'var(--base-40)',
        'text-5': 'var(--text-5)',
        'text-10': 'var(--text-10)',
        'text-15': 'var(--text-15)',
        'text-20': 'var(--text-20)',
        'text-25': 'var(--text-25)',
        'text-30': 'var(--text-30)',
        'text-35': 'var(--text-35)',
        'text-40': 'var(--text-40)',
        'background': 'var(--background)',
        'foreground': 'var(--foreground)',
        'opaque-button': 'var(--opaque-button)',
        'opaque-button-hover': 'var(--opaque-button-hover)',
      },
      dropShadow: {
        customShadow: '0 0 20px rgba(0, 0, 0, 0.1)',
        customShadowDark: '0 0 20px rgba(0, 0, 0, 0.08)',
        customShadowLight: '0 0 20px rgba(0, 0, 0, 0.02)'
      },
    },
  },
} satisfies Config;