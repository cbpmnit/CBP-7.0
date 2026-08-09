import React from "react"
import { themeClasses } from "@/styles/theme"

export type IconColor = "blue" | "cyan" | "emerald" | "amber" | "purple" | "rose" | "slate"

export interface IconBoxProps extends React.HTMLAttributes<HTMLDivElement> {
  color?: IconColor
  icon: React.ReactNode
  size?: "sm" | "md" | "lg"
  className?: string
}

export function IconBox({
  color = "cyan",
  icon,
  size = "md",
  className = "",
  ...props
}: IconBoxProps) {
  const colorClass = themeClasses.iconBox[color] || themeClasses.iconBox.cyan
  const sizeClass =
    size === "sm"
      ? "p-2 text-sm"
      : size === "lg"
      ? "p-3.5 text-xl"
      : "p-2.5 text-base"

  return (
    <div
      className={`inline-flex items-center justify-center shrink-0 ${colorClass} ${sizeClass} ${className}`}
      {...props}
    >
      {icon}
    </div>
  )
}

export default IconBox
