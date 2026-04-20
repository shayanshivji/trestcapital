import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/types/**/*.{js,ts,tsx}",
    "./src/lib/**/*.{js,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fdf2f4",
          100: "#fce7ea",
          200: "#f9ced6",
          300: "#f4a3b3",
          400: "#ec6d87",
          500: "#C41230",
          600: "#b10f2b",
          700: "#930c24",
          800: "#7c0b20",
          900: "#4c0613",
          950: "#2a0309",
        },
        sidebar: {
          DEFAULT: "#111111",
          hover: "#1f1f1f",
          active: "#2a0309",
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "sans-serif",
        ],
      },
      keyframes: {
        "slide-in-from-right": {
          from: { transform: "translateX(100%)" },
          to: { transform: "translateX(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
      },
      animation: {
        "slide-in-right": "slide-in-from-right 200ms ease-out",
        "fade-in": "fade-in 150ms ease-out",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};

export default config;
