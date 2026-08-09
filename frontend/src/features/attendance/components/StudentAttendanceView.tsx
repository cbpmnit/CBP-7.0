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
  FiLayers,
  FiPercent,
  FiRefreshCw,
  FiCamera,
  FiCopy,
  FiCheck,
} from "react-icons/fi"

export default function StudentAttendanceView() {
  const [loading, setLoading] = useState(true)
  const [upcomingSession, setUpcomingSession] = useState<AttendanceSessionDto | null>(null)
  const [historySummary, setHistorySummary] = useState<StudentAttendanceSummaryResponse | null>(null)
  const [studentQr, setStudentQr] = useState<StudentSessionQrResponse | null>(null)
  const [copiedToken, setCopiedToken] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    fetchStudentData()
  }, [])

  const fetchStudentData = async () => {
    setLoading(true)
    setErrorMessage(null)
    try {
      const [upcomingRes, historyRes, qrRes] = await Promise.allSettled([
        attendanceService.getUpcomingSession(),
        attendanceService.getMyAttendance(),
        attendanceService.getMyActiveAttendanceQr(),
      ])

      if (upcomingRes.status === "fulfilled") {
        setUpcomingSession(upcomingRes.value)
      }

      if (historyRes.status === "fulfilled") {
        setHistorySummary(historyRes.value)
      }

      if (qrRes.status === "fulfilled" && qrRes.value) {
        setStudentQr(qrRes.value)
      }
    } catch (err: any) {
      setErrorMessage("Unable to load attendance details right now.")
    } finally {
      setLoading(false)
    }
  }

  const handleCopyToken = () => {
    if (!studentQr?.token) return
    navigator.clipboard.writeText(studentQr.token)
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
      <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500 shadow-xs">
        <div className="h-7 w-7 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs font-semibold">Loading attendance details...</p>
      </div>
    )
  }

  const totalSessions = historySummary?.totalSessions ?? 0
  const presentCount = historySummary?.attendedSessions ?? 0
  const percentage = historySummary?.attendancePercentage ?? 0
  const records = historySummary?.sessions || []

  return (
    <div className="space-y-5">
      {errorMessage && (
        <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FiAlertCircle className="shrink-0 text-base text-amber-600" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={fetchStudentData}
            className="inline-flex items-center gap-1 font-bold underline hover:text-amber-950 text-xs"
          >
            <FiRefreshCw className="text-[10px]" /> Retry
          </button>
        </div>
      )}

      {/* 1. Next / Upcoming Session Card */}
      {upcomingSession && (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-900 bg-cyan-50 px-2.5 py-0.5 rounded-full border border-cyan-200">
                Day {upcomingSession.dayNumber}
              </span>
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">
                {upcomingSession.title}
              </h3>
            </div>

            <span
              className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${
                upcomingSession.status === "ACTIVE"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200 animate-pulse"
                  : "bg-blue-50 text-blue-800 border-blue-200"
              }`}
            >
              {upcomingSession.status === "ACTIVE" ? "Active Now" : "Upcoming"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2">
              <FiCalendar className="text-cyan-700 text-sm shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Date</span>
                <span className="font-bold text-slate-900 truncate block">{upcomingSession.sessionDate}</span>
              </div>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2">
              <FiClock className="text-cyan-700 text-sm shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Time</span>
                <span className="font-bold text-slate-900 font-mono truncate block">
                  {formatTimeRange(upcomingSession.startTime, upcomingSession.endTime)}
                </span>
              </div>
            </div>

            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2">
              <FiMapPin className="text-cyan-700 text-sm shrink-0" />
              <div className="min-w-0">
                <span className="text-[10px] text-slate-400 font-bold uppercase block">Venue</span>
                <span className="font-bold text-slate-900 truncate block">
                  {upcomingSession.venue || "VLTC Auditorium, MNIT"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Personal Student Session QR Pass */}
      {studentQr ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-center gap-5">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl shrink-0 text-center">
            <img src={studentQr.qrImageBase64} alt="Session QR Pass" className="w-36 h-36 mx-auto" />
            <span className="text-[10px] font-bold text-slate-500 mt-1 block uppercase">Entry Pass</span>
          </div>

          <div className="space-y-2 flex-1 text-center sm:text-left text-xs">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-900 bg-cyan-50 px-2.5 py-0.5 rounded-full border border-cyan-200">
                Day {studentQr.dayNumber} Pass
              </span>
              <span className="text-[10px] font-bold text-slate-500">{studentQr.title}</span>
            </div>

            <p className="text-slate-600 font-medium leading-relaxed">
              Show this QR pass to volunteers at the auditorium entrance to verify session attendance.
            </p>

            <div className="pt-1 flex flex-wrap items-center gap-2 justify-center sm:justify-start">
              <div className="flex items-center gap-1.5 font-mono text-[11px] bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-bold">Token:</span>
                <span className="font-bold text-slate-900 truncate max-w-[140px] sm:max-w-xs">{studentQr.token}</span>
                <button
                  onClick={handleCopyToken}
                  className="text-cyan-700 hover:text-cyan-900 ml-1 font-bold inline-flex items-center"
                >
                  {copiedToken ? <FiCheck className="text-emerald-600" /> : <FiCopy />}
                </button>
              </div>

              {studentQr.expiresAt && (
                <span className="text-[10px] text-slate-500 font-medium">
                  Expires: <span className="font-mono">{studentQr.expiresAt.replace("T", " ").substring(0, 16)}</span>
                </span>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 shadow-xs flex items-center gap-3 text-amber-950">
          <div className="h-9 w-9 rounded-xl bg-amber-500 text-white flex items-center justify-center text-base shrink-0">
            <FiCamera />
          </div>
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-900">Gate Pass Pending</h4>
            <p className="text-[11px] text-amber-800 mt-0.5">
              Available after generation
            </p>
          </div>
        </div>
      )}

      {/* 3. Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Sessions</p>
              <h4 className="text-xl font-extrabold text-slate-900 mt-0.5">{totalSessions}</h4>
            </div>
            <div className="h-9 w-9 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center text-base">
              <FiLayers />
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Present Count</p>
              <h4 className="text-xl font-extrabold text-emerald-700 mt-0.5">{presentCount}</h4>
            </div>
            <div className="h-9 w-9 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center text-base">
              <FiCheckCircle />
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Attendance %</p>
              <h4 className="text-xl font-extrabold text-cyan-700 mt-0.5">{percentage.toFixed(1)}%</h4>
            </div>
            <div className="h-9 w-9 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-700 flex items-center justify-center text-base">
              <FiPercent />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Attendance History Log */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50/70 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Attendance Records
          </h3>
          <span className="text-[11px] text-slate-500 font-semibold">{records.length} Recorded</span>
        </div>

        {records.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50/50 text-[10px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="px-4 sm:px-5 py-2.5">Day</th>
                  <th className="px-4 sm:px-5 py-2.5">Session</th>
                  <th className="px-4 sm:px-5 py-2.5">Date</th>
                  <th className="px-4 sm:px-5 py-2.5">Status</th>
                  <th className="px-4 sm:px-5 py-2.5">Marked Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map((rec) => {
                  const isPresent = rec.status === "PRESENT"
                  return (
                    <tr key={rec.sessionId || rec.dayNumber} className="hover:bg-slate-50/60 transition">
                      <td className="px-4 sm:px-5 py-3 font-extrabold text-slate-900">Day {rec.dayNumber}</td>
                      <td className="px-4 sm:px-5 py-3 font-medium text-slate-800">{rec.title}</td>
                      <td className="px-4 sm:px-5 py-3 font-mono text-slate-600">{rec.sessionDate}</td>
                      <td className="px-4 sm:px-5 py-3">
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
                      </td>
                      <td className="px-4 sm:px-5 py-3 font-mono text-slate-600">
                        {formatMarkedTime(rec.markedAt)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center text-xs text-slate-400">
            No attendance records found yet.
          </div>
        )}
      </div>
    </div>
  )
}
