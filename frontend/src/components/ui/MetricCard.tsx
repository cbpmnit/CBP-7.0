import React from "react"
import Link from "next/link"
import IconBox, { IconColor } from "./IconBox"
import { FiArrowRight } from "react-icons/fi"

export interface MetricCardProps {
  title: string
  value: string | number
  description?: string
  icon: React.ReactNode
  iconColor?: IconColor
  href?: string
  onClick?: () => void
  className?: string
}

export function MetricCard({
  title,
  value,
  description,
  icon,
  iconColor = "cyan",
  href,
  onClick,
  className = "",
}: MetricCardProps) {
  const content = (
    <div className={`p-5 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:border-slate-300 transition-all group flex flex-col justify-between ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-500 group-hover:text-slate-900 transition-colors">
          {title}
        </span>
        <IconBox color={iconColor} icon={icon} size="sm" />
      </div>

      <div>
        <div className="flex items-baseline justify-between">
          <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
            {value}
          </span>
          {href && (
            <span className="text-[10px] font-bold text-slate-400 group-hover:text-cyan-600 flex items-center gap-0.5 transition-colors">
              View <FiArrowRight className="text-[9px]" />
            </span>
          )}
        </div>
        {description && (
          <p className="text-[11px] font-medium text-slate-500 mt-1 truncate">
            {description}
          </p>
        )}
      </div>
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="block cursor-pointer">
        {content}
      </Link>
    )
  }

  if (onClick) {
    return (
      <button onClick={onClick} className="w-full text-left cursor-pointer">
        {content}
      </button>
    )
  }

  return content
}

export default MetricCard
