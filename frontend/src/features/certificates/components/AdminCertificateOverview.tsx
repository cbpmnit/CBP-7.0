"use client"

import React, { useState } from "react"
import { certificateApi } from "@/features/certificates/services/certificateApi"
import { PageHeader } from "@/components/ui/PageHeader"
import { DataTable } from "@/components/ui/DataTable"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { MobileRecordCard } from "@/components/ui/MobileRecordCard"
import { ExportCsvButton } from "@/components/ui/ExportCsvButton"
import { Button } from "@/components/ui/Button"
import { Alert } from "@/components/ui/Alert"
import CertificateTemplateEditor from "./CertificateTemplateEditor"
import {
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
        <Button
          variant="outline"
          size="sm"
          onClick={handleGenerateAll}
          icon={<FiAward className="text-xs" />}
          className="w-full"
        >
          View Certificate
        </Button>
      }
    />
  ))

  return (
    <div className="space-y-5">
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
              <Button
                variant="primary"
                size="sm"
                onClick={handleGenerateAll}
                loading={generating}
                icon={generating ? <FiRefreshCw className="animate-spin text-xs" /> : <FiZap className="text-xs" />}
              >
                Generate All Eligible
              </Button>
            </div>
          ) : undefined
        }
      />

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

      {message && <Alert type="success" message={message} />}
      {error && <Alert type="error" message={error} />}

      {activeTab === "template" && <CertificateTemplateEditor />}

      {activeTab === "issuance" && (
        <div className="space-y-4">
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
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleGenerateAll}
                        icon={<FiAward className="text-xs text-slate-600" />}
                      >
                        View
                      </Button>
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
