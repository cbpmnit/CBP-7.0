"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { FiArrowRight } from "react-icons/fi"
import { AdminDashboardSummaryDto } from "@/features/dashboard/services/dashboardApi"
import { getAccessibleModules, renderModuleIcon } from "@/config/adminModules"

interface ModuleGridProps {
  summary?: AdminDashboardSummaryDto | null
}

export function ModuleGrid({ summary }: ModuleGridProps) {
  const [userRole, setUserRole] = useState<string>("")
  const [userPermissions, setUserPermissions] = useState<string[]>([])

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUserRole((localStorage.getItem("cbp-role") || "").toUpperCase())
      try {
        const raw = localStorage.getItem("cbp-permissions")
        setUserPermissions(raw ? JSON.parse(raw) : [])
      } catch {
        setUserPermissions([])
      }
    }
  }, [])

  const modules = getAccessibleModules(userRole, userPermissions)

  if (modules.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
        Assigned Management Modules
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
        {modules.map((item) => {
          let countBadge: string | null = null

          if (item.badgeKey && summary && typeof summary[item.badgeKey] === "number") {
            const val = summary[item.badgeKey]
            countBadge = `${val.toLocaleString()} ${item.defaultStatusText}`
          } else {
            countBadge = item.defaultStatusText
          }

          return (
            <Link
              key={item.id}
              href={item.route}
              className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs hover:border-cyan-300 hover:shadow-md transition flex flex-col justify-between gap-3 group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`h-10 w-10 rounded-xl border flex items-center justify-center text-xl shrink-0 ${item.color}`}
                  >
                    {renderModuleIcon(item.iconName)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-xs font-extrabold text-slate-900 truncate group-hover:text-cyan-700 transition">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">{item.description}</p>
                  </div>
                </div>

                <FiArrowRight className="text-slate-300 group-hover:text-cyan-600 group-hover:translate-x-1 transition shrink-0 text-base" />
              </div>

              {/* Status / Metric badge footer */}
              <div className="pt-2 border-t border-slate-100/80 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-50 border border-slate-200 text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                  <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 animate-pulse" />
                  {countBadge}
                </span>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}

export default ModuleGrid
