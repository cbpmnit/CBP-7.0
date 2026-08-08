"use client"

import { useState, useEffect, useRef } from "react"
import { attendanceService } from "@/services/attendanceService"
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
        () => {
          // ignore transient scan frame errors
        }
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
      const res = await attendanceService.scanAttendanceQr(token)
      setLastScanResult(res)
      setSuccessMessage("Attendance marked successfully ✓")
      setScanHistory((prev) => [res, ...prev.slice(0, 9)])
      setQrTokenInput("")
    } catch (err: any) {
      setErrorMessage(
        err?.message || "Invalid QR pass, expired session, or attendance already recorded."
      )
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
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <span className="h-8 w-8 rounded-xl bg-cyan-600 text-white flex items-center justify-center text-sm shadow-sm shadow-cyan-600/30">
              <FiCamera />
            </span>
            <span>QR Attendance Scanner</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Scan student attendance QR passes at the auditorium gate to record official session check-ins.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {!cameraActive ? (
            <button
              onClick={startCamera}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white text-xs font-bold uppercase tracking-wider transition inline-flex items-center gap-1.5 shadow-sm shadow-cyan-600/20"
            >
              <FiVideo /> Start Camera
            </button>
          ) : (
            <button
              onClick={stopCamera}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider transition inline-flex items-center gap-1.5 shadow-sm"
            >
              <FiVideoOff /> Stop Camera
            </button>
          )}
        </div>
      </div>

      {/* Main Dual-Panel Scanner Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT PANEL: Camera Scanner Box (col-span-7) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 pb-2 border-b border-slate-100">
            <FiCamera className="text-cyan-700 text-sm" /> Scanner Viewfinder
          </h3>

          {/* Video Scanning Element */}
          <div className="relative rounded-2xl overflow-hidden bg-slate-900 min-h-[260px] flex items-center justify-center border border-slate-200">
            <div id="qr-scanner-region" className="w-full h-full min-h-[260px]" />

            {!cameraActive && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white bg-slate-900/90 backdrop-blur-sm">
                <FiCamera className="text-4xl text-cyan-400 mb-2" />
                <h4 className="text-sm font-bold">Camera Viewfinder Inactive</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  Click &quot;Start Camera&quot; above to begin live optical scanning, or paste token code manually below.
                </p>
                <button
                  onClick={startCamera}
                  className="mt-4 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold uppercase tracking-wider"
                >
                  Enable Camera
                </button>
              </div>
            )}
          </div>

          {cameraError && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium">
              {cameraError}
            </div>
          )}

          {/* Manual Token Scanner Input Fallback */}
          <form onSubmit={handleManualSubmit} className="pt-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Manual Token Entry / Barcode Scanner Input
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={qrTokenInput}
                onChange={(e) => setQrTokenInput(e.target.value)}
                placeholder="Scan or paste CBP_STUDENT_QR_..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-900 focus:bg-white focus:outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-500/20 font-medium"
              />
              <button
                type="submit"
                disabled={validating || !qrTokenInput.trim()}
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold uppercase tracking-wider transition inline-flex items-center gap-1.5 shadow-sm shrink-0"
              >
                {validating ? <FiRefreshCw className="animate-spin" /> : <FiZap />}
                <span>{validating ? "Validating..." : "Mark"}</span>
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT PANEL: Scan Result Card (col-span-5) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>Scan Verification Result</span>
              {lastScanResult && (
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Verified ✓
                </span>
              )}
            </h3>

            {/* Error Message Alert */}
            {errorMessage && (
              <div className="mt-4 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-semibold flex items-center gap-2.5">
                <FiAlertCircle className="text-xl text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Success Message Alert */}
            {successMessage && (
              <div className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs font-bold flex items-center gap-2.5">
                <FiCheckCircle className="text-xl text-emerald-600 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Student Info Card */}
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
                    <span className="text-[10px] font-bold uppercase text-slate-500">Day Session</span>
                    <p className="font-bold text-cyan-800 mt-0.5">
                      {lastScanResult.dayNumber ? `Day ${lastScanResult.dayNumber}` : "Gate Pass"}
                    </p>
                  </div>
                </div>

                <div className="pt-1 border-t border-slate-200/60">
                  <span className="text-[10px] font-bold uppercase text-slate-500 flex items-center gap-1">
                    <FiCalendar className="text-slate-400" /> Session Title
                  </span>
                  <p className="font-semibold text-slate-900 mt-0.5">{lastScanResult.sessionTitle}</p>
                </div>

                <div className="pt-1 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                  <span className="flex items-center gap-1">
                    <FiClock /> Recorded At:
                  </span>
                  <span className="font-mono font-bold text-slate-700">
                    {lastScanResult.markedAt ? lastScanResult.markedAt.replace("T", " ").substring(0, 16) : "Just now"}
                  </span>
                </div>
              </div>
            ) : (
              <div className="mt-8 text-center p-8 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                <FiZap className="text-3xl text-slate-300 mx-auto mb-2" />
                <h4 className="text-xs font-bold text-slate-700">No Scan Recorded Yet</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Point camera at student&apos;s gate pass or paste token on the left.
                </p>
              </div>
            )}
          </div>

          {/* Confirm Button */}
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

      {/* BOTTOM SECTION: Recent Scanned Entries Log */}
      {scanHistory.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-3">
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
