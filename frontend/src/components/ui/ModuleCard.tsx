import React from "react"
import Link from "next/link"
import IconBox, { IconColor } from "./IconBox"
import { FiArrowRight } from "react-icons/fi"

export interface ModuleCardProps {
  title: string
  description: string
  icon: React.ReactNode
  iconColor?: IconColor
  href: string
  ctaText?: string
  badgeText?: string
  className?: string
}

export function ModuleCard({
  title,
  description,
  icon,
  iconColor = "cyan",
  href,
  ctaText = "Open Module",
  badgeText,
  className = "",
}: ModuleCardProps) {
  return (
    <div
      className={`p-6 bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between group ${className}`}
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <IconBox color={iconColor} icon={icon} size="md" />
          {badgeText && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-800 bg-cyan-50 px-2.5 py-0.5 rounded-full border border-cyan-200">
              {badgeText}
            </span>
          )}
        </div>

        <h3 className="font-extrabold text-sm text-slate-900 tracking-tight group-hover:text-cyan-700 transition-colors">
          {title}
        </h3>
        <p className="text-xs leading-relaxed text-slate-500 mt-1.5 font-normal">
          {description}
        </p>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100">
        <Link
          href={href}
          className="w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 bg-slate-50 hover:bg-cyan-50 text-slate-700 hover:text-cyan-800 border border-slate-200 hover:border-cyan-200 shadow-2xs"
        >
          <span>{ctaText}</span>
          <FiArrowRight className="text-xs transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  )
}

export default ModuleCard
