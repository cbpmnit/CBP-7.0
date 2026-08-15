"use client"

import React, { useState, useEffect, useRef } from "react"
import { attendanceApi } from "../services/attendanceApi"
import { AttendanceSessionDto } from "@/types/attendance"
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
  FiVideo,
  FiVideoOff,
  FiCheckSquare,
  FiChevronDown,
  FiInfo,
  FiClock,
  FiXCircle,
  FiShield,
} from "react-icons/fi"

interface ScanResultState {
  type: "success" | "duplicate" | "error" | "expired" | "inactive"
  message: string
  studentId?: string
  studentName?: string
  timestamp: string
}

export default function VolunteerScannerView() {
  const [sessions, setSessions] = useState<AttendanceSessionDto[]>([])
  const [selectedSessionId, setSelectedSessionId] = useState<string>("")
  const [loadingSessions, setLoadingSessions] = useState(true)

  // Scanner state
  const [qrTokenInput, setQrTokenInput] = useState("")
  const [validating, setValidating] = useState(false)
  const [cameraActive, setCameraActive] = useState(false)
  const [cameraStarting, setCameraStarting] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)

  // Scan feedback result (fixed slot, no layout shift)
  const [scanResult, setScanResult] = useState<ScanResultState | null>(null)
  const [scanHistory, setScanHistory] = useState<ScanResultState[]>([])

  const qrScannerRef = useRef<Html5Qrcode | null>(null)
  const scanLockRef = useRef(false)

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
        data = await attendanceApi.getVolunteerSessions()
      } catch {
        data = await attendanceApi.getAllSessions()
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
      setScanResult({
        type: "inactive",
        message: "Please select an active session before scanning.",
        timestamp: new Date().toLocaleTimeString(),
      })
      return
    }

    setCameraError(null)
    setCameraStarting(true)

    try {
      if (!qrScannerRef.current) {
        qrScannerRef.current = new Html5Qrcode("volunteer-qr-reader")
      }

      await qrScannerRef.current.start(
        { facingMode: "environment" },
        {
          fps: 15,
          qrbox: (viewfinderWidth, viewfinderHeight) => {
            const minEdge = Math.min(viewfinderWidth, viewfinderHeight)
            const qrEdge = Math.floor(minEdge * 0.75)
            return { width: Math.max(200, qrEdge), height: Math.max(200, qrEdge) }
          },
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
      setCameraError("Camera access denied or unavailable. Use manual entry below.")
      setCameraActive(false)
    } finally {
      setCameraStarting(false)
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
    if (validating || scanLockRef.current) return
    const cleanToken = token.trim()
    if (!cleanToken) return

    scanLockRef.current = true
    setValidating(true)

    // Optional haptic feedback
    if (typeof window !== "undefined" && navigator.vibrate) {
      try {
        navigator.vibrate(50)
      } catch {}
    }

    try {
      const result: any = await attendanceApi.scanAttendance({
        sessionId: selectedSessionId,
        qrToken: cleanToken,
      })

      const studentId = result.studentId || result.data?.studentId || "Student"
      const studentName = result.studentName || result.data?.studentName || ""
      const newEntry: ScanResultState = {
        type: "success",
        message: `Attendance recorded for ${studentId}`,
        studentId,
        studentName,
        timestamp: new Date().toLocaleTimeString(),
      }

      setScanResult(newEntry)
      setScanHistory((prev) => [newEntry, ...prev.slice(0, 14)])
    } catch (err: any) {
      const rawMsg =
        err?.response?.data?.message ||
        err?.errorData?.message ||
        err?.message ||
        "Verification failed"

      let errType: ScanResultState["type"] = "error"
      let userFriendlyMsg = rawMsg

      if (rawMsg.toLowerCase().includes("already marked") || rawMsg.toLowerCase().includes("duplicate")) {
        errType = "duplicate"
        userFriendlyMsg = "Attendance already recorded for this session"
      } else if (rawMsg.toLowerCase().includes("expired")) {
        errType = "expired"
        userFriendlyMsg = "QR pass has expired for this session"
      } else if (rawMsg.toLowerCase().includes("not active")) {
        errType = "inactive"
        userFriendlyMsg = "Selected session is currently not active"
      } else if (rawMsg.toLowerCase().includes("invalid") || rawMsg.toLowerCase().includes("not found")) {
        errType = "error"
        userFriendlyMsg = "Invalid or unrecognized student QR pass"
      }

      const failEntry: ScanResultState = {
        type: errType,
        message: userFriendlyMsg,
        timestamp: new Date().toLocaleTimeString(),
      }

      setScanResult(failEntry)
    } finally {
      setValidating(false)
      // Unlock scanning after 1.8 seconds cooldown to allow next student without stopping camera
      setTimeout(() => {
        scanLockRef.current = false
      }, 1800)
    }
  }

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!qrTokenInput.trim()) return
    handleTokenScanned(qrTokenInput)
    setQrTokenInput("")
  }

  const selectedSession = sessions.find((s) => s.id === selectedSessionId)
  const isSessionActive = selectedSession?.status === "ACTIVE"

  return (
    <PageTransition>
      <PermissionGuard requiredPermission="ATTENDANCE_SCAN">
        <div className="max-w-xl mx-auto px-4 py-4 sm:py-6 space-y-4">
          {/* 1. Minimal Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white flex items-center justify-center text-sm shadow-2xs">
                <FiCamera />
              </div>
              <div>
                <h1 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                  Attendance Scanner
                </h1>
                <p className="text-[11px] text-slate-500">Scan student passes for workshop check-in</p>
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Scanner Ready
            </span>
          </div>

          {/* 2. Session Selector */}
          <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <FiCalendar className="text-cyan-700" /> Active Session
              </label>
              <button
                onClick={fetchActiveSessions}
                className="text-[11px] font-semibold text-slate-500 hover:text-cyan-700 flex items-center gap-1 cursor-pointer"
              >
                <FiRefreshCw className={loadingSessions ? "animate-spin text-[10px]" : "text-[10px]"} />
                Refresh
              </button>
            </div>

            {loadingSessions ? (
              <div className="h-9 rounded-xl bg-slate-100 animate-pulse" />
            ) : sessions.length === 0 ? (
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-xs font-semibold flex items-center gap-2">
                <FiInfo className="text-amber-600 shrink-0" />
                <span>No active workshop sessions found.</span>
              </div>
            ) : (
              <div className="relative">
                <select
                  value={selectedSessionId}
                  onChange={(e) => {
                    setSelectedSessionId(e.target.value)
                    setScanResult(null)
                  }}
                  className="w-full appearance-none px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-cyan-600 cursor-pointer pr-8"
                >
                  {sessions.map((s) => (
                    <option key={s.id} value={s.id}>
                      Day {(s as any).dayNumber || (s as any).day || 1}: {s.title} &mdash; [{s.status}]
                    </option>
                  ))}
                </select>
                <FiChevronDown className="absolute right-3 top-3 text-slate-400 text-xs pointer-events-none" />
              </div>
            )}
          </div>

          {/* 3. Full-Width Mobile-Optimized Camera Viewport */}
          <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <FiCamera className="text-cyan-700 text-sm" /> Camera Scanner
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono">
                {cameraActive ? "Camera Live" : "Standby"}
              </span>
            </div>

            <div className="relative overflow-hidden rounded-xl bg-slate-950 min-h-[260px] sm:min-h-[300px] flex items-center justify-center border border-slate-800">
              <div id="volunteer-qr-reader" className="w-full text-white text-center" />

              {!cameraActive && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/90 text-center p-4 space-y-3">
                  <div className="h-12 w-12 rounded-2xl bg-slate-800 text-slate-400 flex items-center justify-center text-2xl shadow-inner">
                    <FiVideoOff />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-200">Camera Scanner Off</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Point camera at student QR code for instant check-in
                    </p>
                  </div>
                  <button
                    onClick={startCamera}
                    disabled={!selectedSessionId || loadingSessions || cameraStarting}
                    className="px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold uppercase tracking-wider transition shadow-sm disabled:opacity-40 inline-flex items-center gap-2 cursor-pointer"
                  >
                    {cameraStarting ? (
                      <FiRefreshCw className="animate-spin text-xs" />
                    ) : (
                      <FiVideo className="text-xs" />
                    )}
                    <span>{cameraStarting ? "Starting..." : "Start Camera"}</span>
                  </button>
                </div>
              )}

              {/* Scanning Active Overlay Box */}
              {cameraActive && validating && (
                <div className="absolute inset-0 bg-cyan-950/40 backdrop-blur-[2px] flex items-center justify-center text-white text-xs font-bold gap-2">
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Pass...</span>
                </div>
              )}
            </div>

            {cameraActive && (
              <button
                onClick={stopCamera}
                className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider transition inline-flex items-center justify-center gap-1.5 border border-slate-200 cursor-pointer"
              >
                <FiVideoOff className="text-xs" /> Stop Camera
              </button>
            )}

            {cameraError && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-semibold flex items-center gap-2">
                <FiAlertCircle className="text-rose-600 shrink-0" />
                <span>{cameraError}</span>
              </div>
            )}
          </div>

          {/* 4. Reserved Inline Scan Result Slot (Zero Layout Shift) */}
          <div className="min-h-[64px] transition-all duration-200">
            {scanResult ? (
              <div
                className={`p-3.5 rounded-2xl border transition-all duration-200 flex items-center justify-between gap-3 shadow-xs ${
                  scanResult.type === "success"
                    ? "bg-emerald-50 border-emerald-200 text-emerald-950"
                    : scanResult.type === "duplicate"
                    ? "bg-amber-50 border-amber-200 text-amber-950"
                    : "bg-rose-50 border-rose-200 text-rose-950"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="text-lg shrink-0">
                    {scanResult.type === "success" && <FiCheckCircle className="text-emerald-600" />}
                    {scanResult.type === "duplicate" && <FiAlertCircle className="text-amber-600" />}
                    {scanResult.type !== "success" && scanResult.type !== "duplicate" && (
                      <FiXCircle className="text-rose-600" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-black truncate">
                      {scanResult.studentId ? `Student: ${scanResult.studentId}` : scanResult.message}
                    </h4>
                    {scanResult.studentId && (
                      <p className="text-[11px] text-slate-600 font-medium truncate">
                        {scanResult.studentName || scanResult.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase ${
                      scanResult.type === "success"
                        ? "bg-emerald-200/80 text-emerald-900"
                        : scanResult.type === "duplicate"
                        ? "bg-amber-200/80 text-amber-900"
                        : "bg-rose-200/80 text-rose-900"
                    }`}
                  >
                    {scanResult.type === "success"
                      ? "Verified ✓"
                      : scanResult.type === "duplicate"
                      ? "Duplicate"
                      : "Failed"}
                  </span>
                  <span className="block text-[10px] font-mono text-slate-500 mt-0.5">
                    {scanResult.timestamp}
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center text-slate-400 text-xs">
                Scan student QR pass to verify check-in
              </div>
            )}
          </div>

          {/* 5. Manual Entry Fallback */}
          <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs space-y-2">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <FiZap className="text-amber-600" /> Manual Token Entry
            </h3>
            <form onSubmit={handleManualSubmit} className="flex gap-2">
              <input
                type="text"
                value={qrTokenInput}
                onChange={(e) => setQrTokenInput(e.target.value)}
                placeholder="Enter token string or Student ID..."
                className="flex-1 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-cyan-600"
              />
              <button
                type="submit"
                disabled={validating || !qrTokenInput.trim() || !selectedSessionId}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider shadow-2xs transition inline-flex items-center gap-1.5 disabled:opacity-40 shrink-0 cursor-pointer"
              >
                {validating ? <FiRefreshCw className="animate-spin text-xs" /> : <FiCheckSquare className="text-xs" />}
                <span>Verify</span>
              </button>
            </form>
          </div>

          {/* 6. Recent Scan History */}
          {scanHistory.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <FiClock className="text-cyan-700 text-xs" /> Recent Session Scans
                </span>
                <span className="text-[10px] font-mono text-slate-400">({scanHistory.length})</span>
              </div>

              <div className="space-y-1.5 max-h-[200px] overflow-y-auto pr-1">
                {scanHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                  >
                    <div className="min-w-0 mr-2">
                      <p className="font-bold text-slate-900 font-mono truncate">
                        {item.studentId || "Student Pass"}
                      </p>
                      <p className="text-[10px] font-mono text-slate-500">{item.timestamp}</p>
                    </div>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0 font-mono">
                      <FiCheckCircle className="text-emerald-600" /> Present
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </PermissionGuard>
    </PageTransition>
  )
}
