/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {

      colors: {
        background: "#FFFFFF", // Canvas: Pure White
        foreground: "#4F5E7B", // Body: Slate Blue
        brand: {
          DEFAULT: "#1a2fee", // Primary Brand: Deep Electric Blue
          dark: "#101d9e", // Darker shade for hover
        },
        navy: "#0B101A", // Headings: Midnight Navy
        slate: "#4F5E7B", // Body: Slate Blue
        pale: "#F4F6F9", // Structure: Subtle Pale Blue-Grey
        border: "#E5E7EB", // Faint Grey
      },
      fontFamily: {
        sans: ['var(--font-inter-tight)', 'sans-serif'],
        inter: ['var(--font-inter)', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'monospace'],
      },
      boxShadow: {
        'deep': '0 20px 40px -10px rgba(26, 47, 238, 0.15)',
        'floating': '0 20px 50px rgba(0, 0, 0, 0.05)',
      },
      animation: {
      },
      keyframes: {
      },
    },
  },
  plugins: [],
}
