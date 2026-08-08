"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { attendanceService } from "@/services/attendanceService"
import { StudentAttendanceSummaryResponse, AttendanceQrResponse } from "@/types/attendance"
import PageTransition from "@/components/animations/PageTransition"
import AttendanceTabs, { AttendanceViewMode } from "@/components/attendance/AttendanceTabs"
import StudentAttendanceView from "@/components/attendance/StudentAttendanceView"
import AdminAttendanceView from "@/components/attendance/AdminAttendanceView"
import VolunteerScannerView from "@/components/attendance/VolunteerScannerView"
import { FiArrowLeft, FiCamera } from "react-icons/fi"

export default function AttendancePage() {
  const [activeView, setActiveView] = useState<AttendanceViewMode>("student")
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<StudentAttendanceSummaryResponse | null>(null)
  const [qrCode, setQrCode] = useState<AttendanceQrResponse | null>(null)

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

  return (
    <PageTransition>
      <main className="min-h-[calc(100vh-80px)] bg-cbp-grid text-slate-900 py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          {/* Header Bar */}
          <div className="flex items-center justify-between mb-6">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 px-4 py-2 text-xs font-bold uppercase tracking-wider shadow-sm transition"
            >
              <FiArrowLeft /> Dashboard
            </Link>
            <span className="inline-flex items-center gap-2 rounded-full bg-cyan-50 border border-cyan-200 px-4 py-1 text-xs font-bold text-cyan-800 uppercase tracking-wider">
              CBP Attendance &amp; QR Portal
            </span>
          </div>

          <div className="border-b border-slate-200 pb-4 mb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
              <span className="text-cyan-700"><FiCamera /></span>
              <span>Attendance &amp; QR Control</span>
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-600">
              Student QR presentation, session QR management, and volunteer gate scanning.
            </p>
          </div>

          {/* Development Segmented View Tabs */}
          <AttendanceTabs activeView={activeView} onViewChange={setActiveView} />

          {/* Active View Module Workflow */}
          {activeView === "student" && (
            <StudentAttendanceView
              summary={summary}
              qrCode={qrCode}
              loading={loading}
            />
          )}

          {activeView === "admin" && (
            <AdminAttendanceView />
          )}

          {activeView === "volunteer" && (
            <VolunteerScannerView onSuccessMark={fetchAttendanceData} />
          )}
        </div>
      </main>
    </PageTransition>
  )
}
