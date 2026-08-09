import React from "react"
import { themeClasses } from "@/styles/theme"

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "subtle" | "interactive"
  children: React.ReactNode
  className?: string
}

export function Card({
  variant = "default",
  children,
  className = "",
  ...props
}: CardProps) {
  const baseClass =
    variant === "subtle"
      ? themeClasses.cardSubtle
      : variant === "interactive"
      ? themeClasses.cardInteractive
      : themeClasses.card

  return (
    <div className={`${baseClass} p-6 ${className}`} {...props}>
      {children}
    </div>
  )
}

export default Card
