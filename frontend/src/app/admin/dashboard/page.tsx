"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { attendanceService } from "@/services/attendanceService"
import { certificateService } from "@/services/certificateService"
import { AdminAttendanceSummaryResponse, DailyAttendanceReportResponse } from "@/types/attendance"
import PageTransition from "@/components/animations/PageTransition"
import AttendanceTable from "@/components/tables/AttendanceTable"
import {
  FiShield,
  FiUsers,
  FiCalendar,
  FiPercent,
  FiAward,
  FiBell,
  FiCode,
  FiSearch,
  FiArrowLeft,
  FiCheckCircle,
} from "react-icons/fi"

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<AdminAttendanceSummaryResponse | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  // Certificate Actions
  const [certStudentId, setCertStudentId] = useState("")
  const [certLoading, setCertLoading] = useState(false)
  const [batchLoading, setBatchLoading] = useState(false)

  // Date Search
  const [searchDate, setSearchDate] = useState(new Date().toISOString().split("T")[0])
  const [dailyReport, setDailyReport] = useState<DailyAttendanceReportResponse | null>(null)
  const [searchLoading, setSearchLoading] = useState(false)

  useEffect(() => {
    fetchAdminSummary()
  }, [])

  const fetchAdminSummary = async () => {
    setLoading(true)
    try {
      const data = await attendanceService.getAdminSummary()
      setSummary(data)
    } catch (err: any) {
      console.error("Failed to load admin summary", err)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateCertificate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!certStudentId.trim()) return
    setCertLoading(true)
    setMessage(null)
    try {
      const res = await certificateService.generateCertificate(certStudentId.trim())
      setMessage(`Certificate generated successfully for student ${res.studentId}! No: ${res.certificateNumber}`)
      setCertStudentId("")
    } catch (err: any) {
      setMessage(err?.message || "Failed to generate certificate for student.")
    } finally {
      setCertLoading(false)
    }
  }

  const handleGenerateAllCertificates = async () => {
    if (!confirm("Are you sure you want to generate certificates for all eligible students?")) return
    setBatchLoading(true)
    setMessage(null)
    try {
      const resList = await certificateService.generateAllCertificates()
      setMessage(`Batch certificate generation completed! Generated ${resList?.length || 0} certificates.`)
    } catch (err: any) {
      setMessage(err?.message || "Failed to run batch certificate generation.")
    } finally {
      setBatchLoading(false)
    }
  }

  const handleSearchDate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!searchDate) return
    setSearchLoading(true)
    try {
      const report = await attendanceService.getAttendanceByDate(searchDate)
      setDailyReport(report)
    } catch (err: any) {
      console.error("Failed to fetch daily report", err)
    } finally {
      setSearchLoading(false)
    }
  }

  return (
    <PageTransition>
      <main className="min-h-screen bg-slate-50 text-slate-900 py-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-center justify-between mb-8">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 px-4 py-2 text-xs font-semibold uppercase tracking-wider transition shadow-sm"
            >
              <FiArrowLeft /> Student View
            </Link>
            <span className="inline-flex items-center gap-2 rounded-full bg-purple-50 border border-purple-200 px-4 py-1 text-xs font-bold text-purple-800 uppercase tracking-wider">
              <FiShield /> Admin Control Center
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-6 mb-8">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                Admin <span className="gradient-text-cyan">Dashboard</span>
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Program operations, attendance summaries, certificate issuance, and template controls.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 mt-4 md:mt-0">
              <Link
                href="/admin/notifications"
                className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 text-slate-700 px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-slate-100 transition shadow-sm"
              >
                <FiBell /> Notification Templates
              </Link>
              <Link
                href="/admin/attendance-qr"
                className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 text-slate-700 px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-slate-100 transition shadow-sm"
              >
                <FiCode /> Student QR Manager
              </Link>
            </div>
          </div>

          {message && (
            <div className="mb-6 p-4 rounded-2xl border bg-cyan-50 border-cyan-200 text-cyan-800 text-xs font-semibold text-center">
              {message}
            </div>
          )}

          {/* Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Students</span>
                <FiUsers className="text-cyan-700" />
              </div>
              <div className="text-3xl font-extrabold text-slate-900 font-mono">{summary?.totalStudents ?? 0}</div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Today Present</span>
                <FiCalendar className="text-cyan-700" />
              </div>
              <div className="text-3xl font-extrabold text-slate-900 font-mono">{summary?.todayAttendanceCount ?? 0}</div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Total Records</span>
                <FiCheckCircle className="text-cyan-700" />
              </div>
              <div className="text-3xl font-extrabold text-slate-900 font-mono">{summary?.totalAttendanceRecords ?? 0}</div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Avg Attendance</span>
                <FiPercent className="text-cyan-700" />
              </div>
              <div className="text-3xl font-extrabold text-cyan-800 font-mono">
                {(summary?.averageAttendancePercentage ?? 0).toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Certificate Actions */}
          <div className="grid gap-6 md:grid-cols-2 mb-8">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-700">
                    <FiAward className="text-lg" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">Generate Individual Certificate</h3>
                </div>
                <p className="text-xs text-slate-600 mb-4">
                  Generate certificate for a specific student after verifying CBP registration, payment, and attendance threshold.
                </p>

                <form onSubmit={handleGenerateCertificate} className="flex gap-2 mb-2">
                  <input
                    type="text"
                    required
                    value={certStudentId}
                    onChange={(e) => setCertStudentId(e.target.value)}
                    placeholder="Student ID (e.g. 2024UCP1001)"
                    className="flex-1 rounded-xl bg-slate-50 border border-slate-200 px-4 py-2 text-xs text-slate-900 focus:border-cyan-600 focus:outline-none font-mono"
                  />
                  <button
                    type="submit"
                    disabled={certLoading}
                    className="rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-4 py-2 text-xs font-bold uppercase tracking-wider shadow-sm transition disabled:opacity-50"
                  >
                    {certLoading ? "Generating..." : "Generate"}
                  </button>
                </form>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-700">
                    <FiAward className="text-lg" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">Batch Certificate Issuance</h3>
                </div>
                <p className="text-xs text-slate-600 mb-6">
                  Automatically evaluate eligibility across all registered students and issue certificates for qualified participants.
                </p>
              </div>

              <button
                onClick={handleGenerateAllCertificates}
                disabled={batchLoading}
                className="w-full rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white py-3 text-xs font-bold uppercase tracking-wider shadow-sm transition disabled:opacity-50"
              >
                {batchLoading ? "Processing Batch Generation..." : "Generate All Eligible Certificates"}
              </button>
            </div>
          </div>

          {/* Search Date */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm mb-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 pb-4 mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">Daily Attendance Inspector</h3>
                <p className="text-xs text-slate-600">Filter and view present records for any date.</p>
              </div>

              <form onSubmit={handleSearchDate} className="mt-4 md:mt-0 flex gap-2">
                <input
                  type="date"
                  required
                  value={searchDate}
                  onChange={(e) => setSearchDate(e.target.value)}
                  className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-2 text-xs text-slate-900 focus:border-cyan-600 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={searchLoading}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-4 py-2 text-xs font-bold uppercase tracking-wider shadow-sm transition"
                >
                  <FiSearch /> Search
                </button>
              </form>
            </div>

            {dailyReport && (
              <div>
                <div className="mb-4 text-xs font-semibold text-slate-700">
                  Date: <span className="font-mono text-cyan-800 font-bold">{dailyReport.date}</span> | Total Present Count:{" "}
                  <span className="font-mono text-slate-900 font-bold">{dailyReport.totalPresent}</span>
                </div>
                <AttendanceTable records={dailyReport.records || []} loading={searchLoading} />
              </div>
            )}
          </div>
        </div>
      </main>
    </PageTransition>
  )
}
