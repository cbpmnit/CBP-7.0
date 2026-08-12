"use client"

import { useState, useEffect } from "react"
import { attendanceService } from "@/services/attendanceService"
import {
  AttendanceSessionDto,
  StudentAttendanceSummaryResponse,
  StudentSessionQrResponse,
} from "@/types/attendance"
import {
  FiCalendar,
  FiClock,
  FiMapPin,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle,
  FiRefreshCw,
  FiCamera,
  FiCopy,
  FiCheck,
  FiChevronDown,
  FiLayers,
  FiX,
} from "react-icons/fi"

export default function StudentAttendanceView() {
  const [loading, setLoading] = useState(true)
  const [upcomingSession, setUpcomingSession] = useState<AttendanceSessionDto | null>(null)
  const [historySummary, setHistorySummary] = useState<StudentAttendanceSummaryResponse | null>(null)
  const [availableQrs, setAvailableQrs] = useState<StudentSessionQrResponse[]>([])
  const [selectedQrIndex, setSelectedQrIndex] = useState(0)
  const [copiedToken, setCopiedToken] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isPassModalOpen, setIsPassModalOpen] = useState(false)

  useEffect(() => {
    fetchStudentData(true)

    // Keep QR pass & records updated in background
    const interval = setInterval(() => {
      fetchStudentData(false)
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  const fetchStudentData = async (isInitial = true) => {
    if (isInitial) {
      setLoading(true)
    }
    setErrorMessage(null)
    try {
      const [upcomingRes, historyRes, qrsRes, singleQrRes] = await Promise.allSettled([
        attendanceService.getUpcomingSession(),
        attendanceService.getMyAttendance(),
        attendanceService.getMyActiveAttendanceQrs(),
        attendanceService.getMyActiveAttendanceQr(),
      ])

      if (upcomingRes.status === "fulfilled") {
        setUpcomingSession(upcomingRes.value)
      }

      if (historyRes.status === "fulfilled") {
        setHistorySummary(historyRes.value)
      }

      let qrs: StudentSessionQrResponse[] = []
      if (qrsRes.status === "fulfilled" && Array.isArray(qrsRes.value) && qrsRes.value.length > 0) {
        qrs = qrsRes.value
      } else if (singleQrRes.status === "fulfilled" && singleQrRes.value) {
        qrs = [singleQrRes.value]
      }

      setAvailableQrs(qrs)
      setSelectedQrIndex((prev) => (prev >= qrs.length ? 0 : prev))
    } catch (err: any) {
      if (isInitial) {
        setErrorMessage("Unable to load attendance details right now.")
      }
    } finally {
      if (isInitial) {
        setLoading(false)
      }
    }
  }

  const activeQr = availableQrs[selectedQrIndex] || availableQrs[0] || null

  const handleCopyToken = () => {
    if (!activeQr?.token) return
    navigator.clipboard.writeText(activeQr.token)
    setCopiedToken(true)
    setTimeout(() => setCopiedToken(false), 2000)
  }

  const formatTimeRange = (start?: string | null, end?: string | null) => {
    if (!start && !end) return "09:30 AM - 04:30 PM"
    if (start && end) return `${start} - ${end}`
    return start || end || ""
  }

  const formatMarkedTime = (isoString?: string | null) => {
    if (!isoString) return "—"
    try {
      const d = new Date(isoString)
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } catch {
      return isoString
    }
  }

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500 shadow-2xs max-w-4xl mx-auto">
        <div className="h-7 w-7 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs font-semibold">Loading your QR pass...</p>
      </div>
    )
  }

  const totalSessions = historySummary?.totalSessions ?? 0
  const presentCount = historySummary?.attendedSessions ?? 0
  const percentage = historySummary?.attendancePercentage ?? 0
  const records = historySummary?.sessions || []

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {errorMessage && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FiAlertCircle className="shrink-0 text-base text-amber-600" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => fetchStudentData(true)}
            className="inline-flex items-center gap-1 font-bold underline hover:text-amber-950 text-xs cursor-pointer"
          >
            <FiRefreshCw className="text-[10px]" /> Retry
          </button>
        </div>
      )}

      {/* 1. Desktop Session Selector (Visible on Desktop >= md only when >1 passes exist) */}
      {availableQrs.length > 1 && (
        <div className="hidden md:flex items-center justify-between gap-3 p-1">
          <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <FiLayers className="text-cyan-700" />
            <span>Switch Session:</span>
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            {availableQrs.map((qr, idx) => {
              const isSelected = selectedQrIndex === idx
              return (
                <button
                  key={qr.token || idx}
                  onClick={() => {
                    setSelectedQrIndex(idx)
                    setCopiedToken(false)
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border cursor-pointer ${
                    isSelected
                      ? "bg-cyan-50 text-cyan-950 border-cyan-500 shadow-2xs"
                      : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {isSelected ? (
                    <FiCheck className="text-cyan-700 text-xs shrink-0" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0" />
                  )}
                  <span>Day {qr.dayNumber}</span>
                  <span className="text-slate-300">&bull;</span>
                  <span className="font-semibold text-slate-800">{qr.title}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* 2. Hero Student Attendance QR Pass */}
      {activeQr ? (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
          {/* Card Top Bar with Quick Switch Option */}
          <div className="px-4 sm:px-5 py-3 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs font-extrabold uppercase tracking-wider text-cyan-900 bg-cyan-100/70 px-2.5 py-0.5 rounded-full border border-cyan-200 font-mono shrink-0">
                Day {activeQr.dayNumber}
              </span>
              <span className="text-xs font-bold text-slate-800 truncate hidden sm:inline">
                {activeQr.title}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Quick Switch Session Trigger for Mobile & Desktop */}
              {availableQrs.length > 1 && (
                <button
                  onClick={() => setIsPassModalOpen(true)}
                  className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1 shadow-2xs transition cursor-pointer md:hidden active:scale-98"
                  title="Switch to another session pass"
                >
                  <FiLayers className="text-cyan-700 text-xs" />
                  <span>Switch Session</span>
                  <FiChevronDown className="text-slate-400 text-xs" />
                </button>
              )}

              <div className="flex items-center gap-1.5 pl-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider font-mono">
                  Active Now
                </span>
              </div>
            </div>
          </div>

          {/* Pass Body */}
          <div className="p-5 sm:p-6">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-5 sm:gap-6">
              {/* QR Code Hero Frame */}
              <div className="shrink-0 text-center">
                <div className="p-3 bg-white border border-slate-200 rounded-2xl shadow-xs inline-block">
                  <img
                    key={activeQr.token}
                    src={activeQr.qrImageBase64}
                    alt={`Day ${activeQr.dayNumber} Attendance QR`}
                    className="w-44 h-44 sm:w-48 sm:h-48 mx-auto rounded-lg"
                  />
                </div>
                <p className="text-[11px] font-extrabold text-slate-700 mt-2 font-mono uppercase tracking-wider">
                  Day {activeQr.dayNumber} QR Pass
                </p>
              </div>

              {/* Pass Details & Verification */}
              <div className="space-y-3.5 flex-1 w-full text-center md:text-left">
                <div>
                  <h2 className="text-base sm:text-lg font-black text-slate-900 leading-snug break-words">
                    {activeQr.title}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Show this QR code to the volunteer at the venue entrance.
                  </p>
                </div>

                {/* Verification Code Box (Pass ID) */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 flex items-center justify-between gap-2 max-w-lg mx-auto md:mx-0">
                  <div className="min-w-0 text-left">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Verification Code
                    </span>
                    <span className="font-bold font-mono text-xs text-slate-800 truncate block">
                      {activeQr.token}
                    </span>
                  </div>
                  <button
                    onClick={handleCopyToken}
                    className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold transition flex items-center gap-1 shrink-0 shadow-2xs cursor-pointer"
                    title="Copy verification code to clipboard"
                  >
                    {copiedToken ? (
                      <>
                        <FiCheck className="text-emerald-600 text-xs" />
                        <span className="text-emerald-700">Copied</span>
                      </>
                    ) : (
                      <>
                        <FiCopy className="text-xs" />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Compact Session Metadata */}
                <div className="pt-1 text-xs text-slate-600 space-y-1.5 max-w-lg mx-auto md:mx-0 text-left">
                  <div className="flex items-start gap-2">
                    <FiCalendar className="text-cyan-700 text-sm mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <span className="font-semibold text-slate-500 mr-1.5">Date:</span>
                      <strong className="text-slate-900 font-bold font-mono">
                        {activeQr.sessionDate || upcomingSession?.sessionDate || "Scheduled Day"}
                      </strong>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <FiClock className="text-cyan-700 text-sm mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <span className="font-semibold text-slate-500 mr-1.5">Time:</span>
                      <strong className="text-slate-900 font-bold font-mono">
                        {formatTimeRange(activeQr.startTime || upcomingSession?.startTime, activeQr.endTime || upcomingSession?.endTime)}
                      </strong>
                    </div>
                  </div>

                  <div className="flex items-start gap-2">
                    <FiMapPin className="text-cyan-700 text-sm mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <span className="font-semibold text-slate-500 mr-1.5">Venue:</span>
                      <strong className="text-slate-900 font-bold whitespace-normal break-words">
                        {activeQr.venue || upcomingSession?.venue || "VLTC Auditorium, MNIT Jaipur"}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Case 3: Zero Available QR Passes */
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center gap-4 text-slate-700">
          <div className="h-11 w-11 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center text-lg shrink-0">
            <FiCamera />
          </div>
          <div className="space-y-0.5">
            <h3 className="text-sm font-black text-slate-900">
              Attendance QR Pending
            </h3>
            <p className="text-xs text-slate-500">
              Your attendance QR will be available once generated for the session.
            </p>
          </div>
        </div>
      )}

      {/* 3. Compact Attendance Summary Bar */}
      <div className="bg-white border border-slate-200 rounded-xl px-4 py-2.5 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4 sm:gap-6">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Total Sessions</span>
            <span className="font-extrabold text-slate-900 font-mono text-sm">{totalSessions}</span>
          </div>
          <div className="h-6 w-px bg-slate-100" />
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Present</span>
            <span className="font-extrabold text-emerald-700 font-mono text-sm">{presentCount}</span>
          </div>
          <div className="h-6 w-px bg-slate-100" />
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Attendance</span>
            <span className="font-extrabold text-cyan-700 font-mono text-sm">{percentage.toFixed(1)}%</span>
          </div>
        </div>

        <span className="text-[11px] font-semibold text-slate-500 font-mono hidden sm:inline">
          Minimum 75% required for Certificate
        </span>
      </div>

      {/* 4. Attendance History Records */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Attendance Records
          </h3>
          <span className="text-[11px] text-slate-500 font-semibold font-mono">{records.length} Recorded</span>
        </div>

        {records.length > 0 ? (
          <div>
            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700">
                <thead className="bg-slate-50/50 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-2.5">Day</th>
                    <th className="px-5 py-2.5">Session Title</th>
                    <th className="px-5 py-2.5">Date</th>
                    <th className="px-5 py-2.5">Status</th>
                    <th className="px-5 py-2.5">Marked Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {records.map((rec) => {
                    const isPresent = rec.status === "PRESENT"
                    return (
                      <tr key={rec.sessionId || rec.dayNumber} className="hover:bg-slate-50/60 transition">
                        <td className="px-5 py-3 font-extrabold text-slate-900 font-mono">Day {rec.dayNumber}</td>
                        <td className="px-5 py-3 font-semibold text-slate-900 leading-snug">{rec.title}</td>
                        <td className="px-5 py-3 font-mono text-slate-600">{rec.sessionDate}</td>
                        <td className="px-5 py-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                              isPresent
                                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                : "bg-slate-100 text-slate-600 border-slate-200"
                            }`}
                          >
                            {isPresent ? <FiCheckCircle /> : <FiXCircle />}
                            {isPresent ? "Present" : "Absent"}
                          </span>
                        </td>
                        <td className="px-5 py-3 font-mono text-slate-600">
                          {formatMarkedTime(rec.markedAt)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Stacked Cards View */}
            <div className="sm:hidden divide-y divide-slate-100">
              {records.map((rec) => {
                const isPresent = rec.status === "PRESENT"
                return (
                  <div key={rec.sessionId || rec.dayNumber} className="p-4 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-900 font-mono text-[11px] bg-slate-100 px-2 py-0.5 rounded">
                        Day {rec.dayNumber}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                          isPresent
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : "bg-slate-100 text-slate-600 border-slate-200"
                        }`}
                      >
                        {isPresent ? <FiCheckCircle /> : <FiXCircle />}
                        {isPresent ? "Present" : "Absent"}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 leading-snug break-words">
                      {rec.title}
                    </h4>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono pt-0.5">
                      <span>{rec.sessionDate}</span>
                      {isPresent && <span>Marked: {formatMarkedTime(rec.markedAt)}</span>}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="p-6 text-center text-xs text-slate-400">
            No attendance records found yet.
          </div>
        )}
      </div>

      {/* 5. Switch Session Bottom Sheet / Modal (For Mobile & Quick Switching) */}
      {isPassModalOpen && availableQrs.length > 1 && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs p-0 sm:p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-t-2xl sm:rounded-2xl p-5 shadow-xl border border-slate-200 space-y-4 animate-in slide-in-from-bottom sm:zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Switch Session
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Choose which session QR pass to display
                </p>
              </div>
              <button
                onClick={() => setIsPassModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                title="Close"
              >
                <FiX className="text-lg" />
              </button>
            </div>

            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
              {availableQrs.map((qr, idx) => {
                const isSelected = selectedQrIndex === idx
                return (
                  <button
                    key={qr.token || idx}
                    onClick={() => {
                      setSelectedQrIndex(idx)
                      setCopiedToken(false)
                      setIsPassModalOpen(false)
                    }}
                    className={`w-full p-3 rounded-xl border text-left transition flex items-center justify-between gap-3 cursor-pointer ${
                      isSelected
                        ? "bg-cyan-50/80 border-cyan-500 text-cyan-950 shadow-2xs"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          isSelected
                            ? "border-cyan-600 bg-cyan-600 text-white"
                            : "border-slate-300 bg-white"
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-extrabold uppercase font-mono text-cyan-900">
                            Day {qr.dayNumber}
                          </span>
                          <span className="text-slate-300">&bull;</span>
                          <span className="text-[11px] text-slate-500 font-mono">
                            {qr.sessionDate}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 truncate mt-0.5">
                          {qr.title}
                        </h4>
                      </div>
                    </div>

                    {isSelected && (
                      <span className="text-[10px] font-bold text-cyan-800 bg-cyan-100/70 px-2 py-0.5 rounded-md font-mono shrink-0">
                        Active
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
