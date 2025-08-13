import React from "react"
import { cn } from "@/lib/utils"

export type BadgeVariant = "info" | "success" | "warning" | "error"

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

const variantStyles: Record<BadgeVariant, string> = {
  info: "bg-info text-white",
  success: "bg-success text-white",
  warning: "bg-warning text-white",
  error: "bg-error text-white",
}

export const Badge = ({ className, variant = "info", ...props }: BadgeProps) => {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-xl px-2 py-1 text-xs font-medium",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  )
}

export default Badge
