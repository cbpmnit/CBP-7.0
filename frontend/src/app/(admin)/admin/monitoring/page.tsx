"use client"

import { useState, useEffect } from "react"
import { apiClient, ApiError } from "@/lib/apiClient"
import { DashboardHeader } from "@/features/dashboard/components/DashboardHeader"
import { DataTable } from "@/components/ui/DataTable"
import {
  FiAlertCircle,
  FiActivity,
  FiCpu,
  FiSearch,
  FiDownload,
  FiRefreshCw
} from "react-icons/fi"

interface HealthResponse {
  status: string
}

interface InfoResponse {
  app?: {
    name?: string
    version?: string
    environment?: string
  }
}

interface MetricsResponse {
  names: string[]
}

interface MetricDetail {
  name: string
  value: number | string
  unit: string
  collectedAt: string
}

export default function SystemMonitoringPage() {
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [info, setInfo] = useState<InfoResponse | null>(null)
  
  // Metrics browser list
  const [metricsList, setMetricsList] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [currentPage, setCurrentPage] = useState<number>(1)
  const pageSize = 20

  // Fetched values for each metric
  const [detailsMap, setDetailsMap] = useState<Record<string, MetricDetail>>({})
  const [detailsLoading, setDetailsLoading] = useState<Record<string, boolean>>({})

  // General States
  const [loading, setLoading] = useState(true)
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [metricsError, setMetricsError] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)

  const fetchMonitoringData = async () => {
    setLoading(true)
    setGeneralError(null)
    setMetricsError(null)
    setHealth(null)
    setInfo(null)
    setMetricsList([])
    setDetailsMap({})
    setDetailsLoading({})
    setCurrentPage(1)

    try {
      // 1. Fetch health
      const healthData = await apiClient.get<HealthResponse>("/actuator/health")
      setHealth(healthData)

      // 2. Fetch app build info
      try {
        const infoData = await apiClient.get<InfoResponse>("/actuator/info")
        setInfo(infoData)
      } catch (err: any) {
        if (err instanceof ApiError && err.status === 403) {
          throw err // Bubble up role-based access denial
        }
        console.error("Info endpoint failed:", err)
      }

      // 3. Fetch metrics list
      try {
        const metricsData = await apiClient.get<MetricsResponse>("/actuator/metrics")
        setMetricsList(metricsData.names || [])
      } catch (err: any) {
        if (err instanceof ApiError) {
          if (err.status === 401) {
            setMetricsError("Authentication required")
          } else if (err.status === 403) {
            setMetricsError("Admin permission required")
          } else if (err.status === 404) {
            setMetricsError("Metrics endpoint unavailable")
          } else if (err.status >= 500) {
            setMetricsError("Backend monitoring unavailable")
          } else {
            setMetricsError(err.message || "Failed to load system metrics.")
          }
        } else {
          setMetricsError("Backend monitoring unavailable")
        }
      }
    } catch (err: any) {
      console.error("Monitoring fetch failed:", err)
      if (err instanceof ApiError) {
        if (err.status === 401) {
          setGeneralError("Authentication expired")
        } else if (err.status === 403) {
          setGeneralError("Admin permission required")
        } else if (err.status === 404) {
          setGeneralError("Metric unavailable")
        } else if (err.status >= 500) {
          setGeneralError("Backend monitoring unavailable")
        } else {
          setGeneralError(err.message || "Failed to contact system monitoring endpoints.")
        }
      } else {
        setGeneralError("Backend monitoring unavailable")
      }
    } finally {
      setLoading(false)
    }
  }

  // Client-Side Search filtering
  const filteredMetrics = metricsList.filter((m) =>
    m.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const totalPages = Math.ceil(filteredMetrics.length / pageSize)
  const paginatedMetrics = filteredMetrics.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  )

  // Fetch metric details concurrently for the visible page batch
  const fetchDetailsForBatch = async (batch: string[]) => {
    const loadingStates: Record<string, boolean> = {}
    batch.forEach((name) => {
      loadingStates[name] = true
    })
    setDetailsLoading((prev) => ({ ...prev, ...loadingStates }))

    const requestTime = new Date().toISOString()

    await Promise.all(
      batch.map(async (name) => {
        try {
          const detail = await apiClient.get<any>(`/actuator/metrics/${name}`)
          const measurementValue = detail.measurements?.[0]?.value ?? "N/A"
          const unit = (detail.baseUnit || "COUNT").toUpperCase()

          setDetailsMap((prev) => ({
            ...prev,
            [name]: {
              name,
              value: measurementValue,
              unit,
              collectedAt: requestTime
            }
          }))
        } catch (err: any) {
          console.error(`Failed to fetch detail for metric ${name}`, err)
          setDetailsMap((prev) => ({
            ...prev,
            [name]: {
              name,
              value: "N/A",
              unit: "N/A",
              collectedAt: requestTime
            }
          }))
        } finally {
          setDetailsLoading((prev) => ({
            ...prev,
            [name]: false
          }))
        }
      })
    )
  }

  useEffect(() => {
    fetchMonitoringData()
  }, [])

  // Refetch details when active page, search query or metric list updates
  useEffect(() => {
    if (paginatedMetrics.length > 0) {
      fetchDetailsForBatch(paginatedMetrics)
    }
  }, [currentPage, searchTerm, metricsList])

  const handleSearchChange = (val: string) => {
    setSearchTerm(val)
    setCurrentPage(1)
  }

  // Formatting helpers for metric values
  const formatMetricValue = (value: number | string, unit: string) => {
    if (typeof value === "string") return value
    if (typeof value !== "number") return "N/A"
    
    const upperUnit = unit.toUpperCase()
    if (upperUnit === "BYTES") {
      if (value >= 1024 * 1024 * 1024) {
        return `${(value / (1024 * 1024 * 1024)).toFixed(2)} GB`
      }
      if (value >= 1024 * 1024) {
        return `${(value / (1024 * 1024)).toFixed(2)} MB`
      }
      if (value >= 1024) {
        return `${(value / 1024).toFixed(2)} KB`
      }
      return `${value} B`
    }
    
    if (upperUnit === "SECONDS") {
      if (value >= 60) {
        return `${(value / 60).toFixed(2)} min`
      }
      return `${value.toFixed(3)} s`
    }

    if (value > 0 && value < 1 && (upperUnit === "N/A" || upperUnit === "COUNT")) {
      // Often represents CPU ratio load (0.35 -> 35%)
      return `${(value * 100).toFixed(1)} %`
    }

    return value.toLocaleString(undefined, { maximumFractionDigits: 3 })
  }

  const formatCollectionTime = (isoString?: string) => {
    if (!isoString) return "-"
    try {
      const date = new Date(isoString)
      const hrs = String(date.getHours()).padStart(2, "0")
      const mins = String(date.getMinutes()).padStart(2, "0")
      const secs = String(date.getSeconds()).padStart(2, "0")
      return `${hrs}:${mins}:${secs}`
    } catch (e) {
      return "-"
    }
  }

  // Fetch metric details concurrently for export (complete filtered set)
  const fetchAllDetailsForExport = async (targets: string[]): Promise<MetricDetail[]> => {
    const requestTime = new Date().toISOString()
    return await Promise.all(
      targets.map(async (name) => {
        try {
          const detail = await apiClient.get<any>(`/actuator/metrics/${name}`)
          const val = detail.measurements?.[0]?.value ?? "N/A"
          const unit = (detail.baseUnit || "COUNT").toUpperCase()
          return {
            name,
            value: val,
            unit,
            collectedAt: requestTime
          }
        } catch (err) {
          console.error(`Failed to fetch metric ${name} for export`, err)
          return {
            name,
            value: "N/A",
            unit: "N/A",
            collectedAt: requestTime
          }
        }
      })
    )
  }

  const exportToCSV = async () => {
    if (exporting) return
    setExporting(true)
    try {
      const targets = metricsList.filter((m) =>
        m.toLowerCase().includes(searchTerm.toLowerCase())
      )
      const data = await fetchAllDetailsForExport(targets)

      const headers = "metric_name,value,unit,collected_at\n"
      const rows = data
        .map((d) => `"${d.name}",${d.value},"${d.unit}","${d.collectedAt}"`)
        .join("\n")

      const blob = new Blob([headers + rows], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", `metrics-export.csv`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      console.error("CSV export failed", err)
      alert("Failed to export metrics CSV")
    } finally {
      setExporting(false)
    }
  }

  const exportToJSON = async () => {
    if (exporting) return
    setExporting(true)
    try {
      const targets = metricsList.filter((m) =>
        m.toLowerCase().includes(searchTerm.toLowerCase())
      )
      const data = await fetchAllDetailsForExport(targets)

      const exportData = data.map((d) => ({
        metric_name: d.name,
        value: d.value,
        unit: d.unit,
        collected_at: d.collectedAt,
      }))

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", `metrics-export.json`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      console.error("JSON export failed", err)
      alert("Failed to export metrics JSON")
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="space-y-6">
      <DashboardHeader
        title="System Health & Monitoring"
        subtitle="Live Spring Boot Actuator status and container diagnostics"
        onRefresh={fetchMonitoringData}
        refreshing={loading}
      />

      {generalError ? (
        <div className="p-5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 flex flex-col gap-3 max-w-xl mx-auto shadow-2xs mt-8">
          <div className="flex items-start gap-3">
            <FiAlertCircle className="text-xl text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-rose-900">Connection Failure</h3>
              <p className="text-xs text-rose-800 mt-1">{generalError}</p>
            </div>
          </div>
          <button
            onClick={fetchMonitoringData}
            className="self-end px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition inline-flex items-center gap-1.5 cursor-pointer"
          >
            <FiRefreshCw className="text-[10px]" /> Retry Connection
          </button>
        </div>
      ) : loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-600 border-t-transparent" />
          <span className="text-xs text-slate-500 font-medium tracking-wide">Polling system status...</span>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top KPI Metrics Row: Info & Health Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Health Status Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <FiActivity className="text-cyan-600 text-lg" />
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800">
                    Application Health
                  </h3>
                </div>
                <p className="text-[11px] text-slate-500 font-medium">
                  Service Host: <strong className="text-slate-700 font-bold">api.cbpmnit.in</strong>
                </p>
              </div>

              {health?.status === "UP" ? (
                <div className="px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-250 text-emerald-800 text-[10px] font-bold tracking-wider inline-flex items-center gap-1.5 shadow-3xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>UP</span>
                </div>
              ) : (
                <div className="px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-250 text-rose-800 text-[10px] font-bold tracking-wider inline-flex items-center gap-1.5 shadow-3xs">
                  <span className="h-1.5 w-1.5 rounded-full bg-rose-550" />
                  <span>DOWN</span>
                </div>
              )}
            </div>

            {/* Application Info Card */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-wrap gap-4 items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-cyan-50 border border-cyan-155 text-cyan-700 rounded-xl">
                  <FiCpu className="text-lg" />
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-slate-850 leading-tight">
                    {info?.app?.name || "CBP 7.0 Backend"}
                  </h3>
                  <p className="text-[10px] text-slate-450 font-mono mt-0.5">
                    Build: {info?.app?.version || "0.0.1-SNAPSHOT"}
                  </p>
                </div>
              </div>

              <div className="px-2.5 py-1 bg-slate-100 rounded-lg text-slate-650 text-[9px] font-mono font-bold uppercase tracking-wider">
                env: {info?.app?.environment || "production"}
              </div>
            </div>
          </div>

          {/* Central Section: Metrics Browser Card (Unified DataTable styling) */}
          {metricsError ? (
            <div className="py-12 flex flex-col items-center justify-center text-center">
              <div className="max-w-md p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-950 flex flex-col items-center gap-2 shadow-3xs">
                <FiAlertCircle className="text-xl text-amber-600" />
                <h3 className="font-bold text-xs uppercase tracking-wider">Metrics Disabled</h3>
                <p className="text-[11px] text-amber-800 leading-relaxed mt-0.5">{metricsError}</p>
              </div>
            </div>
          ) : metricsList.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs bg-white border border-slate-200 rounded-xl shadow-xs">
              No metrics available in this environment.
            </div>
          ) : (
            <DataTable
              title="Application Metrics"
              totalCount={filteredMetrics.length}
              currentPage={currentPage - 1}
              totalPages={totalPages}
              pageSize={pageSize}
              onPageChange={(p) => setCurrentPage(p + 1)}
              emptyMessage="No metrics match your search query"
              emptySubtext="Adjust your filter or try a different term."
              headerActions={
                <div className="flex items-center gap-2">
                  {/* Search Input */}
                  <div className="relative w-40 sm:w-60">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[11px]" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => handleSearchChange(e.target.value)}
                      placeholder="Search metrics..."
                      className="w-full pl-8 pr-3 py-1 bg-white text-xs rounded-lg border border-slate-250 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition shadow-3xs"
                    />
                  </div>
                  {/* Export CSV & JSON */}
                  {paginatedMetrics.length > 0 && (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={exportToCSV}
                        disabled={exporting}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-[10px] font-bold transition-all shadow-3xs inline-flex items-center gap-1 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {exporting ? (
                          <FiRefreshCw className="animate-spin text-[10px] text-cyan-600" />
                        ) : (
                          <FiDownload className="text-[10px] text-slate-400" />
                        )}
                        <span>CSV</span>
                      </button>
                      <button
                        type="button"
                        onClick={exportToJSON}
                        disabled={exporting}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-[10px] font-bold transition-all shadow-3xs inline-flex items-center gap-1 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {exporting ? (
                          <FiRefreshCw className="animate-spin text-[10px] text-cyan-600" />
                        ) : (
                          <FiDownload className="text-[10px] text-slate-400" />
                        )}
                        <span>JSON</span>
                      </button>
                    </div>
                  )}
                </div>
              }
            >
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 bg-slate-50/95 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 border-b border-slate-200 z-10 backdrop-blur-2xs">
                  <tr>
                    <th className="px-4 py-2.5">Metric Name</th>
                    <th className="px-4 py-2.5">Value</th>
                    <th className="px-4 py-2.5">Unit</th>
                    <th className="px-4 py-2.5">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800 bg-white">
                  {paginatedMetrics.map((name) => {
                    const isLoading = detailsLoading[name]
                    const detail = detailsMap[name]

                    return (
                      <tr
                        key={name}
                        className="hover:bg-cyan-50/20 transition font-mono text-slate-800"
                      >
                        <td className="px-4 py-2.5 break-all select-all font-semibold text-slate-900">{name}</td>
                        <td className="px-4 py-2.5 font-extrabold text-slate-950">
                          {isLoading ? (
                            <div className="h-4 w-12 bg-slate-100 rounded-sm animate-pulse" />
                          ) : detail ? (
                            formatMetricValue(detail.value, detail.unit)
                          ) : (
                            "—"
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-slate-400 text-[10px] font-mono font-bold uppercase tracking-wider">
                          {isLoading ? "—" : detail?.unit || "—"}
                        </td>
                        <td className="px-4 py-2.5 text-slate-400 text-[11px]">
                          {isLoading ? "—" : formatCollectionTime(detail?.collectedAt)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </DataTable>
          )}
        </div>
      )}
    </div>
  )
}
