"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { attendanceService } from "@/services/attendanceService"
import { StudentAttendanceSummaryResponse, AttendanceQrResponse } from "@/types/attendance"
import PageTransition from "@/components/animations/PageTransition"
import AttendanceCard from "@/components/cards/AttendanceCard"
import AttendanceTable from "@/components/tables/AttendanceTable"
import StudentQrCard from "@/components/dashboard/StudentQrCard"
import DailyQrCard from "@/components/dashboard/DailyQrCard"
import { FiCalendar, FiArrowLeft, FiCopy, FiCheck } from "react-icons/fi"

export default function AttendancePage() {
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<StudentAttendanceSummaryResponse | null>(null)
  const [qrCode, setQrCode] = useState<AttendanceQrResponse | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchAttendanceData()
  }, [])

  const fetchAttendanceData = async () => {
    setLoading(true)
    try {
      const [sumData, qrData] = await Promise.allSettled([
        attendanceService.getMyAttendance(),
        attendanceService.getMyQr(),
      ])

      if (sumData.status === "fulfilled") setSummary(sumData.value)
      if (qrData.status === "fulfilled") setQrCode(qrData.value)
    } catch (e) {
      console.error("Error fetching attendance data", e)
    } finally {
      setLoading(false)
    }
  }

  const handleCopyToken = () => {
    if (!qrCode?.token) return
    navigator.clipboard.writeText(qrCode.token)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <PageTransition>
      <main className="min-h-[calc(100vh-80px)] bg-cbp-grid text-slate-900 py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {/* Header Bar */}
          <div className="flex items-center justify-between mb-6">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 px-4 py-2 text-xs font-bold uppercase tracking-wider shadow-sm transition"
            >
              <FiArrowLeft /> Dashboard
            </Link>
            <span className="inline-flex items-center gap-2 rounded-full bg-cyan-50 border border-cyan-200 px-4 py-1 text-xs font-bold text-cyan-800 uppercase tracking-wider">
              Student Attendance Portal
            </span>
          </div>

          <div className="border-b border-slate-200 pb-4 mb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
              <span className="text-cyan-700"><FiCalendar /></span>
              <span>Attendance &amp; Session QR</span>
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-600">
              Track your daily workshop session attendance percentage, 75% threshold, and access your daily session QR code.
            </p>
          </div>

          {/* Copy Token Bar */}
          {qrCode && (
            <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-700 min-w-0">
                <span className="font-bold text-cyan-800 shrink-0">Session QR Token Payload:</span>
                <span className="truncate font-semibold text-slate-900 bg-slate-50 px-2 py-1 rounded border border-slate-200">{qrCode.token}</span>
              </div>
              <button
                onClick={handleCopyToken}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs font-bold hover:bg-cyan-100 transition shrink-0"
              >
                {copied ? <FiCheck className="text-emerald-600" /> : <FiCopy />}
                <span>{copied ? "Token Copied!" : "Copy Token Payload"}</span>
              </button>
            </div>
          )}

          {/* Student Portal 2-Column Attendance View */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="space-y-6">
              <StudentQrCard qrCode={qrCode} loading={loading} />
              <DailyQrCard studentQr={qrCode} />
            </div>

            <div className="space-y-6">
              <AttendanceCard summary={summary} loading={loading} />
            </div>
          </div>

          {/* Attendance Session History Log Table */}
          <div className="mb-8">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Attendance History Log</h3>
            <AttendanceTable records={summary?.records || []} loading={loading} />
          </div>
        </div>
      </main>
    </PageTransition>
  )
}
