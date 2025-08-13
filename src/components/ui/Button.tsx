import React from "react"
import { cn } from "@/lib/utils"

export type ButtonVariant = "primary" | "secondary" | "accent" | "ghost"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-primary-foreground hover:bg-primary/90 focus:ring-primary",
  secondary:
    "bg-secondary text-secondary-foreground hover:bg-secondary/90 focus:ring-secondary",
  accent:
    "bg-accent text-accent-foreground hover:bg-accent/90 focus:ring-accent",
  ghost: "bg-transparent hover:bg-gray-100 text-gray-900 focus:ring-gray-200",
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
          variantStyles[variant],
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export default Button
