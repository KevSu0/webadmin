/** @type {import('tailwindcss').Config} */
import defaultTheme from "tailwindcss/defaultTheme";
import { designTokens } from "./src/lib/design-tokens";

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: "1rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        ...designTokens.colors,
      },
      fontFamily: {
        sans: [designTokens.typography.fontFamily.sans, ...defaultTheme.fontFamily.sans],
        heading: [designTokens.typography.fontFamily.heading, ...defaultTheme.fontFamily.sans],
      },
      fontSize: {
        ...designTokens.typography.fontSize,
      },
      fontWeight: {
        ...designTokens.typography.fontWeight,
      },
      spacing: {
        ...designTokens.spacing,
      },
      borderRadius: {
        ...designTokens.radii,
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
