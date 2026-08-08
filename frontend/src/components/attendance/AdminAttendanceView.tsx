"use client"

import { useState, useEffect } from "react"
import { attendanceService } from "@/services/attendanceService"
import {
  AttendanceSessionDto,
  SessionSummaryResponse,
  StudentSessionRecordDto,
  SessionQrCodeResponse,
  PageResponse,
} from "@/types/attendance"
import {
  FiCalendar,
  FiClock,
  FiSearch,
  FiRefreshCw,
  FiCheckCircle,
  FiXCircle,
  FiUsers,
  FiPercent,
  FiChevronLeft,
  FiChevronRight,
  FiActivity,
  FiCheck,
  FiCopy,
} from "react-icons/fi"

export default function AdminAttendanceView() {
  const [sessions, setSessions] = useState<AttendanceSessionDto[]>([])
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)
  const [loadingSessions, setLoadingSessions] = useState(true)

  // Summary State
  const [summary, setSummary] = useState<SessionSummaryResponse | null>(null)
  const [summaryLoading, setSummaryLoading] = useState(false)

  // Records Table State
  const [recordsPage, setRecordsPage] = useState<PageResponse<StudentSessionRecordDto> | null>(null)
  const [recordsLoading, setRecordsLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [page, setPage] = useState(0)

  // QR Code State
  const [qrCode, setQrCode] = useState<SessionQrCodeResponse | null>(null)
  const [qrLoading, setQrLoading] = useState(false)
  const [copiedToken, setCopiedToken] = useState(false)
  const [actionMessage, setActionMessage] = useState<string | null>(null)

  useEffect(() => {
    fetchSessions()
  }, [])

  useEffect(() => {
    if (selectedSessionId) {
      loadSessionDetails(selectedSessionId)
    }
  }, [selectedSessionId])

  useEffect(() => {
    if (selectedSessionId) {
      loadRecords(selectedSessionId, search, statusFilter, page)
    }
  }, [selectedSessionId, search, statusFilter, page])

  const fetchSessions = async () => {
    setLoadingSessions(true)
    try {
      const data = await attendanceService.getAllSessions()
      setSessions(data || [])
      if (data && data.length > 0 && !selectedSessionId) {
        setSelectedSessionId(data[0].id)
      }
    } catch (err) {
      console.error("Failed to load admin sessions", err)
    } finally {
      setLoadingSessions(false)
    }
  }

  const loadSessionDetails = async (sessionId: string) => {
    setSummaryLoading(true)
    setQrLoading(true)
    try {
      const [sumRes, qrRes] = await Promise.allSettled([
        attendanceService.getSessionSummary(sessionId),
        attendanceService.getActiveSessionQr(sessionId),
      ])

      if (sumRes.status === "fulfilled") {
        setSummary(sumRes.value)
      } else {
        setSummary(null)
      }

      if (qrRes.status === "fulfilled") {
        setQrCode(qrRes.value)
      } else {
        setQrCode(null)
      }
    } finally {
      setSummaryLoading(false)
      setQrLoading(false)
    }
  }

  const loadRecords = async (
    sessionId: string,
    searchTerm: string,
    status: string,
    pageNum: number
  ) => {
    setRecordsLoading(true)
    try {
      const data = await attendanceService.getSessionRecords(sessionId, searchTerm, status, pageNum, 10)
      setRecordsPage(data)
    } catch (err) {
      console.error("Failed to load session records", err)
    } finally {
      setRecordsLoading(false)
    }
  }

  const handleGenerateQr = async () => {
    if (!selectedSessionId) return
    setQrLoading(true)
    setActionMessage(null)
    try {
      const res = await attendanceService.generateSessionQr(selectedSessionId)
      setQrCode(res)
      setActionMessage("Session QR code generated successfully!")
      setTimeout(() => setActionMessage(null), 3000)
    } catch (err: any) {
      setActionMessage(err?.message || "Failed to generate session QR code.")
    } finally {
      setQrLoading(false)
    }
  }

  const handleCopyToken = () => {
    if (!qrCode?.token) return
    navigator.clipboard.writeText(qrCode.token)
    setCopiedToken(true)
    setTimeout(() => setCopiedToken(false), 2000)
  }

  const selectedSession = sessions.find((s) => s.id === selectedSessionId)

  return (
    <div className="space-y-6">
      {/* SECTION A: Session List */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <FiCalendar className="text-cyan-700 text-sm" /> A. Session List
          </h3>
          <button
            onClick={fetchSessions}
            className="text-xs text-slate-500 hover:text-slate-900 font-semibold inline-flex items-center gap-1"
          >
            <FiRefreshCw className={loadingSessions ? "animate-spin" : ""} /> Refresh
          </button>
        </div>

        {loadingSessions ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading sessions...</div>
        ) : sessions.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
            No attendance sessions created yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {sessions.map((session) => {
              const isSelected = selectedSessionId === session.id
              return (
                <button
                  key={session.id}
                  onClick={() => {
                    setSelectedSessionId(session.id)
                    setPage(0)
                  }}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    isSelected
                      ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                      : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-extrabold">Day {session.dayNumber}</span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        session.status === "ACTIVE"
                          ? "bg-emerald-100 text-emerald-800"
                          : session.status === "CLOSED"
                          ? "bg-slate-200 text-slate-700"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {session.status}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold truncate">{session.title}</h4>
                  <p className={`text-[10px] mt-1 font-mono ${isSelected ? "text-slate-300" : "text-slate-500"}`}>
                    {session.sessionDate}
                  </p>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* SECTION B: Session Attendance Summary */}
      {selectedSession && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-slate-100 gap-2">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  B. Session Attendance Summary
                </h3>
                <h2 className="text-base font-extrabold text-slate-900 mt-0.5">
                  Day {selectedSession.dayNumber}: {selectedSession.title}
                </h2>
              </div>
              <span className="text-xs font-mono text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                {selectedSession.sessionDate}
              </span>
            </div>

            {summaryLoading ? (
              <div className="p-6 text-center text-xs text-slate-400">Loading summary...</div>
            ) : summary ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] font-bold uppercase text-slate-500">Total Registered</span>
                  <p className="text-2xl font-extrabold text-slate-900 mt-1">{summary.totalRegisteredStudents}</p>
                </div>
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <span className="text-[10px] font-bold uppercase text-emerald-800">Present</span>
                  <p className="text-2xl font-extrabold text-emerald-700 mt-1">{summary.presentCount}</p>
                </div>
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl">
                  <span className="text-[10px] font-bold uppercase text-rose-800">Absent</span>
                  <p className="text-2xl font-extrabold text-rose-700 mt-1">{summary.absentCount}</p>
                </div>
                <div className="p-4 bg-cyan-50 border border-cyan-200 rounded-xl">
                  <span className="text-[10px] font-bold uppercase text-cyan-800">Attendance %</span>
                  <p className="text-2xl font-extrabold text-cyan-700 mt-1">
                    {summary.attendancePercentage.toFixed(1)}%
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-4 text-xs text-slate-500 bg-slate-50 rounded-xl text-center">
                Summary metrics unavailable.
              </div>
            )}
          </div>

          {/* SECTION D: Session QR Display */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <FiActivity className="text-cyan-700 text-sm" /> Session QR Code
              </h3>
              <button
                onClick={handleGenerateQr}
                disabled={qrLoading}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider shadow-sm transition disabled:opacity-50 inline-flex items-center gap-1.5"
              >
                <FiRefreshCw className={qrLoading ? "animate-spin" : ""} />
                <span>{qrLoading ? "Generating..." : "Generate Session QR"}</span>
              </button>
            </div>

            {actionMessage && (
              <div className="mb-4 p-3 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-900 text-xs font-semibold">
                {actionMessage}
              </div>
            )}

            {qrCode ? (
              <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="p-2 bg-white rounded-xl border border-slate-200 shrink-0">
                  <img src={qrCode.qrImageBase64} alt="Session QR" className="w-36 h-36" />
                </div>
                <div className="space-y-2 flex-1 text-center sm:text-left text-xs">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      qrCode.active
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                        : "bg-slate-200 text-slate-700 border-slate-300"
                    }`}
                  >
                    <FiCheckCircle /> {qrCode.active ? "Session QR Active" : "QR Inactive"}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900">{selectedSession.title}</h4>
                  <p className="text-slate-600">
                    Expiry: <span className="font-mono">{qrCode.expiresAt ? qrCode.expiresAt.replace("T", " ") : "End of session"}</span>
                  </p>
                  <div className="flex items-center gap-2 pt-1 justify-center sm:justify-start">
                    <span className="font-mono text-[11px] bg-white px-2.5 py-1 rounded-lg border border-slate-200 truncate max-w-xs">
                      {qrCode.token}
                    </span>
                    <button
                      onClick={handleCopyToken}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 transition inline-flex items-center gap-1 shrink-0"
                    >
                      {copiedToken ? <FiCheck className="text-emerald-600" /> : <FiCopy />}
                      <span>{copiedToken ? "Copied" : "Copy Token"}</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
                No active QR generated for this session yet. Click &quot;Generate Session QR&quot; above.
              </div>
            )}
          </div>

          {/* SECTION C: Attendance Records Table */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  C. Attendance Records
                </h3>
                <p className="text-[11px] text-slate-500">
                  {recordsPage?.totalElements ?? 0} total matching student logs
                </p>
              </div>

              {/* Search & Status Filters */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-2.5 text-slate-400 text-xs" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value)
                      setPage(0)
                    }}
                    placeholder="Search Student ID..."
                    className="pl-8 pr-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 focus:outline-none focus:border-cyan-600"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value)
                    setPage(0)
                  }}
                  className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 font-semibold focus:outline-none focus:border-cyan-600"
                >
                  <option value="ALL">All Status</option>
                  <option value="PRESENT">Present</option>
                  <option value="ABSENT">Absent</option>
                </select>
              </div>
            </div>

            {recordsLoading ? (
              <div className="p-8 text-center text-xs text-slate-400">Loading student records...</div>
            ) : !recordsPage || recordsPage.content.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500">
                No attendance records found matching the query.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-3">Student ID</th>
                      <th className="px-6 py-3">Name</th>
                      <th className="px-6 py-3">Email</th>
                      <th className="px-6 py-3">Status</th>
                      <th className="px-6 py-3">Marked Time</th>
                      <th className="px-6 py-3">Marked By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {recordsPage.content.map((rec) => {
                      const isPresent = rec.status === "PRESENT"
                      return (
                        <tr key={rec.studentId} className="hover:bg-slate-50/60 transition">
                          <td className="px-6 py-3.5 font-mono font-bold text-slate-900">{rec.studentId}</td>
                          <td className="px-6 py-3.5 font-medium text-slate-800">{rec.studentName || "-"}</td>
                          <td className="px-6 py-3.5 text-slate-500 font-mono">{rec.studentEmail || "-"}</td>
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
                            {rec.markedAt ? rec.markedAt.replace("T", " ").substring(0, 16) : "-"}
                          </td>
                          <td className="px-6 py-3.5 font-mono text-slate-500">{rec.markedBy || "-"}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>

                {/* Pagination Controls */}
                <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-600">
                  <span>
                    Page {recordsPage.number + 1} of {Math.max(recordsPage.totalPages, 1)}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(p - 1, 0))}
                      disabled={recordsPage.first}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 disabled:opacity-40 hover:bg-slate-100 transition inline-flex items-center gap-1"
                    >
                      <FiChevronLeft /> Previous
                    </button>
                    <button
                      onClick={() => setPage((p) => (recordsPage.last ? p : p + 1))}
                      disabled={recordsPage.last}
                      className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 disabled:opacity-40 hover:bg-slate-100 transition inline-flex items-center gap-1"
                    >
                      Next <FiChevronRight />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
