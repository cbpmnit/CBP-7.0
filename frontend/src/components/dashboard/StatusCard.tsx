"use client"

import Link from "next/link"
import React from "react"

interface StatusCardProps {
  icon: React.ReactNode
  title: string
  subtitle?: string
  statusText: string
  statusType: "success" | "warning" | "error" | "info"
  details?: { label: string; value: string }[]
  actionText: string
  actionHref?: string
  onAction?: () => void
}

export default function StatusCard({
  icon,
  title,
  subtitle,
  statusText,
  statusType,
  details,
  actionText,
  actionHref,
  onAction,
}: StatusCardProps) {
  const badgeStyles = {
    success: "bg-emerald-50 border-emerald-200 text-emerald-800",
    warning: "bg-amber-50 border-amber-200 text-amber-800",
    error: "bg-rose-50 border-rose-200 text-rose-800",
    info: "bg-cyan-50 border-cyan-200 text-cyan-800",
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm cbp-card-interactive flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span className="text-cyan-700 text-base">{icon}</span>
            <span>{title}</span>
          </h3>
          <span className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${badgeStyles[statusType]}`}>
            {statusText}
          </span>
        </div>

        {subtitle && <p className="text-xs text-slate-600 mb-3">{subtitle}</p>}

        {details && details.length > 0 && (
          <div className="space-y-1 text-xs border-t border-slate-100 pt-2.5 mb-4">
            {details.map((d) => (
              <div key={d.label} className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">{d.label}:</span>
                <span className="font-bold text-slate-900 font-mono">{d.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {actionHref ? (
        <Link
          href={actionHref}
          className="inline-flex items-center justify-center w-full rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white py-2 text-xs font-bold uppercase tracking-wider shadow-sm transition mt-3"
        >
          {actionText}
        </Link>
      ) : (
        <button
          onClick={onAction}
          className="inline-flex items-center justify-center w-full rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white py-2 text-xs font-bold uppercase tracking-wider shadow-sm transition mt-3"
        >
          {actionText}
        </button>
      )}
    </div>
  )
}
