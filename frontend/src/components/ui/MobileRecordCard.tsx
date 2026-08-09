import React from "react"
import StatusBadge, { StatusType } from "./StatusBadge"

export interface MobileRecordField {
  label: string
  value: React.ReactNode
  mono?: boolean
  highlight?: boolean
}

export interface MobileRecordCardProps {
  title: React.ReactNode
  subtitle?: React.ReactNode
  status?: StatusType
  statusLabel?: string
  fields: MobileRecordField[]
  actions?: React.ReactNode
  onClick?: () => void
  selected?: boolean
  className?: string
}

export function MobileRecordCard({
  title,
  subtitle,
  status,
  statusLabel,
  fields,
  actions,
  onClick,
  selected = false,
  className = "",
}: MobileRecordCardProps) {
  return (
    <div
      onClick={onClick}
      className={`p-3.5 bg-white border rounded-xl shadow-2xs transition-all space-y-2.5 ${
        selected
          ? "border-cyan-500 bg-cyan-50/20 ring-1 ring-cyan-500/30"
          : "border-slate-200 hover:border-slate-300"
      } ${onClick ? "cursor-pointer active:bg-slate-50" : ""} ${className}`}
    >
      {/* Top Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="font-extrabold text-xs text-slate-900 truncate">
            {title}
          </div>
          {subtitle && (
            <div className="text-[11px] font-mono text-slate-500 truncate mt-0.5">
              {subtitle}
            </div>
          )}
        </div>

        {status && (
          <StatusBadge status={status} label={statusLabel} className="shrink-0" />
        )}
      </div>

      {/* Key-Value Fields Grid */}
      <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 pt-2 border-t border-slate-100 text-xs">
        {fields.map((f, i) => (
          <div key={i} className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block truncate">
              {f.label}
            </span>
            <span
              className={`text-xs block truncate ${
                f.mono ? "font-mono" : ""
              } ${f.highlight ? "font-bold text-slate-900" : "text-slate-700"}`}
            >
              {f.value || "—"}
            </span>
          </div>
        ))}
      </div>

      {/* Row Actions Bottom Bar */}
      {actions && (
        <div
          className="pt-2 border-t border-slate-100 flex items-center justify-end gap-1.5"
          onClick={(e) => e.stopPropagation()}
        >
          {actions}
        </div>
      )}
    </div>
  )
}

export default MobileRecordCard
