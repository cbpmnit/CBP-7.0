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
      setErrorMessage("Unable to load student attendance details at this moment.")
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
    if (!start && !end) return "Time not announced"
    if (start && end) return `${start} - ${end}`
    return start || end || ""
  }

  const formatMarkedTime = (isoString?: string | null) => {
    if (!isoString) return "-"
    try {
      const d = new Date(isoString)
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } catch {
      return isoString
    }
  }

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500">
        <div className="h-7 w-7 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs font-semibold">Loading student attendance information...</p>
      </div>
    )
  }

  const totalSessions = historySummary?.totalSessions ?? 0
  const presentCount = historySummary?.attendedSessions ?? 0
  const percentage = historySummary?.attendancePercentage ?? 0
  const records = historySummary?.sessions || []

  return (
    <div className="space-y-6">
      {errorMessage && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FiAlertCircle className="shrink-0 text-base" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={fetchStudentData}
            className="inline-flex items-center gap-1 font-bold underline hover:text-amber-950"
          >
            <FiRefreshCw /> Retry
          </button>
        </div>
      )}

      {/* 1. Upcoming / Current Session */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <FiCalendar className="text-cyan-600 text-sm" /> Upcoming Session
          </h3>
          {upcomingSession && (
            <span
              className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${
                upcomingSession.status === "ACTIVE"
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : "bg-blue-50 text-blue-800 border-blue-200"
              }`}
            >
              {upcomingSession.status}
            </span>
          )}
        </div>

        {upcomingSession ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Day Number</span>
              <p className="text-sm font-extrabold text-slate-900 mt-0.5">Day {upcomingSession.dayNumber}</p>
              <p className="text-xs font-semibold text-slate-700 mt-0.5 truncate">{upcomingSession.title}</p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Date</span>
              <p className="text-sm font-bold text-slate-900 mt-0.5">{upcomingSession.sessionDate}</p>
              <p className="text-xs text-slate-500 mt-0.5">Scheduled Date</p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                <FiClock /> Timing
              </span>
              <p className="text-xs font-bold text-slate-900 mt-1">
                {formatTimeRange(upcomingSession.startTime, upcomingSession.endTime)}
              </p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
              <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1">
                <FiMapPin /> Venue
              </span>
              <p className="text-xs font-bold text-slate-900 mt-1 truncate">
                {upcomingSession.venue || "VLTC Auditorium, MNIT"}
              </p>
            </div>
          </div>
        ) : (
          <div className="p-6 text-center bg-slate-50 border border-slate-200 rounded-xl">
            <p className="text-xs font-semibold text-slate-600">No upcoming sessions</p>
            <p className="text-[11px] text-slate-400 mt-0.5">All scheduled sessions have either concluded or not yet published.</p>
          </div>
        )}
      </div>

      {/* 2. Personal Student Session QR Code Card */}
      {studentQr && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-center gap-6">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl shrink-0 text-center">
            <img src={studentQr.qrImageBase64} alt="Personal Session QR" className="w-40 h-40 mx-auto" />
            <span className="text-[10px] font-bold text-slate-500 mt-1 block uppercase">Personal Gate Pass</span>
          </div>

          <div className="space-y-2 flex-1 text-center sm:text-left text-xs">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-800 bg-cyan-50 px-2.5 py-0.5 rounded-full border border-cyan-200">
                Your Session Attendance QR
              </span>
              <span className="text-[10px] font-bold text-slate-500">Day {studentQr.dayNumber}</span>
            </div>

            <h3 className="text-base font-extrabold text-slate-900">{studentQr.title}</h3>
            <p className="text-slate-600 font-medium">
              Present this personalized QR code to volunteers at the auditorium entrance to log your session attendance.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3 justify-center sm:justify-start">
              <div className="flex items-center gap-1.5 font-mono text-[11px] bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 font-bold">Token:</span>
                <span className="font-bold text-slate-900 truncate max-w-xs">{studentQr.token}</span>
                <button
                  onClick={handleCopyToken}
                  className="text-cyan-700 hover:text-cyan-900 ml-1 font-bold inline-flex items-center gap-0.5"
                >
                  {copiedToken ? <FiCheck className="text-emerald-600" /> : <FiCopy />}
                </button>
              </div>

              {studentQr.expiresAt && (
                <span className="text-[11px] text-slate-500 font-medium">
                  Valid Until: <span className="font-mono">{studentQr.expiresAt.replace("T", " ").substring(0, 16)}</span>
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. Student Attendance Metrics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Total Sessions</p>
              <h4 className="text-2xl font-extrabold text-slate-900 mt-1">{totalSessions}</h4>
            </div>
            <div className="h-10 w-10 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center text-lg">
              <FiLayers />
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Present Count</p>
              <h4 className="text-2xl font-extrabold text-emerald-700 mt-1">{presentCount}</h4>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center text-lg">
              <FiCheckCircle />
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Attendance Percentage</p>
              <h4 className="text-2xl font-extrabold text-cyan-700 mt-1">{percentage.toFixed(1)}%</h4>
            </div>
            <div className="h-10 w-10 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-700 flex items-center justify-center text-lg">
              <FiPercent />
            </div>
          </div>
        </div>
      </div>

      {/* 4. Student Attendance History List */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Attendance History Log
          </h3>
          <span className="text-xs text-slate-500 font-semibold">{records.length} Recorded Sessions</span>
        </div>

        {records.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50/50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Day</th>
                  <th className="px-6 py-3">Session Title</th>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Marked Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map((rec) => {
                  const isPresent = rec.status === "PRESENT"
                  return (
                    <tr key={rec.sessionId || rec.dayNumber} className="hover:bg-slate-50/60 transition">
                      <td className="px-6 py-3.5 font-extrabold text-slate-900">Day {rec.dayNumber}</td>
                      <td className="px-6 py-3.5 font-medium text-slate-800">{rec.title}</td>
                      <td className="px-6 py-3.5 font-mono text-slate-600">{rec.sessionDate}</td>
                      <td className="px-6 py-3.5">
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
                      <td className="px-6 py-3.5 font-mono text-slate-600">
                        {formatMarkedTime(rec.markedAt)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-500">
            No attendance records found yet.
          </div>
        )}
      </div>
    </div>
  )
}
