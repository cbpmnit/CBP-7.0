"use client"

import React, { useState } from "react"
import { FiDownload, FiRefreshCw } from "react-icons/fi"
import { downloadCsvExport } from "@/utils/csvExport"

export interface ExportCsvButtonProps {
  endpoint: string
  filenamePrefix: string
  params?: Record<string, string | number | boolean | undefined | null>
  label?: string
  className?: string
  onError?: (errMessage: string) => void
  onSuccess?: () => void
}

export function ExportCsvButton({
  endpoint,
  filenamePrefix,
  params = {},
  label = "Export CSV",
  className = "",
  onError,
  onSuccess,
}: ExportCsvButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleExport = async () => {
    if (loading) return
    setLoading(true)
    try {
      await downloadCsvExport({
        endpoint,
        filenamePrefix,
        params,
      })
      if (onSuccess) onSuccess()
    } catch (err: any) {
      const msg = err?.message || "Unable to export data. Please try again."
      if (onError) {
        onError(msg)
      } else {
        alert(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={loading}
      className={`px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all shadow-2xs inline-flex items-center gap-1.5 shrink-0 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed ${className}`}
      title="Export matching records to CSV"
    >
      {loading ? (
        <FiRefreshCw className="animate-spin text-xs text-purple-600" />
      ) : (
        <FiDownload className="text-xs text-slate-500" />
      )}
      <span className="hidden sm:inline">{loading ? "Exporting..." : label}</span>
      <span className="sm:hidden">{loading ? "..." : "CSV"}</span>
    </button>
  )
}

export default ExportCsvButton
