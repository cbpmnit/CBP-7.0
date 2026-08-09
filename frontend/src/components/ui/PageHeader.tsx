import React from "react"

export interface PageHeaderAction {
  label: string
  icon?: React.ReactNode
  onClick?: () => void
  href?: string
  variant?: "primary" | "secondary" | "outline"
  disabled?: boolean
  loading?: boolean
}

export interface PageHeaderProps {
  title: string
  subtitle?: string
  count?: number | string
  countLabel?: string
  actions?: React.ReactNode
  children?: React.ReactNode
  className?: string
}

export function PageHeader({
  title,
  subtitle,
  count,
  countLabel,
  actions,
  children,
  className = "",
}: PageHeaderProps) {
  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3 ${className}`}
    >
      <div>
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            {title}
          </h1>
          {count !== undefined && (
            <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full border border-slate-200">
              {count} {countLabel || ""}
            </span>
          )}
        </div>
        {subtitle && (
          <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
        )}
      </div>

      {(actions || children) && (
        <div className="flex flex-wrap items-center gap-2 shrink-0 self-start sm:self-auto">
          {actions}
          {children}
        </div>
      )}
    </div>
  )
}

export default PageHeader
