import React from "react"
import { themeClasses } from "@/styles/theme"

export type ButtonVariant = "primary" | "outline" | "secondary" | "ghost" | "danger"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  icon?: React.ReactNode
  loading?: boolean
  children: React.ReactNode
  className?: string
}

export function Button({
  variant = "primary",
  icon,
  loading = false,
  children,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const variantClass = themeClasses.button[variant] || themeClasses.button.primary

  return (
    <button
      className={`${variantClass} ${className}`}
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
