"use client"

import { useState } from "react"
import { CertificateResponse } from "@/types/certificate"
import { certificateService } from "@/services/certificateService"
import { FiAward, FiDownload, FiCheckCircle, FiClock, FiAlertCircle, FiEye, FiX } from "react-icons/fi"
import { formatDate } from "@/utils/formatters"

interface CertificateCardProps {
  certificate: CertificateResponse | null
  loading?: boolean
  error?: string | null
  studentName?: string
  studentId?: string
}

export default function CertificateCard({
  certificate,
  loading,
  error,
  studentName = "Parv Agrawal",
  studentId = "2024UCH1198",
}: CertificateCardProps) {
  const [downloading, setDownloading] = useState(false)
  const [downloadError, setDownloadError] = useState<string | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)

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
    } catch {
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
        <p className="text-xs text-slate-600 mb-1">
          Certificate not available yet.
        </p>
        <p className="text-[11px] text-slate-400">
          It will generate automatically once registration, fee payment, and 75% attendance are completed.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-slate-300 transition duration-200">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span className="text-purple-700 text-base"><FiAward /></span>
            <span>Digital Program Certificate</span>
          </h3>
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-1">
            <FiCheckCircle /> Certificate Available
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

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 w-full rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 py-2 text-xs font-bold uppercase tracking-wider transition cursor-pointer"
          >
            <FiEye className="text-sm" />
            <span>View</span>
          </button>

          <button
            type="button"
            onClick={handleDownload}
            disabled={downloading}
            className="inline-flex items-center justify-center gap-1.5 w-full rounded-xl bg-purple-600 hover:bg-purple-700 text-white py-2 text-xs font-bold uppercase tracking-wider shadow-sm transition disabled:opacity-50 cursor-pointer"
          >
            <FiDownload className="text-sm" />
            <span>{downloading ? "Downloading..." : "Download PDF"}</span>
          </button>
        </div>
      </div>

      {/* View Certificate HD Modal */}
      {previewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h4 className="text-xs font-extrabold uppercase text-slate-900 flex items-center gap-1.5">
                <FiAward className="text-purple-700" /> Official Certificate Preview
              </h4>
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <FiX className="text-base" />
              </button>
            </div>

            <div className="p-6 bg-slate-100 flex items-center justify-center">
              <div
                className="relative w-full aspect-[1000/700] rounded-xl overflow-hidden border border-slate-300 shadow-md bg-white select-none"
                style={{
                  backgroundImage: "url(/certificates/certificate-bg.svg)",
                  backgroundSize: "100% 100%",
                }}
              >
                {/* Student Name */}
                <div
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "47%",
                    transform: "translate(-50%, -50%)",
                    fontFamily: "'Great Vibes', cursive, 'Times New Roman'",
                    fontSize: "clamp(18px, 4vw, 42px)",
                    fontWeight: "bold",
                    color: "#1e293b",
                    whiteSpace: "nowrap",
                  }}
                >
                  {studentName}
                </div>

                {/* Student ID */}
                <div
                  style={{
                    position: "absolute",
                    left: "50%",
                    top: "55%",
                    transform: "translate(-50%, -50%)",
                    fontFamily: "'Inter', sans-serif",
                    fontSize: "clamp(10px, 1.6vw, 16px)",
                    fontWeight: "normal",
                    color: "#64748b",
                    whiteSpace: "nowrap",
                  }}
                >
                  Student ID: {studentId}
                </div>
              </div>
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-500">
                Credential No: {certificate.certificateNumber}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPreviewOpen(false)}
                  className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold uppercase cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={downloading}
                  className="px-4 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold uppercase cursor-pointer flex items-center gap-1"
                >
                  <FiDownload className="text-xs" /> Download PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
