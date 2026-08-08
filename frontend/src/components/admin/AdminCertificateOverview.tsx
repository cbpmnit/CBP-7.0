"use client"

import { useState } from "react"
import { adminService } from "@/services/adminService"
import { FiAward, FiCheckCircle, FiAlertCircle, FiRefreshCw, FiZap } from "react-icons/fi"

export default function AdminCertificateOverview() {
  const [generating, setGenerating] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleGenerateAll = async () => {
    setGenerating(true)
    setMessage(null)
    setError(null)
    try {
      const res = await adminService.generateAllCertificates()
      setMessage(`Successfully generated certificates for all eligible students (${res?.length || 0} issued).`)
    } catch (err: any) {
      setError("Failed to trigger batch certificate generation.")
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Batch Certificate Action Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <FiAward className="text-purple-600 text-lg" /> Certificate Credential Management
          </h3>
          <p className="text-xs text-slate-600 mt-1">
            Batch issue official PDF certificates for students who satisfied the 75%+ workshop attendance threshold.
          </p>
        </div>

        <button
          onClick={handleGenerateAll}
          disabled={generating}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition shrink-0 shadow-sm"
        >
          {generating ? <FiRefreshCw className="animate-spin" /> : <FiZap />}
          <span>{generating ? "Generating..." : "Generate All Eligible"}</span>
        </button>
      </div>

      {message && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
          <FiCheckCircle className="text-emerald-600 shrink-0 text-base" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2">
          <FiAlertCircle className="text-amber-600 shrink-0 text-base" />
          <span>{error}</span>
        </div>
      )}

      {/* Operational Rules Panel */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Certificate Issuance Rules
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="font-bold text-slate-900 block">75%+ Attendance Required</span>
            <span className="text-slate-500 text-[11px] mt-0.5 block">Automated threshold check against verified attendance records.</span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="font-bold text-slate-900 block">Unique Credential ID</span>
            <span className="text-slate-500 text-[11px] mt-0.5 block">Generates tamper-proof SHA-256 verification hash per certificate.</span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="font-bold text-slate-900 block">Instant Student Access</span>
            <span className="text-slate-500 text-[11px] mt-0.5 block">Unlocked certificates are immediately accessible on student portal `/certificate`.</span>
          </div>
        </div>
      </div>
    </div>
  )
}
