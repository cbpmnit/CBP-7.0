"use client"

import React from "react"
import { FiRefreshCw } from "react-icons/fi"

export interface DashboardHeaderProps {
  title?: string
  subtitle?: string
  onRefresh?: () => void
  refreshing?: boolean
}

export function DashboardHeader({
  title = "Admin Dashboard",
  subtitle = "Program metrics and quick management actions",
  onRefresh,
  refreshing = false,
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-3">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          {title}
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          {subtitle}
        </p>
      </div>

      {onRefresh && (
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-xs transition disabled:opacity-50 shrink-0 self-start sm:self-auto"
        >
          <FiRefreshCw className={refreshing ? "animate-spin text-cyan-700" : "text-slate-500"} />
          <span>Refresh</span>
        </button>
      )}
    </div>
  )
}

export default DashboardHeader
