export const colors = {
  primary: {
    DEFAULT: "#6366F1",
    foreground: "#FFFFFF",
  },
  secondary: {
    DEFAULT: "#EC4899",
    foreground: "#FFFFFF",
  },
  accent: {
    DEFAULT: "#F59E0B",
    foreground: "#FFFFFF",
  },
  success: "#10B981",
  error: "#EF4444",
  warning: "#FBBF24",
  info: "#3B82F6",
} as const

export const fonts = {
  sans: "Inter, system-ui, sans-serif",
  heading: "Poppins, system-ui, sans-serif",
} as const

export const radii = {
  xl: "1rem",
  xxl: "1.5rem",
} as const

export const designTokens = {
  colors,
  fonts,
  radii,
} as const

export type DesignTokens = typeof designTokens
