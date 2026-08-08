"use client"

import { useState } from "react"
import { attendanceService } from "@/services/attendanceService"
import { ScanAttendanceResponse } from "@/types/attendance"
import {
  FiCamera,
  FiCheckCircle,
  FiAlertCircle,
  FiRefreshCw,
  FiZap,
  FiUser,
  FiCalendar,
  FiClock,
} from "react-icons/fi"

export default function VolunteerAttendanceView() {
  const [qrTokenInput, setQrTokenInput] = useState("")
  const [scanning, setScanning] = useState(false)
  const [lastScanResult, setLastScanResult] = useState<ScanAttendanceResponse | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [scanHistory, setScanHistory] = useState<ScanAttendanceResponse[]>([])

  const handleScanSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = qrTokenInput.trim()
    if (!token) return

    setScanning(true)
    setErrorMessage(null)
    try {
      const res = await attendanceService.scanAttendanceQr(token)
      setLastScanResult(res)
      setScanHistory((prev) => [res, ...prev.slice(0, 9)])
      setQrTokenInput("")
    } catch (err: any) {
      setErrorMessage(err?.message || "Invalid, expired, or already marked student QR code.")
    } finally {
      setScanning(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* 1. Gate Scanner Control */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm max-w-xl mx-auto space-y-6">
        <div className="text-center space-y-1">
          <div className="h-12 w-12 rounded-2xl bg-cyan-50 border border-cyan-200 text-cyan-700 flex items-center justify-center text-2xl mx-auto">
            <FiCamera />
          </div>
          <h2 className="text-lg font-extrabold text-slate-900">Volunteer Gate Scanner</h2>
          <p className="text-xs text-slate-500 font-medium">
            Scan student personal session QR token at the auditorium entry gate to mark attendance.
          </p>
        </div>

        {/* Manual Token Scan Form */}
        <form onSubmit={handleScanSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Scan / Enter Student QR Token
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={qrTokenInput}
                onChange={(e) => setQrTokenInput(e.target.value)}
                placeholder="Scan or paste CBP_STUDENT_QR_..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 focus:outline-none focus:border-cyan-600"
                autoFocus
              />
              <button
                type="submit"
                disabled={scanning || !qrTokenInput.trim()}
                className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white text-xs font-extrabold uppercase tracking-wider transition inline-flex items-center gap-1.5 shadow-sm shrink-0"
              >
                {scanning ? <FiRefreshCw className="animate-spin" /> : <FiZap />}
                <span>{scanning ? "Validating..." : "Mark Attendance"}</span>
              </button>
            </div>
          </div>
        </form>

        {/* Scan Result Feedback Card */}
        {lastScanResult && (
          <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-3">
            <div className="flex items-center gap-2 text-emerald-800">
              <FiCheckCircle className="text-xl shrink-0" />
              <span className="text-xs font-extrabold uppercase tracking-wider">
                Attendance Marked Successfully ✓
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-emerald-200/60">
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-700 flex items-center gap-1">
                  <FiUser /> Student Name
                </span>
                <p className="font-extrabold text-emerald-950 mt-0.5">{lastScanResult.studentName}</p>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-700">Student ID</span>
                <p className="font-mono font-bold text-emerald-900 mt-0.5">{lastScanResult.studentId}</p>
              </div>

              <div className="col-span-2">
                <span className="text-[10px] uppercase font-bold text-emerald-700 flex items-center gap-1">
                  <FiCalendar /> Session
                </span>
                <p className="font-bold text-emerald-950 mt-0.5">{lastScanResult.sessionTitle}</p>
              </div>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-semibold flex items-center gap-3">
            <FiAlertCircle className="text-xl text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* 2. Recent Volunteer Scans Feed */}
      {scanHistory.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm max-w-xl mx-auto space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Recent Scanned Entries Log
          </h3>

          <div className="divide-y divide-slate-100 text-xs">
            {scanHistory.map((item, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">{item.studentName}</p>
                  <p className="text-[11px] text-slate-500 font-mono">{item.studentId} • {item.sessionTitle}</p>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <FiCheckCircle /> Marked
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
