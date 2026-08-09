"use client"

import React from "react"
import { FiRefreshCw, FiGrid } from "react-icons/fi"

export interface DashboardHeaderProps {
  title?: string
  subtitle?: string
  onRefresh?: () => void
  refreshing?: boolean
}

export function DashboardHeader({
  title = "Administrative Operations & Modules",
  subtitle = "MNIT Jaipur Soft Skills Development Program Platform",
  onRefresh,
  refreshing = false,
}: DashboardHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-100 gap-3">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-800 bg-cyan-50 px-2.5 py-0.5 rounded-md border border-cyan-200 inline-flex items-center gap-1">
            <FiGrid className="text-cyan-700" /> CBP 7.0 Admin Panel
          </span>
          <span className="text-[10px] font-mono font-bold text-slate-400">MNIT Jaipur</span>
        </div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight mt-1">
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
          <span>Refresh Overview</span>
        </button>
      )}
    </div>
  )
}

export default DashboardHeader
