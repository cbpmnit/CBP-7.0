"use client"

import { useState, useEffect, useRef } from "react"
import { Html5QrcodeScanner } from "html5-qrcode"
import { attendanceService } from "@/services/attendanceService"
import { AttendanceRecordResponse } from "@/types/attendance"
import {
  FiCamera,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiUser,
  FiKey,
  FiRefreshCw,
  FiShield,
} from "react-icons/fi"

export default function VolunteerScannerView() {
  const [scanning, setScanning] = useState(false)
  const [loading, setLoading] = useState(false)
  const [studentIdInput, setStudentIdInput] = useState("")
  const [tokenInput, setTokenInput] = useState("")
  const [successRecord, setSuccessRecord] = useState<AttendanceRecordResponse | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [scannedLogs, setScannedLogs] = useState<AttendanceRecordResponse[]>([])

  const scannerRef = useRef<Html5QrcodeScanner | null>(null)

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error)
      }
    }
  }, [])

  const startScanner = () => {
    setScanning(true)
    setErrorMessage(null)
    setSuccessRecord(null)

    setTimeout(() => {
      if (!scannerRef.current) {
        const scanner = new Html5QrcodeScanner(
          "volunteer-reader",
          { fps: 10, qrbox: { width: 240, height: 240 } },
          false
        )
        scanner.render(onScanSuccess, () => {})
        scannerRef.current = scanner
      }
    }, 100)
  }

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(console.error)
      scannerRef.current = null
    }
    setScanning(false)
  }

  const onScanSuccess = async (decodedText: string) => {
    stopScanner()
    setTokenInput(decodedText)
    if (studentIdInput.trim()) {
      await submitAttendance(decodedText, studentIdInput.trim())
    } else {
      setErrorMessage("Please enter or verify Student ID to complete attendance marking.")
    }
  }

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tokenInput.trim()) {
      setErrorMessage("Please enter or scan a valid session QR token.")
      return
    }
    if (!studentIdInput.trim()) {
      setErrorMessage("Please enter the student's ID (e.g. 2024ucs1234).")
      return
    }
    await submitAttendance(tokenInput.trim(), studentIdInput.trim())
  }

  const submitAttendance = async (qrToken: string, studentId: string) => {
    setLoading(true)
    setErrorMessage(null)
    setSuccessRecord(null)

    try {
      const record = await attendanceService.scanAttendance({
        qrToken,
        studentId: studentId.trim().toLowerCase(),
      })

      setSuccessRecord(record)
      setScannedLogs((prev) => [record, ...prev])
      setStudentIdInput("")
    } catch (err: any) {
      const msg = err?.message || ""
      if (msg.includes("409") || msg.toLowerCase().includes("already")) {
        setErrorMessage("Attendance already marked for this student in this session.")
      } else if (msg.toLowerCase().includes("closed") || msg.toLowerCase().includes("inactive")) {
        setErrorMessage("This attendance session is currently closed or inactive.")
      } else if (msg.toLowerCase().includes("expired") || msg.toLowerCase().includes("invalid")) {
        setErrorMessage("Invalid or expired session QR code.")
      } else {
        setErrorMessage(msg || "Failed to mark attendance. Please check the session QR and student ID.")
      }
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (isoString?: string | null) => {
    if (!isoString) return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    try {
      return new Date(isoString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } catch {
      return isoString
    }
  }

  return (
    <div className="space-y-6">
      {/* Scanner Control Box */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-800 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
              Gate Scanner
            </span>
            <h3 className="text-sm font-extrabold text-slate-900 mt-1 flex items-center gap-1.5">
              <FiCamera className="text-cyan-700" />
              <span>Volunteer Attendance Scanner</span>
            </h3>
          </div>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            Scanner Ready
          </span>
        </div>

        {/* Live Camera Scanner */}
        <div className="mb-4">
          {!scanning ? (
            <button
              onClick={startScanner}
              className="w-full rounded-xl bg-slate-900 hover:bg-slate-800 text-white py-3 text-xs font-bold uppercase tracking-wider shadow-sm transition flex items-center justify-center gap-2"
            >
              <FiCamera className="text-base" /> Start Live Camera Scanner
            </button>
          ) : (
            <div className="space-y-3">
              <div id="volunteer-reader" className="overflow-hidden rounded-xl border border-slate-200" />
              <button
                onClick={stopScanner}
                className="w-full rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 text-xs font-bold uppercase tracking-wider transition"
              >
                Close Camera
              </button>
            </div>
          )}
        </div>

        {/* Manual Input Form */}
        <form onSubmit={handleManualSubmit} className="space-y-3 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Student ID <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FiUser className="absolute left-3 top-2.5 text-slate-400 text-xs" />
                <input
                  type="text"
                  required
                  value={studentIdInput}
                  onChange={(e) => setStudentIdInput(e.target.value)}
                  placeholder="e.g. 2024ucs1234"
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-cyan-600 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Session QR Token <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FiKey className="absolute left-3 top-2.5 text-slate-400 text-xs" />
                <input
                  type="text"
                  required
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="Paste or scan token..."
                  className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:border-cyan-600 font-mono"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !studentIdInput.trim() || !tokenInput.trim()}
            className="w-full rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white py-2.5 text-xs font-bold uppercase tracking-wider shadow-sm transition disabled:opacity-50 inline-flex items-center justify-center gap-2"
          >
            {loading ? <FiRefreshCw className="animate-spin" /> : <FiShield />}
            <span>{loading ? "Marking Attendance..." : "Mark Attendance"}</span>
          </button>
        </form>

        {/* Feedback Alerts */}
        {successRecord && (
          <div className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-start gap-3">
            <FiCheckCircle className="text-lg text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <h4 className="font-extrabold text-sm text-emerald-950">Attendance marked successfully!</h4>
              <p>
                Student: <span className="font-mono font-bold">{successRecord.studentId}</span>
              </p>
              <p className="text-[11px] font-mono text-emerald-800">
                Time: {formatTime(successRecord.markedAt)} &middot; Status: {successRecord.status}
              </p>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="mt-4 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-semibold flex items-center gap-2">
            <FiXCircle className="text-base text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Scanned Activity Log */}
      {scannedLogs.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
            <FiClock className="text-cyan-700" /> Recent Scans ({scannedLogs.length})
          </h3>

          <div className="space-y-2">
            {scannedLogs.map((log, idx) => (
              <div
                key={log.id || idx}
                className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                    ✓
                  </div>
                  <div>
                    <span className="font-mono font-bold text-slate-900">{log.studentId}</span>
                    <span className="text-[10px] text-slate-500 ml-2 font-mono">
                      Marked by: {log.markedBy || "Volunteer"}
                    </span>
                  </div>
                </div>
                <span className="font-mono text-[11px] text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {formatTime(log.markedAt)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
