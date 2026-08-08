"use client"

import { useState } from "react"
import { CertificateResponse } from "@/types/certificate"
import { certificateService } from "@/services/certificateService"
import { FiAward, FiDownload, FiCheckCircle, FiClock, FiAlertCircle } from "react-icons/fi"
import { formatDate } from "@/utils/formatters"

interface CertificateCardProps {
  certificate: CertificateResponse | null
  loading?: boolean
  error?: string | null
}

export default function CertificateCard({ certificate, loading, error }: CertificateCardProps) {
  const [downloading, setDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState<string | null>(null)

  const handleDownload = async () => {
    setDownloading(true)
    setDownloadError(null)
    try {
      const blob = await certificateService.downloadCertificateBlob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `certificate_${certificate?.studentId || "CBP"}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      setDownloadError("Failed to download PDF. Please try again.")
    } finally {
      setDownloading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-5 animate-pulse shadow-sm">
        <div className="h-5 w-36 bg-slate-100 rounded mb-2" />
        <div className="h-7 w-48 bg-slate-100 rounded mb-2" />
        <div className="h-8 w-full bg-slate-100 rounded" />
      </div>
    )
  }

  if (error || !certificate) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span className="text-amber-600 text-base"><FiClock /></span>
            <span>Program Certificate</span>
          </h3>
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 border border-amber-200 text-amber-800">
            Pending
          </span>
        </div>
        <p className="text-xs text-slate-600 mb-3">
          Certificate generates automatically after registration, fee payment, and 75% attendance.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-slate-300 transition duration-200">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <span className="text-cyan-700 text-base"><FiAward /></span>
          <span>Digital Program Certificate</span>
        </h3>
        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-1">
          <FiCheckCircle /> Issued
        </span>
      </div>

      <div className="space-y-1 text-xs border-t border-slate-100 pt-2.5 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-slate-500 font-medium">Certificate No:</span>
          <span className="font-bold text-slate-900 font-mono">{certificate.certificateNumber}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-500 font-medium">Date Issued:</span>
          <span className="font-mono text-slate-700">{formatDate(certificate.generatedAt)}</span>
        </div>
      </div>

      {downloadError && (
        <p className="text-xs text-rose-600 mb-2 flex items-center gap-1">
          <FiAlertCircle /> {downloadError}
        </p>
      )}

      <button
        onClick={handleDownload}
        disabled={downloading}
        className="inline-flex items-center justify-center gap-2 w-full rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white py-2 text-xs font-bold uppercase tracking-wider shadow-sm transition disabled:opacity-50"
      >
        <FiDownload className="text-sm" />
        <span>{downloading ? "Downloading..." : "Download Official PDF"}</span>
      </button>
    </div>
  )
}
