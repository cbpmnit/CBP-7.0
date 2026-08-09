import React from "react"
import { themeClasses } from "@/styles/theme"

export type BadgeVariant = "success" | "warning" | "error" | "info" | "purple" | "neutral"

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
  icon?: React.ReactNode
  children: React.ReactNode
  className?: string
}

export function Badge({
  variant = "neutral",
  icon,
  children,
  className = "",
  ...props
}: BadgeProps) {
  const variantClass = themeClasses.badge[variant] || themeClasses.badge.neutral

  return (
    <span className={`${variantClass} ${className}`} {...props}>
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  )
}

export default Badge
