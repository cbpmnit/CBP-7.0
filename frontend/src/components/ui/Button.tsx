import React from "react"
import { themeClasses } from "@/styles/theme"

export type ButtonVariant = "primary" | "outline" | "secondary" | "ghost" | "danger"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: "sm" | "md" | "lg"
  icon?: React.ReactNode
  loading?: boolean
  children?: React.ReactNode
  className?: string
}

export function Button({
  variant = "primary",
  size = "md",
  icon,
  loading = false,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs",
    md: "",
    lg: "px-6 py-4 text-sm",
  }[size]

  const variantClass = themeClasses.button[variant] || themeClasses.button.primary

  return (
    <button
      className={`${variantClass} ${sizeClasses} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
      ) : icon ? (
        <span className="shrink-0">{icon}</span>
      ) : null}
      <span>{children}</span>
    </button>
  )
}

export default Button
