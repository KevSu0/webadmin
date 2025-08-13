export const colors = {
  primary: {
    DEFAULT: "#6366F1", // Indigo-500
    foreground: "#FFFFFF",
  },
  secondary: {
    DEFAULT: "#EC4899", // Pink-500
    foreground: "#FFFFFF",
  },
  accent: {
    DEFAULT: "#F59E0B", // Amber-500
    foreground: "#FFFFFF",
  },
  success: {
    DEFAULT: "#10B981", // Emerald-500
    foreground: "#FFFFFF",
  },
  error: {
    DEFAULT: "#EF4444", // Red-500
    foreground: "#FFFFFF",
  },
  warning: {
    DEFAULT: "#FBBF24", // Amber-400
    foreground: "#FFFFFF",
  },
  info: {
    DEFAULT: "#3B82F6", // Blue-500
    foreground: "#FFFFFF",
  },
  // Gamification colors
  reward: {
    DEFAULT: "#A855F7", // Purple-500
    foreground: "#FFFFFF",
  },
  highlight: {
    DEFAULT: "#FDE047", // Yellow-300
    foreground: "#4B5563", // Gray-600
  },
  // Neutral colors
  neutral: {
    50: "#F9FAFB",
    100: "#F3F4F6",
    200: "#E5E7EB",
    300: "#D1D5DB",
    400: "#9CA3AF",
    500: "#6B7280",
    600: "#4B5563",
    700: "#374151",
    800: "#1F2937",
    900: "#111827",
  },
} as const;

export const typography = {
  fontFamily: {
    sans: "Inter, system-ui, sans-serif",
    heading: "Poppins, system-ui, sans-serif",
  },
  fontSize: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.25rem",
    "5xl": "3rem",
  },
  fontWeight: {
    light: "300",
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
    extrabold: "800",
  },
} as const;

export const spacing = {
  0: "0",
  1: "0.25rem",
  2: "0.5rem",
  3: "0.75rem",
  4: "1rem",
  5: "1.25rem",
  6: "1.5rem",
  8: "2rem",
  10: "2.5rem",
  12: "3rem",
  16: "4rem",
  20: "5rem",
  24: "6rem",
  32: "8rem",
} as const;

export const radii = {
  sm: "0.25rem",
  md: "0.5rem",
  lg: "0.75rem",
  xl: "1rem",
  "2xl": "1.5rem",
  full: "9999px",
} as const;

export const designTokens = {
  colors,
  typography,
  spacing,
  radii,
} as const;

export type DesignTokens = typeof designTokens
