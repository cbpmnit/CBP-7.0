"use client"

import { useState } from "react"
import { CertificateResponse } from "@/features/certificates/types"
import { certificateApi } from "@/features/certificates/services/certificateApi"
import { Modal } from "@/components/ui/Modal"
import { Button } from "@/components/ui/Button"
import { Alert } from "@/components/ui/Alert"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { FiAward, FiDownload, FiClock, FiEye } from "react-icons/fi"
import { formatDate } from "@/utils/formatters"

interface CertificateCardProps {
  certificate: CertificateResponse | null
  loading?: boolean
  error?: string | null
  studentName?: string
  studentId?: string
}

export function CertificateCard({
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
      const blob = await certificateApi.downloadCertificateBlob()
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
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <FiClock className="text-amber-600 text-base" />
            <span>Program Certificate</span>
          </h3>
          <StatusBadge status="PENDING" label="Pending" />
        </div>
        <p className="text-xs text-slate-600">Certificate not available yet.</p>
        <p className="text-[11px] text-slate-400">
          It will generate automatically once registration, fee payment, and 75% attendance are completed.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-slate-300 transition duration-200 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <FiAward className="text-purple-700 text-base" />
            <span>Digital Program Certificate</span>
          </h3>
          <StatusBadge status="ACTIVE" label="Certificate Available" />
        </div>

        <div className="space-y-1 text-xs border-t border-slate-100 pt-2.5">
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
          <Alert type="error" message={downloadError} onClose={() => setDownloadError(null)} />
        )}

        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPreviewOpen(true)}
            icon={<FiEye />}
          >
            View
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleDownload}
            disabled={downloading}
            loading={downloading}
            icon={<FiDownload />}
          >
            Download PDF
          </Button>
        </div>
      </div>

      <Modal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title="Official Certificate Preview"
        size="3xl"
        footer={
          <div className="w-full flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-500">
              Credential No: {certificate.certificateNumber}
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPreviewOpen(false)}>
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleDownload}
                disabled={downloading}
                loading={downloading}
                icon={<FiDownload />}
              >
                Download PDF
              </Button>
            </div>
          </div>
        }
      >
        <div className="p-4 bg-slate-100 flex items-center justify-center">
          <div
            className="relative w-full aspect-[1000/700] rounded-xl overflow-hidden border border-slate-300 shadow-md bg-white select-none"
            style={{
              backgroundImage: "url(/certificates/certificate-bg.svg)",
              backgroundSize: "100% 100%",
            }}
          >
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
      </Modal>
    </>
  )
}

export default CertificateCard
