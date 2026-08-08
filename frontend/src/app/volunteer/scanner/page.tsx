"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { attendanceService } from "@/services/attendanceService"
import { AttendanceSessionDto, ScanAttendanceResponse } from "@/types/attendance"
import { Html5Qrcode } from "html5-qrcode"
import PageTransition from "@/components/animations/PageTransition"
import SidebarNavigation from "@/components/dashboard/SidebarNavigation"
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

export default function VolunteerScannerPage() {
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
      const data = await attendanceService.getAllSessions()
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
      console.warn("Failed to load attendance sessions", err)
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
        setErrorMessage("Invalid QR: Passcode could not be verified in the CBP 7.0 system.")
      }
    } finally {
      setValidating(false)
    }
  }

  const handleConfirmMark = async () => {
    if (!lastScanResult) return
    setSuccessMessage("Attendance verified and committed to CBP 7.0 database ✓")
  }

  const selectedSession = sessions.find((s) => s.id === selectedSessionId)
  const hasSessions = sessions.length > 0
  const isCameraDisabled = !hasSessions || !selectedSessionId || loadingSessions

  return (
    <PageTransition>
      <div className="flex-1 w-full text-slate-900 min-h-[calc(100vh-72px)] relative bg-slate-50">
        <SidebarNavigation />

        <main className="py-8 px-4 sm:px-6 lg:px-8">
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
                <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-50 border border-cyan-200 px-3.5 py-1 text-[11px] font-bold text-cyan-800 uppercase tracking-wider">
                  <FiActivity /> VOLUNTEER CHECK-IN
                </span>
              </div>
            </div>

            {/* Header & Session Selector Card (Institutional White & Blue Card) */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-50 text-cyan-800 border border-cyan-200">
                    <FiCamera /> Gate Access Control
                  </span>
                  <span className="text-[10px] font-mono font-bold text-slate-400">MNIT Jaipur</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                  CBP Attendance <span className="gradient-text-cyan">Scanner</span>
                </h1>
                <p className="mt-1.5 text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl">
                  Official volunteer check-in portal for workshop attendance management.
                </p>
              </div>

              {/* Improved Session Selector & Camera Toggle with Status Indicator */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3 shrink-0">
                <div className="min-w-[240px]">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-700">
                      ACTIVE SESSION
                    </label>
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold">
                      {loadingSessions ? (
                        <span className="text-slate-400">Loading...</span>
                      ) : selectedSession ? (
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                          Active
                        </span>
                      ) : (
                        <span className="text-slate-400 font-medium flex items-center gap-1">
                          <span className="h-2 w-2 rounded-full bg-slate-300" />
                          No Session
                        </span>
                      )}
                    </span>
                  </div>

                  {/* Custom styled select box matching height of START CAMERA button */}
                  <div className="relative">
                    <select
                      disabled={loadingSessions || !hasSessions}
                      value={selectedSessionId}
                      onChange={(e) => setSelectedSessionId(e.target.value)}
                      className={`w-full appearance-none h-11 pl-3.5 pr-10 rounded-xl border text-xs font-bold transition shadow-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/20 ${
                        !hasSessions
                          ? "bg-slate-100/80 border-slate-200 text-slate-400 cursor-not-allowed"
                          : "bg-white border-slate-200 text-slate-900 focus:border-cyan-600 cursor-pointer"
                      }`}
                    >
                      {loadingSessions ? (
                        <option disabled value="">Loading available sessions...</option>
                      ) : !hasSessions ? (
                        <option disabled value="">No Active Session Available</option>
                      ) : (
                        <>
                          <option value="" disabled>Select Active Session</option>
                          {sessions.map((s) => (
                            <option key={s.id} value={s.id}>
                              Day {s.dayNumber} — {s.title} ({s.status})
                            </option>
                          ))}
                        </>
                      )}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
                      <FiChevronDown className="h-4 w-4" />
                    </div>
                  </div>
                </div>

                {/* Camera Toggle Button */}
                <div className="flex items-end">
                  {!cameraActive ? (
                    <button
                      onClick={startCamera}
                      disabled={isCameraDisabled}
                      title={isCameraDisabled ? "Please wait until an admin starts a session." : "Start Live Camera Scanner"}
                      className="w-full sm:w-auto h-11 px-5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 disabled:from-slate-200 disabled:to-slate-300 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-xs font-bold uppercase tracking-wider transition inline-flex items-center justify-center gap-1.5 shadow-sm shadow-cyan-600/20 shrink-0"
                    >
                      <FiVideo /> START CAMERA
                    </button>
                  ) : (
                    <button
                      onClick={stopCamera}
                      className="w-full sm:w-auto h-11 px-5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider transition inline-flex items-center justify-center gap-1.5 shadow-sm shrink-0"
                    >
                      <FiVideoOff /> STOP CAMERA
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Active Session Info Bar or Empty Session Guidance Alert */}
            {selectedSession ? (
              <div className="bg-cyan-50/70 border border-cyan-200 rounded-2xl p-4 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-cyan-950 font-medium shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shrink-0 ring-2 ring-emerald-200" />
                  <span>
                    Venue: <strong className="font-bold text-slate-900">{selectedSession.venue || "MNIT Main Auditorium"}</strong> • (
                    Day {selectedSession.dayNumber} — {selectedSession.title})
                  </span>
                </div>
                <span className="font-mono text-[11px] text-cyan-800 font-bold bg-white px-2.5 py-0.5 rounded-lg border border-cyan-200">
                  Gate Window: {selectedSession.startTime ? selectedSession.startTime.substring(0, 5) : "09:00"} – {selectedSession.endTime ? selectedSession.endTime.substring(0, 5) : "17:00"}
                </span>
              </div>
            ) : (
              <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 text-xs flex items-center gap-3 text-amber-900 shadow-sm">
                <FiInfo className="text-base text-amber-700 shrink-0" />
                <span>
                  No active session is currently selected. Please select a published workshop day from the dropdown above, or wait until an admin activates the session pass.
                </span>
              </div>
            )}

            {/* Dual Panel Scanner Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* LEFT PANEL: Camera Viewfinder (col-span-7) */}
              <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-sm space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                    <FiCamera className="text-cyan-700" /> SCAN STUDENT QR
                  </h2>
                  <span className="text-[10px] font-bold uppercase text-cyan-800 bg-cyan-50 px-2.5 py-0.5 rounded border border-cyan-200">
                    Live Optical Gate Scanner
                  </span>
                </div>

                {/* Video Scanner Container (Clean White UI in Empty State) */}
                <div className="relative rounded-2xl overflow-hidden min-h-[300px] flex items-center justify-center border-2 border-dashed border-cyan-200 bg-cyan-50/20">
                  <div id="volunteer-qr-reader" className="w-full h-full min-h-[300px]" />

                  {!cameraActive && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-white/95 backdrop-blur-xs space-y-3">
                      <div className="h-14 w-14 rounded-2xl bg-cyan-50 border border-cyan-200 text-cyan-700 flex items-center justify-center text-2xl mx-auto shadow-sm">
                        <FiCamera />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">Camera Not Started</h3>
                        <p className="text-xs text-slate-500 max-w-xs leading-relaxed mt-1">
                          Click Start Camera to scan student QR pass or enter token manually.
                        </p>
                      </div>
                      <button
                        onClick={startCamera}
                        disabled={isCameraDisabled}
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 disabled:from-slate-200 disabled:to-slate-300 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-xs font-bold uppercase tracking-wider transition shadow-sm shadow-cyan-600/20"
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
                      disabled={validating || !qrTokenInput.trim() || isCameraDisabled}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 disabled:from-slate-200 disabled:to-slate-300 disabled:text-slate-400 disabled:cursor-not-allowed text-white text-xs font-bold uppercase tracking-wider transition inline-flex items-center gap-1.5 shadow-sm shadow-cyan-600/20 shrink-0"
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
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                      STUDENT VERIFICATION RESULT
                    </h2>
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
                      <h3 className="text-xs font-bold text-slate-700">No Scan Yet</h3>
                      <p className="text-[11px] text-slate-500 max-w-xs mx-auto leading-relaxed">
                        Scan a student&apos;s QR pass to view verification details.
                      </p>
                    </div>
                  )}
                </div>

                {/* Confirm Mark Attendance Action */}
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
        </main>
      </div>
    </PageTransition>
  )
}
