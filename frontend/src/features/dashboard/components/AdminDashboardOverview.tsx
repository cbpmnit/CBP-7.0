"use client"

import { useState, useEffect } from "react"
import { dashboardApi, AdminDashboardSummaryDto } from "@/features/dashboard/services/dashboardApi"
import { DashboardHeader } from "./DashboardHeader"
import { DashboardMetrics } from "./DashboardMetrics"
import { ModuleGrid } from "./ModuleGrid"
import { Alert } from "@/components/ui/Alert"

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
      <DashboardHeader
        title="Administrative Operations & Modules"
        subtitle="MNIT Jaipur Soft Skills Development Program Platform"
        onRefresh={fetchSummaryData}
        refreshing={loading}
      />

      {error && <Alert type="error" message={error} />}

      <DashboardMetrics summary={summary} loading={loading} />

      <ModuleGrid summary={summary} />
    </div>
  )
}
