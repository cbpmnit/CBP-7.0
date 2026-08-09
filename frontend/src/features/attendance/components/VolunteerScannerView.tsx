"use client"

import React, { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { attendanceService } from "@/services/attendanceService"
import { AttendanceSessionDto, ScanAttendanceResponse } from "@/types/attendance"
import { Html5Qrcode } from "html5-qrcode"
import PageTransition from "@/components/animations/PageTransition"
import PermissionGuard from "@/components/auth/PermissionGuard"
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
  FiArrowLeft,
  FiActivity,
  FiCheckSquare,
  FiChevronDown,
  FiInfo,
} from "react-icons/fi"

export default function VolunteerScannerView() {
  const [sessions, setSessions] = useState<AttendanceSessionDto[]>([])
  const [selectedSessionId, setSelectedSessionId] = useState<string>("")
  const [loadingSessions, setLoadingSessions] = useState(true)

  // Scanner state
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
    fetchActiveSessions()
    return () => {
      stopCamera()
    }
  }, [])

  const fetchActiveSessions = async () => {
    setLoadingSessions(true)
    try {
      let data: AttendanceSessionDto[] = []
      try {
        data = await attendanceService.getVolunteerSessions()
      } catch {
        data = await attendanceService.getAllSessions()
      }
      const list = data || []
      setSessions(list)
      const active = list.find((s) => s.status === "ACTIVE")
      if (active) {
        setSelectedSessionId(active.id)
      } else if (list.length > 0) {
        setSelectedSessionId(list[0].id)
      } else {
        setSelectedSessionId("")
      }
    } catch (err) {
      console.error("API authorization failure: Failed to load volunteer attendance sessions", err)
      setSessions([])
      setSelectedSessionId("")
    } finally {
      setLoadingSessions(false)
    }
  }

  const startCamera = async () => {
    if (!selectedSessionId) {
      setErrorMessage("Please select an active session before starting the camera scanner.")
      return
    }

    setCameraError(null)
    setErrorMessage(null)
    try {
      if (!qrScannerRef.current) {
        qrScannerRef.current = new Html5Qrcode("volunteer-qr-reader")
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
        err?.message || "Unable to access video camera. You can scan or type QR tokens manually below."
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
    if (!selectedSessionId) {
      setErrorMessage("Please select an active session before submitting a token.")
      return
    }
    processToken(qrTokenInput.trim())
  }

  const processToken = async (token: string) => {
    setValidating(true)
    setErrorMessage(null)
    setSuccessMessage(null)
    try {
      const res = await attendanceService.scanAttendanceQr(token)
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
        setErrorMessage(msg)
      }
    } finally {
      setValidating(false)
    }
  }

  const selectedSession = sessions.find((s) => s.id === selectedSessionId)
  const hasSessions = sessions.length > 0
  const isCameraDisabled = !hasSessions || !selectedSessionId || loadingSessions

  return (
    <PageTransition>
      <main className="py-8 px-4 sm:px-6 lg:px-8">
        <PermissionGuard requiredPermission="ATTENDANCE_SCAN">
          <div className="mx-auto max-w-6xl space-y-6">
            {/* Top Navigation Bar */}
            <div className="flex items-center justify-between">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 px-4 py-2 text-xs font-bold uppercase tracking-wider transition shadow-sm"
              >
                <FiArrowLeft /> Return Home
              </Link>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold text-cyan-800 bg-cyan-50 px-3.5 py-1 rounded-full border border-cyan-200 uppercase tracking-wider">
                  Volunteer Operations Gate Pass
                </span>
              </div>
            </div>

            {/* Header Banner */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-cyan-50 text-cyan-800 border border-cyan-200">
                    <FiZap /> Real-Time Gate Pass Verification
                  </span>
                  <span className="text-[10px] font-mono font-bold text-slate-400">MNIT Jaipur</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                  Volunteer Attendance <span className="gradient-text-cyan">Scanner</span>
                </h1>
                <p className="mt-1.5 text-xs sm:text-sm text-slate-600 leading-relaxed max-w-2xl">
                  Scan dynamic student gate QR passes via live camera, verify token HMAC signatures, and log attendance entries.
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-start md:self-center">
                <div className="px-4 py-2.5 rounded-2xl bg-slate-900 text-white text-xs font-mono font-bold flex items-center gap-2 shadow-sm">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Scanner Online</span>
                </div>
              </div>
            </div>

            {/* Error & Success Feedback Alerts */}
            {successMessage && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-extrabold flex items-center gap-3 shadow-sm">
                <FiCheckCircle className="text-xl text-emerald-600 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {errorMessage && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-extrabold flex items-center gap-3 shadow-sm">
                <FiAlertCircle className="text-xl text-rose-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* MAIN SCANNER GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left 2 Columns: Session Selector + Camera / Manual Token Box */}
              <div className="lg:col-span-2 space-y-6">
                {/* Session Selector Card */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                      <FiCalendar className="text-cyan-600" /> Active Workshop Session <span className="text-cyan-600">*</span>
                    </label>
                    <button
                      onClick={fetchActiveSessions}
                      className="text-[11px] font-bold text-slate-500 hover:text-cyan-700 flex items-center gap-1"
                    >
                      <FiRefreshCw className={loadingSessions ? "animate-spin" : ""} /> Refresh
                    </button>
                  </div>

                  {loadingSessions ? (
                    <div className="h-11 rounded-2xl bg-slate-100 animate-pulse" />
                  ) : !hasSessions ? (
                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs font-bold flex items-center gap-2">
                      <FiInfo className="text-base text-amber-600 shrink-0" />
                      <span>No active attendance sessions currently available. Contact admin.</span>
                    </div>
                  ) : (
                    <div className="relative">
                      <select
                        value={selectedSessionId}
                        onChange={(e) => setSelectedSessionId(e.target.value)}
                        className="w-full appearance-none px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-extrabold text-slate-900 focus:bg-white focus:outline-none focus:border-cyan-600"
                      >
                        {sessions.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.title || (s as any).sessionName || (s as any).topic} ({(s as any).date || (s as any).sessionDate || "Today"}) — [{s.status}]
                          </option>
                        ))}
                      </select>
                      <FiChevronDown className="absolute right-4 top-4 text-slate-400 text-xs pointer-events-none" />
                    </div>
                  )}

                  {selectedSession && (
                    <div className="p-3 rounded-2xl bg-cyan-50/50 border border-cyan-100 flex items-center justify-between text-xs">
                      <span className="text-slate-600 font-medium">Session Time Window:</span>
                      <span className="font-mono font-bold text-cyan-900">
                        {selectedSession.startTime || "09:00 AM"} &ndash; {selectedSession.endTime || "05:00 PM"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Camera Scanner Viewport Card */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                      <FiCamera className="text-cyan-600 text-sm" /> 1. Live Camera QR Viewport
                    </h3>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full border border-slate-200">
                      Camera Stream
                    </span>
                  </div>

                  {/* HTML5 QR Code Container */}
                  <div className="relative overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-slate-900 min-h-[280px] flex items-center justify-center p-4">
                    <div id="volunteer-qr-reader" className="w-full text-white text-center" />
                    {!cameraActive && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/80 text-center p-6 space-y-3">
                        <div className="h-14 w-14 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center text-3xl">
                          <FiVideoOff />
                        </div>
                        <div>
                          <h4 className="text-xs font-extrabold text-white">Camera Offline</h4>
                          <p className="text-[11px] text-slate-400 max-w-xs mt-0.5">
                            Click Start Camera to initialize video feed and scan student gate pass QR codes.
                          </p>
                        </div>
                        <button
                          onClick={startCamera}
                          disabled={isCameraDisabled}
                          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white text-xs font-bold uppercase tracking-wider transition shadow-sm shadow-cyan-600/20 disabled:opacity-40 inline-flex items-center gap-2"
                        >
                          <FiVideo /> Start Camera
                        </button>
                      </div>
                    )}
                  </div>

                  {cameraActive && (
                    <button
                      onClick={stopCamera}
                      className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider transition inline-flex items-center justify-center gap-1.5 border border-slate-200"
                    >
                      <FiVideoOff /> Turn Off Camera Stream
                    </button>
                  )}

                  {cameraError && (
                    <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-semibold">
                      {cameraError}
                    </div>
                  )}
                </div>

                {/* Manual Token Input Fallback Card */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-100">
                    <FiZap className="text-amber-600 text-sm" /> 2. Manual Token / USB Scanner Input
                  </h3>

                  <form onSubmit={handleManualSubmit} className="space-y-3">
                    <div>
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Encrypted Gate Pass Token <span className="text-cyan-600">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={qrTokenInput}
                          onChange={(e) => setQrTokenInput(e.target.value)}
                          placeholder="Paste or scan token (e.g. CBP7-PASS-xxx)"
                          className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-cyan-600"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={validating || !qrTokenInput.trim() || isCameraDisabled}
                      className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider shadow-sm transition inline-flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {validating ? <FiRefreshCw className="animate-spin" /> : <FiCheckSquare />}
                      <span>{validating ? "Validating Token..." : "Validate & Record Attendance"}</span>
                    </button>
                  </form>
                </div>
              </div>

              {/* Right 1 Column: Real-time Scan Result & Recent History Sidebar */}
              <div className="space-y-6">
                {/* Last Scanned Result Dossier Card */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2 pb-3 border-b border-slate-100">
                    <FiUser className="text-cyan-600 text-sm" /> Latest Scan Verification
                  </h3>

                  {!lastScanResult ? (
                    <div className="p-8 text-center text-slate-400 space-y-2">
                      <FiActivity className="text-3xl mx-auto text-slate-300" />
                      <p className="text-xs font-extrabold text-slate-600">Awaiting Scan</p>
                      <p className="text-[11px] text-slate-400">
                        Scanned gate pass details will appear here in real-time.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider bg-emerald-200 text-emerald-950 px-2 py-0.5 rounded">
                            Verified ✓
                          </span>
                          <span className="text-[10px] font-mono text-emerald-800">
                            {new Date().toLocaleTimeString()}
                          </span>
                        </div>
                        <h4 className="text-base font-extrabold text-slate-900">
                          {lastScanResult.studentName || "Student Participant"}
                        </h4>
                        <p className="text-xs font-mono font-bold text-slate-700">
                          ID: {lastScanResult.studentId}
                        </p>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between py-1 border-b border-slate-100">
                          <span className="text-slate-500">Session Name:</span>
                          <span className="font-bold text-slate-900">
                            {lastScanResult.sessionName || selectedSession?.title || (selectedSession as any)?.sessionName}
                          </span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-100">
                          <span className="text-slate-500">Status:</span>
                          <span className="font-extrabold text-emerald-700">
                            {lastScanResult.status || "PRESENT"}
                          </span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-100">
                          <span className="text-slate-500">Attendance Rate:</span>
                          <span className="font-mono font-bold text-cyan-800">
                            {lastScanResult.attendancePercentage
                              ? `${lastScanResult.attendancePercentage.toFixed(1)}%`
                              : "Updated"}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Live Activity Log */}
                {scanHistory.length > 0 && (
                  <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-3">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-800 flex items-center justify-between pb-3 border-b border-slate-100">
                      <span>Recent Live Scans</span>
                      <span className="text-[10px] font-mono text-slate-400">({scanHistory.length})</span>
                    </h3>

                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                      {scanHistory.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                        >
                          <div>
                            <p className="font-extrabold text-slate-900">{item.studentName || item.studentId}</p>
                            <p className="text-[10px] font-mono text-slate-500">{item.studentId}</p>
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
            </div>
          </div>
        </PermissionGuard>
      </main>
    </PageTransition>
  )
}
