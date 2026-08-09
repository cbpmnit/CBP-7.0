"use client"

import React, { useState, useEffect, useRef } from "react"
import { attendanceService } from "@/services/attendanceService"
import { AttendanceSessionDto, AttendanceRecordResponse } from "@/types/attendance"
import { Html5Qrcode } from "html5-qrcode"
import PageTransition from "@/components/animations/PageTransition"
import PermissionGuard from "@/components/auth/PermissionGuard"
import { PageHeader } from "@/components/ui/PageHeader"
import {
  FiCamera,
  FiCheckCircle,
  FiAlertCircle,
  FiRefreshCw,
  FiZap,
  FiUser,
  FiCalendar,
  FiVideo,
  FiVideoOff,
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
  const [lastScanResult, setLastScanResult] = useState<AttendanceRecordResponse | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [scanHistory, setScanHistory] = useState<AttendanceRecordResponse[]>([])

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
      console.error("Failed to load volunteer attendance sessions", err)
      setSessions([])
      setSelectedSessionId("")
    } finally {
      setLoadingSessions(false)
    }
  }

  const startCamera = async () => {
    if (!selectedSessionId) {
      setErrorMessage("Please select an active session before starting the camera.")
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
          aspectRatio: 1.0,
        },
        (decodedText) => {
          handleTokenScanned(decodedText)
        },
        () => {}
      )
      setCameraActive(true)
    } catch (err: any) {
      console.error("Camera scanner failed to start", err)
      setCameraError("Camera access denied or unavailable. Please use manual input below.")
      setCameraActive(false)
    }
  }

  const stopCamera = async () => {
    if (qrScannerRef.current && cameraActive) {
      try {
        await qrScannerRef.current.stop()
        setCameraActive(false)
      } catch (err) {
        console.error("Failed to stop camera stream", err)
      }
    }
  }

  const handleTokenScanned = async (token: string) => {
    if (validating) return
    const cleanToken = token.trim()
    if (!cleanToken) return

    setValidating(true)
    setErrorMessage(null)
    setSuccessMessage(null)

    try {
      const result = await attendanceService.scanAttendance({
        sessionId: selectedSessionId,
        qrToken: cleanToken,
      })

      setLastScanResult(result)
      setSuccessMessage(`Attendance verified for Student: ${result.studentId}`)
      setScanHistory((prev) => [result, ...prev.slice(0, 19)])
    } catch (err: any) {
      console.error("Scan verification failed", err)
      setErrorMessage(err?.response?.data?.message || err?.message || "Invalid QR token or attendance error.")
    } finally {
      setValidating(false)
    }
  }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!qrTokenInput.trim()) return
    handleTokenScanned(qrTokenInput)
    setQrTokenInput("")
  }

  const isCameraDisabled = !selectedSessionId || loadingSessions

  return (
    <PageTransition>
      <PermissionGuard requiredPermission="ATTENDANCE_SCAN">
        <div className="space-y-4">
          {/* Header */}
          <PageHeader
            title="Attendance Scanner"
            subtitle="Scan student gate passes and record workshop check-ins"
            actions={
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Scanner Operational
              </span>
            }
          />

          {/* Feedback Alerts */}
          {successMessage && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2">
              <FiCheckCircle className="text-base text-emerald-600 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 text-xs font-bold flex items-center gap-2">
              <FiAlertCircle className="text-base text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Scanner Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Left 2 Columns: Session Selector & Camera */}
            <div className="lg:col-span-2 space-y-4">
              {/* Session Selector */}
              <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <FiCalendar className="text-cyan-700" /> Active Session
                  </label>
                  <button
                    onClick={fetchActiveSessions}
                    className="text-xs font-semibold text-slate-500 hover:text-cyan-700 flex items-center gap-1 cursor-pointer"
                  >
                    <FiRefreshCw className={loadingSessions ? "animate-spin text-xs" : "text-xs"} /> Refresh
                  </button>
                </div>

                {loadingSessions ? (
                  <div className="h-9 rounded-lg bg-slate-100 animate-pulse" />
                ) : sessions.length === 0 ? (
                  <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-950 text-xs font-semibold flex items-center gap-2">
                    <FiInfo className="text-amber-600 shrink-0" />
                    <span>No active sessions available.</span>
                  </div>
                ) : (
                  <div className="relative">
                    <select
                      value={selectedSessionId}
                      onChange={(e) => setSelectedSessionId(e.target.value)}
                      className="w-full appearance-none px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-cyan-600 cursor-pointer"
                    >
                      {sessions.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.title || (s as any).sessionName || "Session"} ({(s as any).date || "Today"}) &mdash; [{s.status}]
                        </option>
                      ))}
                    </select>
                    <FiChevronDown className="absolute right-3 top-3 text-slate-400 text-xs pointer-events-none" />
                  </div>
                )}
              </div>

              {/* Camera Scanner Viewport */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                    <FiCamera className="text-cyan-700" /> Camera Feed
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-mono">
                    {cameraActive ? "Live Feed" : "Standby"}
                  </span>
                </div>

                <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-950 min-h-[240px] flex items-center justify-center p-3">
                  <div id="volunteer-qr-reader" className="w-full text-white text-center" />
                  {!cameraActive && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/85 text-center p-4 space-y-2.5">
                      <div className="h-10 w-10 rounded-lg bg-slate-800 text-slate-400 flex items-center justify-center text-xl">
                        <FiVideoOff />
                      </div>
                      <p className="text-xs text-slate-400">Position student QR code within camera frame</p>
                      <button
                        onClick={startCamera}
                        disabled={isCameraDisabled}
                        className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold uppercase tracking-wider transition shadow-2xs disabled:opacity-40 inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <FiVideo className="text-xs" /> Start Camera
                      </button>
                    </div>
                  )}
                </div>

                {cameraActive && (
                  <button
                    onClick={stopCamera}
                    className="w-full py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider transition inline-flex items-center justify-center gap-1.5 border border-slate-200 cursor-pointer"
                  >
                    <FiVideoOff className="text-xs" /> Stop Camera
                  </button>
                )}

                {cameraError && (
                  <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 text-xs font-semibold">
                    {cameraError}
                  </div>
                )}
              </div>

              {/* Manual Input Fallback */}
              <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <FiZap className="text-amber-600" /> Manual Token Entry
                </h3>
                <form onSubmit={handleManualSubmit} className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={qrTokenInput}
                    onChange={(e) => setQrTokenInput(e.target.value)}
                    placeholder="Enter token string or Student ID..."
                    className="w-full sm:flex-1 px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-cyan-600"
                  />
                  <button
                    type="submit"
                    disabled={validating || !qrTokenInput.trim() || isCameraDisabled}
                    className="w-full sm:w-auto px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider shadow-2xs transition inline-flex items-center justify-center gap-1.5 disabled:opacity-50 shrink-0 cursor-pointer"
                  >
                    {validating ? <FiRefreshCw className="animate-spin text-xs" /> : <FiCheckSquare className="text-xs" />}
                    <span>{validating ? "Checking..." : "Verify Pass"}</span>
                  </button>
                </form>
              </div>
            </div>

            {/* Right Column: Scan Result & Recent Scans */}
            <div className="space-y-4">
              {/* Latest Result */}
              <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs space-y-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5 pb-2 border-b border-slate-100">
                  <FiUser className="text-cyan-700" /> Latest Scan Result
                </h3>

                {!lastScanResult ? (
                  <div className="py-6 text-center text-slate-400 space-y-1">
                    <p className="text-xs font-semibold text-slate-600">Awaiting Scan</p>
                    <p className="text-[11px] text-slate-400">Scanned student details will appear here</p>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-950">
                      <span className="text-[10px] font-bold font-mono uppercase tracking-wider bg-emerald-200 text-emerald-900 px-2 py-0.2 rounded">
                        Verified ✓
                      </span>
                      <h4 className="text-xs font-extrabold text-slate-900 mt-1.5 truncate">
                        Student ID: {lastScanResult.studentId}
                      </h4>
                      <p className="text-[11px] font-mono font-bold text-slate-600">
                        Status: {lastScanResult.status}
                      </p>
                    </div>

                    <div className="space-y-1 text-xs">
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">Recorded:</span>
                        <span className="font-bold text-slate-900 font-mono">
                          {lastScanResult.markedAt ? new Date(lastScanResult.markedAt).toLocaleTimeString() : "Just now"}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-100">
                        <span className="text-slate-500">Channel:</span>
                        <span className="font-bold text-emerald-700 font-mono">QR_SCAN ✓</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Recent History */}
              {scanHistory.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs space-y-2.5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between pb-2 border-b border-slate-100">
                    <span>Recent Scans</span>
                    <span className="text-[10px] font-mono text-slate-400">({scanHistory.length})</span>
                  </h3>
                  <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-1">
                    {scanHistory.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-2 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                      >
                        <div className="min-w-0 mr-2">
                          <p className="font-bold text-slate-900 font-mono truncate">ID: {item.studentId}</p>
                          <p className="text-[10px] font-mono text-slate-500">
                            {item.markedAt ? new Date(item.markedAt).toLocaleTimeString() : "Recorded"}
                          </p>
                        </div>
                        <span className="inline-flex items-center gap-1 px-2 py-0.2 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0 font-mono">
                          <FiCheckCircle /> Present
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
    </PageTransition>
  )
}
