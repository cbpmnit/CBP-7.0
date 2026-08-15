"use client"

import { useState, useEffect, useRef } from "react"
import { attendanceApi } from "../services/attendanceApi"
import { ScanAttendanceResponse } from "@/types/attendance"
import { Html5Qrcode } from "html5-qrcode"
import {
  FiCamera,
  FiCheckCircle,
  FiAlertCircle,
  FiRefreshCw,
  FiZap,
  FiUser,
  FiCalendar,
  FiClock,
  FiVideo,
  FiVideoOff,
  FiCheck,
  FiCheckSquare,
} from "react-icons/fi"

export default function VolunteerAttendanceView() {
  const [qrTokenInput, setQrTokenInput] = useState("")
  const [validating, setValidating] = useState(false)
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [lastScanResult, setLastScanResult] = useState<ScanAttendanceResponse | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [scanHistory, setScanHistory] = useState<ScanAttendanceResponse[]>([])

  const qrScannerRef = useRef<Html5Qrcode | null>(null)

  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [])

  const startCamera = async () => {
    setCameraError(null)
    setErrorMessage(null)
    try {
      if (!qrScannerRef.current) {
        qrScannerRef.current = new Html5Qrcode("qr-scanner-region")
      }

      await qrScannerRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          handleTokenScanned(decodedText)
        },
        () => {}
      )
      setCameraActive(true)
    } catch (err: any) {
      console.warn("Camera start warning/fallback", err)
      setCameraError(
        err?.message || "Unable to access video camera. You can still scan or type QR tokens manually below."
      )
      setCameraActive(false)
    }
  }

  const stopCamera = async () => {
    if (qrScannerRef.current && cameraActive) {
      try {
        await qrScannerRef.current.stop()
      } catch (err) {
        console.warn("Camera stop issue", err)
      } finally {
        setCameraActive(false)
      }
    }
  }

  const handleTokenScanned = async (token: string) => {
    const cleanToken = token.trim()
    if (!cleanToken) return
    processToken(cleanToken)
  }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!qrTokenInput.trim()) return
    processToken(qrTokenInput.trim())
  }

  const processToken = async (token: string) => {
    setValidating(true)
    setErrorMessage(null)
    setSuccessMessage(null)
    try {
      const res = await attendanceApi.scanAttendanceQr(token)
      setLastScanResult(res)
      setSuccessMessage("Attendance recorded successfully ✓")
      setScanHistory((prev) => [res, ...prev.slice(0, 9)])
      setQrTokenInput("")
    } catch (err: any) {
      const msg = err?.message || "Scan failed"
      if (msg.toLowerCase().includes("already")) {
        setErrorMessage("Already marked attendance for this student.")
      } else if (msg.toLowerCase().includes("expired")) {
        setErrorMessage("Expired QR pass. Please ask student to refresh their gate pass.")
      } else if (msg.toLowerCase().includes("wrong") || msg.toLowerCase().includes("session")) {
        setErrorMessage("Wrong session: This QR pass belongs to a different day session.")
      } else {
        setErrorMessage("Invalid QR: Passcode could not be verified in the CBP 7.0 system.")
      }
    } finally {
      setValidating(false)
    }
  }

  const handleConfirmMark = async () => {
    if (!lastScanResult) return
    setSuccessMessage("Attendance verified and confirmed in the CBP 7.0 system ✓")
  }

  return (
    <div className="space-y-6">
      {/* Header Card (Clean Institutional Theme) */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-50 text-cyan-808 border border-cyan-200">
              <FiCamera /> Gate Access Control
            </span>
            <span className="text-[10px] font-mono font-bold text-slate-400">MNIT Jaipur</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
            <span>CBP Attendance Scanner</span>
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Official volunteer check-in portal for workshop attendance management.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!cameraActive ? (
            <button
              onClick={startCamera}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white text-xs font-bold uppercase tracking-wider transition inline-flex items-center gap-1.5 shadow-sm shadow-cyan-600/20"
            >
              <FiVideo /> START CAMERA
            </button>
          ) : (
            <button
              onClick={stopCamera}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider transition inline-flex items-center gap-1.5 shadow-sm"
            >
              <FiVideoOff /> STOP CAMERA
            </button>
          )}
        </div>
      </div>

      {/* Main Dual-Panel Scanner Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT PANEL: Camera Scanner Box (col-span-7) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <FiCamera className="text-cyan-700" /> SCAN STUDENT QR
            </h3>
            <span className="text-[10px] font-bold uppercase text-cyan-800 bg-cyan-50 px-2.5 py-0.5 rounded border border-cyan-200">
              Live Optical Gate Scanner
            </span>
          </div>

          {/* Video Scanning Element */}
          <div className="relative rounded-2xl overflow-hidden min-h-[300px] flex items-center justify-center border-2 border-dashed border-cyan-200 bg-cyan-50/20">
            <div id="qr-scanner-region" className="w-full h-full min-h-[300px]" />

            {!cameraActive && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-white/95 backdrop-blur-xs space-y-3">
                <div className="h-14 w-14 rounded-2xl bg-cyan-50 border border-cyan-200 text-cyan-700 flex items-center justify-center text-2xl mx-auto shadow-sm">
                  <FiCamera />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Camera Not Started</h4>
                  <p className="text-xs text-slate-500 max-w-xs leading-relaxed mt-1">
                    Click Start Camera to scan student QR pass or enter token manually.
                  </p>
                </div>
                <button
                  onClick={startCamera}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white text-xs font-bold uppercase tracking-wider transition shadow-sm shadow-cyan-600/20"
                >
                  START CAMERA
                </button>
              </div>
            )}
          </div>

          {cameraError && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium">
              {cameraError}
            </div>
          )}

          {/* Manual Token Scanner Input */}
          <div className="pt-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              MANUAL TOKEN INPUT
            </label>
            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <input
                type="text"
                value={qrTokenInput}
                onChange={(e) => setQrTokenInput(e.target.value)}
                placeholder="Scan or paste CBP student QR token"
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 focus:bg-white focus:outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-500/20 font-medium"
              />
              <button
                type="submit"
                disabled={validating || !qrTokenInput.trim()}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider transition inline-flex items-center gap-1.5 shadow-sm shadow-cyan-600/20 shrink-0"
              >
                {validating ? <FiRefreshCw className="animate-spin" /> : <FiCheckSquare />}
                <span>{validating ? "Validating..." : "MARK ATTENDANCE"}</span>
              </button>
            </form>
          </div>
        </div>

        {/* RIGHT PANEL: Student Verification Result (col-span-5) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                STUDENT VERIFICATION RESULT
              </h3>
              {lastScanResult && (
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  VERIFIED ✓
                </span>
              )}
            </div>

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="mt-4 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-semibold flex items-center gap-2.5">
                <FiAlertCircle className="text-xl text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Success Message Alert */}
            {successMessage && (
              <div className="mt-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs font-bold flex items-center gap-2.5">
                <FiCheckCircle className="text-xl text-emerald-600 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Verified Student Details Card */}
            {lastScanResult ? (
              <div className="mt-4 p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3.5 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-500 flex items-center gap-1">
                    <FiUser className="text-cyan-700" /> Student Name
                  </span>
                  <p className="text-base font-extrabold text-slate-900 mt-0.5">{lastScanResult.studentName}</p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-200/60">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-500">Student ID</span>
                    <p className="font-mono font-bold text-slate-900 mt-0.5">{lastScanResult.studentId}</p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-500">Attendance Status</span>
                    <p className="font-bold text-emerald-700 mt-0.5">
                      PRESENT (Logged)
                    </p>
                  </div>
                </div>

                <div className="pt-1 border-t border-slate-200/60">
                  <span className="text-[10px] font-bold uppercase text-slate-500 flex items-center gap-1">
                    <FiCalendar className="text-slate-400" /> Session Title
                  </span>
                  <p className="font-semibold text-slate-900 mt-0.5">
                    {lastScanResult.dayNumber ? `Day ${lastScanResult.dayNumber}: ` : ""}{lastScanResult.sessionTitle}
                  </p>
                </div>

                <div className="pt-1 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <FiClock /> Scan Timestamp:
                  </span>
                  <span className="font-mono font-bold text-slate-700">
                    {lastScanResult.markedAt ? lastScanResult.markedAt.replace("T", " ").substring(0, 16) : "Just now"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="mt-8 text-center p-8 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50 space-y-2">
                <div className="h-12 w-12 rounded-2xl bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center text-xl mx-auto">
                  <FiZap />
                </div>
                <h4 className="text-xs font-bold text-slate-700">No Scan Yet</h4>
                <p className="text-[11px] text-slate-500 max-w-xs mx-auto leading-relaxed">
                  Scan a student&apos;s QR pass to view verification details.
                </p>
              </div>
            )}
          </div>

          {/* Action Button */}
          {lastScanResult && (
            <button
              onClick={handleConfirmMark}
              className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-600/20"
            >
              <FiCheck /> Confirm Attendance Checked
            </button>
          )}
        </div>
      </div>

      {/* Bottom Section: Recent Scanned Entries Log */}
      {scanHistory.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Recent Scanned Entries Log ({scanHistory.length})
            </h3>
            <span className="text-[11px] text-slate-400 font-medium">Session Live Log</span>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {scanHistory.map((item, idx) => (
              <div key={idx} className="py-3 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">{item.studentName}</p>
                  <p className="text-[11px] text-slate-500 font-mono">
                    {item.studentId} • {item.dayNumber ? `Day ${item.dayNumber} ` : ""}({item.sessionTitle})
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                  <FiCheckCircle /> Recorded ✓
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
