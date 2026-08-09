"use client"

import { useState, useEffect } from "react"
import { dashboardApi, AdminDashboardSummaryDto } from "@/features/dashboard/services/dashboardApi"
import { DashboardHeader } from "./DashboardHeader"
import { DashboardMetrics } from "./DashboardMetrics"
import { ModuleGrid } from "./ModuleGrid"
import { FiAlertCircle, FiRefreshCw } from "react-icons/fi"

export default function AdminDashboardOverview() {
  const [summary, setSummary] = useState<AdminDashboardSummaryDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSummaryData()
  }, [])

  const fetchSummaryData = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await dashboardApi.getDashboardSummary()
      setSummary(data)
    } catch (err: any) {
      if (err?.status === 403) {
        setError("You do not have permission to access administrative overview.")
      } else {
        setError("Failed to load admin summary statistics. Please retry.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* 1. Institutional Dashboard Header */}
      <DashboardHeader
        title="Administrative Operations & Modules"
        subtitle="MNIT Jaipur Soft Skills Development Program Platform"
        onRefresh={fetchSummaryData}
        refreshing={loading}
      />

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <FiAlertCircle className="text-base text-amber-700 shrink-0" />
            <span className="font-semibold">{error}</span>
          </div>
          <button
            onClick={fetchSummaryData}
            className="inline-flex items-center gap-1 font-bold underline hover:text-amber-900"
          >
            <FiRefreshCw /> Retry
          </button>
        </div>
      )}

      {/* 2. Top 5 Metric Cards Horizontally */}
      <DashboardMetrics summary={summary} loading={loading} />

      {/* 3. Administrative Operations & Module Grid */}
      <ModuleGrid />
    </div>
  )
}
