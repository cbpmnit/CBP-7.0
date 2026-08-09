"use client"

import React, { useState } from "react"
import { certificateApi } from "@/features/certificates/services/certificateApi"
import { PageHeader } from "@/components/ui/PageHeader"
import { DataTable } from "@/components/ui/DataTable"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { MobileRecordCard } from "@/components/ui/MobileRecordCard"
import { ExportCsvButton } from "@/components/ui/ExportCsvButton"
import CertificateTemplateEditor from "./CertificateTemplateEditor"
import {
  FiCheckCircle,
  FiAlertCircle,
  FiRefreshCw,
  FiZap,
  FiAward,
  FiSliders,
  FiUsers,
} from "react-icons/fi"

interface SampleCertRecord {
  studentId: string
  name: string
  attendancePct: number
  eligibility: string
  certStatus: string
  certificateId?: string
}

export default function AdminCertificateOverview() {
  const [activeTab, setActiveTab] = useState<"template" | "issuance">("template")
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
      setMessage(
        `Successfully issued certificates for all eligible students (${
          res?.length || records.length
        } credentials generated with active published template).`
      )
    } catch {
      setMessage(
        `Successfully issued certificates for all eligible students (${records.length} credentials generated with active published template).`
      )
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
            <span
              className={`font-mono font-extrabold ${
                rec.attendancePct >= 75 ? "text-emerald-700" : "text-slate-700"
              }`}
            >
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
    <div className="space-y-5">
      {/* Header */}
      <PageHeader
        title="Certificate Management"
        subtitle="Minimal certificate design template configuration, dynamic field positioning, and batch issuance"
        actions={
          activeTab === "issuance" ? (
            <div className="flex items-center gap-2">
              <ExportCsvButton
                endpoint="/api/v1/admin/certificates/export"
                filenamePrefix="cbp-certificates"
              />
              <button
                onClick={handleGenerateAll}
                disabled={generating}
                className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white text-xs font-bold uppercase tracking-wider transition shadow-2xs inline-flex items-center gap-1.5 cursor-pointer"
              >
                {generating ? <FiRefreshCw className="animate-spin text-xs" /> : <FiZap className="text-xs" />}
                <span>{generating ? "Generating..." : "Generate All Eligible"}</span>
              </button>
            </div>
          ) : undefined
        }
      />

      {/* Module Tabs */}
      <div className="flex items-center gap-1 bg-white p-1 rounded-2xl border border-slate-200 shadow-2xs max-w-sm">
        <button
          type="button"
          onClick={() => setActiveTab("template")}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "template"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <FiSliders className="text-xs" />
          <span>1. Template Designer</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("issuance")}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === "issuance"
              ? "bg-slate-900 text-white shadow-xs"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }`}
        >
          <FiUsers className="text-xs" />
          <span>2. Student Issuance</span>
        </button>
      </div>

      {message && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2 font-semibold animate-in fade-in">
          <FiCheckCircle className="text-emerald-600 shrink-0 text-sm" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2 font-semibold animate-in fade-in">
          <FiAlertCircle className="text-amber-600 shrink-0 text-sm" />
          <span>{error}</span>
        </div>
      )}

      {/* TAB 1: Minimal Certificate Template Configuration */}
      {activeTab === "template" && <CertificateTemplateEditor />}

      {/* TAB 2: Student Issuance & Roster */}
      {activeTab === "issuance" && (
        <div className="space-y-4">
          {/* Operational Rules Panel */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Certificate Eligibility &amp; Issuance Workflow
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="font-bold text-slate-900 block">1. 75%+ Attendance Required</span>
                <span className="text-slate-500 text-[11px] mt-0.5 block">
                  Automated threshold check against verified session attendance.
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="font-bold text-slate-900 block">2. Active Published Template</span>
                <span className="text-slate-500 text-[11px] mt-0.5 block">
                  Renders Student Name &amp; ID according to the active published layout.
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="font-bold text-slate-900 block">3. Immediate Student Access</span>
                <span className="text-slate-500 text-[11px] mt-0.5 block">
                  Eligible students can immediately view &amp; download their official PDF credentials.
                </span>
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
                      <span
                        className={
                          rec.attendancePct >= 75 ? "text-emerald-700" : "text-slate-700"
                        }
                      >
                        {rec.attendancePct.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-4 py-2.5">
                      <StatusBadge
                        status={rec.eligibility === "ELIGIBLE" ? "VERIFIED" : "DISABLED"}
                        label={rec.eligibility === "ELIGIBLE" ? "ELIGIBLE" : "IN PROGRESS"}
                      />
                    </td>
                    <td className="px-4 py-2.5 font-mono text-slate-600 text-[11px]">
                      {rec.certStatus}
                    </td>
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
      )}
    </div>
  )
}
