"use client"

import { useState } from "react"
import { certificateApi } from "@/features/certificates/services/certificateApi"
import { PageHeader } from "@/components/ui/PageHeader"
import { DataTable } from "@/components/ui/DataTable"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { MobileRecordCard } from "@/components/ui/MobileRecordCard"
import { FiCheckCircle, FiAlertCircle, FiRefreshCw, FiZap, FiAward } from "react-icons/fi"

interface SampleCertRecord {
  studentId: string
  name: string
  attendancePct: number
  eligibility: string
  certStatus: string
  certificateId?: string
}

export default function AdminCertificateOverview() {
  const [generating, setGenerating] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Sample status data for admin view
  const [records] = useState<SampleCertRecord[]>([
    {
      studentId: "2024UCH1198",
      name: "Parv Agrawal",
      attendancePct: 85.0,
      eligibility: "ELIGIBLE",
      certStatus: "GENERATED",
      certificateId: "CBP-2026-8841",
    },
    {
      studentId: "2024UEC1045",
      name: "Aarav Sharma",
      attendancePct: 100.0,
      eligibility: "ELIGIBLE",
      certStatus: "GENERATED",
      certificateId: "CBP-2026-8842",
    },
    {
      studentId: "2024UME1202",
      name: "Diya Kapoor",
      attendancePct: 60.0,
      eligibility: "NOT_ELIGIBLE",
      certStatus: "LOCKED",
    },
  ])

  const handleGenerateAll = async () => {
    setGenerating(true)
    setMessage(null)
    setError(null)
    try {
      const res = await certificateApi.generateAllCertificates()
      setMessage(`Successfully issued certificates for all eligible students (${res?.length || records.length} credentials issued).`)
    } catch (err: any) {
      setError("Failed to trigger batch certificate generation.")
    } finally {
      setGenerating(false)
    }
  }

  // Mobile Cards View
  const mobileCards = records.map((rec) => (
    <MobileRecordCard
      key={rec.studentId}
      title={rec.name}
      subtitle={rec.studentId}
      status={rec.eligibility === "ELIGIBLE" ? "VERIFIED" : "DISABLED"}
      statusLabel={rec.eligibility === "ELIGIBLE" ? "Eligible" : "In Progress"}
      fields={[
        {
          label: "Attendance",
          value: (
            <span className={`font-mono font-extrabold ${rec.attendancePct >= 75 ? "text-emerald-700" : "text-slate-700"}`}>
              {rec.attendancePct.toFixed(1)}%
            </span>
          ),
        },
        { label: "Certificate", value: rec.certStatus },
      ]}
      actions={
        <button
          onClick={handleGenerateAll}
          className="w-full py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-900 text-xs font-bold inline-flex items-center justify-center gap-1.5 border border-purple-200 cursor-pointer"
        >
          <FiAward className="text-xs" /> View Certificate
        </button>
      }
    />
  ))

  return (
    <div className="space-y-4">
      {/* Header */}
      <PageHeader
        title="Certificate Management"
        subtitle="Batch generate and issue official completion credentials for eligible students"
        actions={
          <button
            onClick={handleGenerateAll}
            disabled={generating}
            className="px-3.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white text-xs font-bold uppercase tracking-wider transition shadow-2xs inline-flex items-center gap-1.5 cursor-pointer"
          >
            {generating ? <FiRefreshCw className="animate-spin text-xs" /> : <FiZap className="text-xs" />}
            <span>{generating ? "Generating..." : "Generate All Eligible"}</span>
          </button>
        }
      />

      {message && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2 font-semibold">
          <FiCheckCircle className="text-emerald-600 shrink-0 text-sm" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2 font-semibold">
          <FiAlertCircle className="text-amber-600 shrink-0 text-sm" />
          <span>{error}</span>
        </div>
      )}

      {/* Operational Rules Panel */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-2xs space-y-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Certificate Issuance Rules
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="font-bold text-slate-900 block">75%+ Attendance Required</span>
            <span className="text-slate-500 text-[11px] mt-0.5 block">Automated threshold check against verified attendance records.</span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="font-bold text-slate-900 block">Unique Credential ID</span>
            <span className="text-slate-500 text-[11px] mt-0.5 block">Generates tamper-proof SHA-256 verification hash per certificate.</span>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <span className="font-bold text-slate-900 block">Instant Student Access</span>
            <span className="text-slate-500 text-[11px] mt-0.5 block">Unlocked certificates are immediately accessible on student portal `/certificate`.</span>
          </div>
        </div>
      </div>

      {/* Certificate Roster */}
      <DataTable
        title="Student Certificate Roster"
        totalCount={records.length}
        data={records}
        emptyMessage="No certificate records available"
        emptySubtext="Certificate records will populate as students reach eligibility threshold."
        mobileView={<>{mobileCards}</>}
      >
        <table className="w-full text-left text-xs border-collapse">
          <thead className="sticky top-0 bg-slate-50/95 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 border-b border-slate-200 z-10 backdrop-blur-2xs">
            <tr>
              <th className="px-4 py-2.5">Student Name</th>
              <th className="px-4 py-2.5">Student ID</th>
              <th className="px-4 py-2.5">Attendance</th>
              <th className="px-4 py-2.5">Eligibility</th>
              <th className="px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
            {records.map((rec) => (
              <tr key={rec.studentId} className="hover:bg-slate-50/70 transition">
                <td className="px-4 py-2.5 font-bold text-slate-900">{rec.name}</td>
                <td className="px-4 py-2.5 font-mono text-slate-700">{rec.studentId}</td>
                <td className="px-4 py-2.5 font-mono font-bold">
                  <span className={rec.attendancePct >= 75 ? "text-emerald-700" : "text-slate-700"}>
                    {rec.attendancePct.toFixed(1)}%
                  </span>
                </td>
                <td className="px-4 py-2.5">
                  <StatusBadge status={rec.eligibility === "ELIGIBLE" ? "VERIFIED" : "DISABLED"} label={rec.eligibility === "ELIGIBLE" ? "ELIGIBLE" : "IN PROGRESS"} />
                </td>
                <td className="px-4 py-2.5 font-mono text-slate-600 text-[11px]">{rec.certStatus}</td>
                <td className="px-4 py-2.5 text-right">
                  <button
                    onClick={handleGenerateAll}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition inline-flex items-center gap-1 border border-slate-200 cursor-pointer"
                  >
                    <FiAward className="text-xs text-slate-600" /> View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </DataTable>
    </div>
  )
}
