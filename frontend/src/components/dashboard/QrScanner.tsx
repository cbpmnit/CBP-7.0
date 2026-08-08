"use client"

import { useState, useEffect, useRef } from "react"
import { Html5QrcodeScanner } from "html5-qrcode"
import { attendanceService } from "@/services/attendanceService"
import { AttendanceRecordResponse } from "@/types/attendance"
import { FiCamera, FiCheckCircle, FiAlertCircle, FiXCircle, FiKey } from "react-icons/fi"

interface QrScannerProps {
  onSuccessMark?: () => void
}

export default function QrScanner({ onSuccessMark }: QrScannerProps) {
  const [scanning, setScanning] = useState(false)
  const [loading, setLoading] = useState(false)
  const [tokenInput, setTokenInput] = useState("")
  const [lastRecord, setLastRecord] = useState<AttendanceRecordResponse | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

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
    setSuccessMessage(null)

    setTimeout(() => {
      if (!scannerRef.current) {
        const scanner = new Html5QrcodeScanner(
          "reader",
          { fps: 10, qrbox: { width: 220, height: 220 } },
          /* verbose= */ false
        )
        scanner.render(onScanSuccess, onScanError)
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
    await processToken(decodedText)
  }

  const onScanError = (err: any) => {
    // Keep scanning on minor frame errors
  }

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!tokenInput.trim()) return
    await processToken(tokenInput.trim())
  }

  const processToken = async (token: string) => {
    setLoading(true)
    setErrorMessage(null)
    setSuccessMessage(null)
    setLastRecord(null)

    try {
      const record = await attendanceService.markAttendance(token)
      setLastRecord(record)
      setSuccessMessage(`Attendance marked successfully for student ${record.studentId || "Student"}!`)
      setTokenInput("")
      if (onSuccessMark) onSuccessMark()
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to mark attendance. Invalid, expired, or duplicate QR token.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <span className="text-cyan-700 text-base"><FiCamera /></span>
          <span>Attendance QR Scanner</span>
        </h3>
        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-50 border border-purple-200 text-purple-800">
          Volunteer &amp; Gate Control
        </span>
      </div>

      <p className="text-xs text-slate-600 mb-4">
        Scan student QR code using webcam or enter token payload manually to log session attendance.
      </p>

      {/* Scanner & Manual Input Actions */}
      <div className="space-y-4 mb-4">
        {!scanning ? (
          <button
            onClick={startScanner}
            className="w-full rounded-xl bg-slate-900 hover:bg-slate-800 text-white py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition"
          >
            <FiCamera className="text-base" /> Start Live Camera Scanner
          </button>
        ) : (
          <div className="space-y-3">
            <div id="reader" className="overflow-hidden rounded-xl border border-slate-200" />
            <button
              onClick={stopScanner}
              className="w-full rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 py-2 text-xs font-bold uppercase tracking-wider transition"
            >
              Close Camera
            </button>
          </div>
        )}

        <form onSubmit={handleManualSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <FiKey className="absolute left-3 top-3 text-slate-400 text-sm" />
            <input
              type="text"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder="Or paste QR token string..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-cyan-600 focus:outline-none font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !tokenInput.trim()}
            className="rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-4 py-2 text-xs font-bold uppercase tracking-wider shadow-sm transition disabled:opacity-50"
          >
            {loading ? "Processing..." : "Submit Token"}
          </button>
        </form>
      </div>

      {/* Status Responses */}
      {successMessage && (
        <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 mb-3">
          <FiCheckCircle className="text-base shrink-0" />
          <div>
            <p>{successMessage}</p>
            {lastRecord && (
              <p className="text-[11px] font-mono text-emerald-900 mt-0.5">
                Date: {lastRecord.attendanceDate} &middot; Status: {lastRecord.status} &middot; Marked By: {lastRecord.markedBy}
              </p>
            )}
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2 mb-3">
          <FiXCircle className="text-base shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  )
}
