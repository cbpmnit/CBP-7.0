"use client"

import React from "react"

export interface SpinnerProps {
  size?: "sm" | "md" | "lg"
  color?: "cyan" | "white" | "dark"
  className?: string
}

export function Spinner({ size = "md", color = "cyan", className = "" }: SpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-6 w-6 border-2",
    lg: "h-10 w-10 border-3",
  }[size]

  const colorClasses = {
    cyan: "border-cyan-600 border-t-transparent",
    white: "border-white border-t-transparent",
    dark: "border-slate-800 border-t-transparent",
  }[color]

  return (
    <div
      className={`animate-spin rounded-full shrink-0 ${sizeClasses} ${colorClasses} ${className}`}
      role="status"
      aria-label="loading"
    />
  )
}

export default Spinner
