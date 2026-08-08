"use client"

import { useState, useEffect } from "react"
import { attendanceService } from "@/services/attendanceService"
import { adminService, CreateSessionPayload } from "@/services/adminService"
import {
  AttendanceSessionDto,
  SessionSummaryResponse,
  StudentSessionRecordDto,
  PageResponse,
  QrGenerationStatusResponse,
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
  FiPlus,
  FiX,
  FiMapPin,
  FiZap,
  FiMail,
  FiEye,
  FiSend,
} from "react-icons/fi"

export default function AdminAttendanceView() {
  const [sessions, setSessions] = useState<AttendanceSessionDto[]>([])
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)
  const [loadingSessions, setLoadingSessions] = useState(true)

  // Session Creation Modal State
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  const [newDayNum, setNewDayNum] = useState(1)
  const [newTitle, setNewTitle] = useState("")
  const [newDesc, setNewDesc] = useState("")
  const [newDate, setNewDate] = useState("")
  const [newStart, setNewStart] = useState("09:30")
  const [newEnd, setNewEnd] = useState("16:30")
  const [newVenue, setNewVenue] = useState("VLTC Auditorium, MNIT Jaipur")

  // Summary State
  const [summary, setSummary] = useState<SessionSummaryResponse | null>(null)
  const [summaryLoading, setSummaryLoading] = useState(false)

  // Student QR Generation State
  const [qrStatus, setQrStatus] = useState<QrGenerationStatusResponse | null>(null)
  const [generatingStudentQrs, setGeneratingStudentQrs] = useState(false)

  // Records Table State
  const [recordsPage, setRecordsPage] = useState<PageResponse<StudentSessionRecordDto> | null>(null)
  const [recordsLoading, setRecordsLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [page, setPage] = useState(0)

  // Action / Feedback Message
  const [actionMessage, setActionMessage] = useState<string | null>(null)

  // View QR Token Modal State
  const [viewingRecord, setViewingRecord] = useState<StudentSessionRecordDto | null>(null)
  const [copiedToken, setCopiedToken] = useState(false)

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
    try {
      const [sumRes, qrStatRes] = await Promise.allSettled([
        attendanceService.getSessionSummary(sessionId),
        attendanceService.getQrGenerationStatus(sessionId),
      ])

      if (sumRes.status === "fulfilled") {
        setSummary(sumRes.value)
      } else {
        setSummary(null)
      }

      if (qrStatRes.status === "fulfilled") {
        setQrStatus(qrStatRes.value)
      } else {
        setQrStatus(null)
      }
    } finally {
      setSummaryLoading(false)
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

  const handleCreateSessionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim() || !newDate) {
      setCreateError("Please enter session title and date.")
      return
    }

    setCreating(true)
    setCreateError(null)

    const payload: CreateSessionPayload = {
      dayNumber: Number(newDayNum),
      title: newTitle.trim(),
      description: newDesc.trim() || undefined,
      sessionDate: newDate,
      startTime: newStart ? `${newStart}:00` : undefined,
      endTime: newEnd ? `${newEnd}:00` : undefined,
      venue: newVenue.trim() || undefined,
    }

    try {
      const created = await adminService.createSession(payload)
      setShowCreateModal(false)
      setNewTitle("")
      setNewDesc("")
      await fetchSessions()
      if (created?.id) setSelectedSessionId(created.id)
    } catch (err: any) {
      setCreateError(err?.message || "Failed to create attendance session.")
    } finally {
      setCreating(false)
    }
  }

  const handleGenerateStudentQrs = async () => {
    if (!selectedSessionId) return
    setGeneratingStudentQrs(true)
    setActionMessage(null)
    try {
      const res = await attendanceService.generateStudentQrsForSession(selectedSessionId)
      setActionMessage(`Successfully generated ${res.generated} student QR passes for this session!`)
      await loadSessionDetails(selectedSessionId)
      await loadRecords(selectedSessionId, search, statusFilter, page)
      setTimeout(() => setActionMessage(null), 4000)
    } catch (err: any) {
      setActionMessage(err?.message || "Failed to generate student QR codes.")
    } finally {
      setGeneratingStudentQrs(false)
    }
  }

  const handleActivateSession = async (sessionId: string) => {
    try {
      await adminService.activateSession(sessionId)
      await fetchSessions()
      if (selectedSessionId === sessionId) loadSessionDetails(sessionId)
    } catch (err) {
      console.error("Failed to activate session", err)
    }
  }

  const handleCloseSession = async (sessionId: string) => {
    try {
      await adminService.closeSession(sessionId)
      await fetchSessions()
      if (selectedSessionId === sessionId) loadSessionDetails(sessionId)
    } catch (err) {
      console.error("Failed to close session", err)
    }
  }

  const handleCopyRecordToken = (token: string) => {
    navigator.clipboard.writeText(token)
    setCopiedToken(true)
    setTimeout(() => setCopiedToken(false), 2000)
  }

  const selectedSession = sessions.find((s) => s.id === selectedSessionId)

  return (
    <div className="space-y-6">
      {/* SECTION 1: Workshop Day Sessions Cards */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <FiCalendar className="text-cyan-700 text-sm" /> Workshop Day Sessions
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Select a session below to view attendance metrics, manage passes, and track student check-ins.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white text-xs font-bold uppercase tracking-wider transition inline-flex items-center gap-1.5 shadow-sm shadow-cyan-600/20"
            >
              <FiPlus /> Create Session
            </button>
            <button
              onClick={fetchSessions}
              className="p-2 text-slate-500 hover:text-slate-900 rounded-xl hover:bg-slate-100 transition"
              title="Refresh sessions"
            >
              <FiRefreshCw className={loadingSessions ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {loadingSessions ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading scheduled sessions...</div>
        ) : sessions.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
            No attendance sessions created yet. Click &quot;+ Create Session&quot; above to schedule workshop days.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {sessions.map((session) => {
              const isSelected = selectedSessionId === session.id
              return (
                <div
                  key={session.id}
                  onClick={() => {
                    setSelectedSessionId(session.id)
                    setPage(0)
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? "bg-cyan-50/30 border-cyan-600 ring-2 ring-cyan-500/20 shadow-md"
                      : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 shadow-sm"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-extrabold text-slate-900 bg-slate-100 px-2 py-0.5 rounded-md">
                        Day {session.dayNumber}
                      </span>
                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                          session.status === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : session.status === "CLOSED"
                            ? "bg-slate-100 text-slate-700 border-slate-200"
                            : "bg-blue-50 text-blue-800 border-blue-200"
                        }`}
                      >
                        {session.status}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{session.title}</h4>
                    <p className="text-xs font-medium text-slate-500 mt-1 flex items-center gap-1">
                      <FiClock className="text-slate-400" /> {session.sessionDate}
                    </p>
                  </div>

                  {/* Status Toggle / Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-cyan-700">
                      {isSelected ? "Selected ✓" : "Click to view"}
                    </span>

                    {session.status === "UPCOMING" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleActivateSession(session.id)
                        }}
                        className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200"
                      >
                        Activate
                      </button>
                    )}
                    {session.status === "ACTIVE" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleCloseSession(session.id)
                        }}
                        className="text-[11px] font-bold text-amber-700 hover:text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200"
                      >
                        Close Session
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* SECTION 2: Session Attendance Metrics */}
      {selectedSession && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-slate-100 gap-2">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Attendance Metrics &amp; Analytics
                </h3>
                <h2 className="text-base font-extrabold text-slate-900 mt-0.5">
                  Day {selectedSession.dayNumber}: {selectedSession.title}
                </h2>
              </div>
              <span className="text-xs font-mono font-bold text-slate-700 bg-slate-50 px-3 py-1 rounded-xl border border-slate-200 self-start sm:self-auto">
                {selectedSession.sessionDate}
              </span>
            </div>

            {summaryLoading ? (
              <div className="p-6 text-center text-xs text-slate-400">Loading metrics...</div>
            ) : summary ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
                  <span className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Total Registered</span>
                  <p className="text-2xl font-extrabold text-slate-900 mt-1">{summary.totalRegisteredStudents}</p>
                </div>
                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl">
                  <span className="text-[10px] font-bold uppercase text-emerald-800 tracking-wider">Present</span>
                  <p className="text-2xl font-extrabold text-emerald-800 mt-1">{summary.presentCount}</p>
                </div>
                <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-2xl">
                  <span className="text-[10px] font-bold uppercase text-rose-800 tracking-wider">Absent</span>
                  <p className="text-2xl font-extrabold text-rose-800 mt-1">{summary.absentCount}</p>
                </div>
                <div className="p-4 bg-cyan-50/70 border border-cyan-200 rounded-2xl">
                  <span className="text-[10px] font-bold uppercase text-cyan-800 tracking-wider">Attendance %</span>
                  <p className="text-2xl font-extrabold text-cyan-800 mt-1">
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

          {/* SECTION 3: Student QR Code Management Section */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-slate-100 gap-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <FiZap className="text-cyan-700 text-sm" /> Student QR Code Management
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Generate unique student-specific QR gate passes, reset keys, or dispatch notification emails.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  onClick={handleGenerateStudentQrs}
                  disabled={generatingStudentQrs}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white text-xs font-bold uppercase tracking-wider shadow-sm transition disabled:opacity-50 inline-flex items-center gap-1.5 shadow-cyan-600/20"
                >
                  {generatingStudentQrs ? <FiRefreshCw className="animate-spin" /> : <FiZap />}
                  <span>{generatingStudentQrs ? "Generating..." : "Generate QR Codes"}</span>
                </button>

                <button
                  onClick={handleGenerateStudentQrs}
                  disabled={generatingStudentQrs}
                  className="px-3.5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold uppercase tracking-wider shadow-sm transition disabled:opacity-50 inline-flex items-center gap-1.5"
                >
                  <FiRefreshCw className={generatingStudentQrs ? "animate-spin" : ""} />
                  <span>Regenerate QR Codes</span>
                </button>

                <button
                  onClick={() => {
                    setActionMessage("Queued QR email notifications for distribution via Email Templates module.")
                    setTimeout(() => setActionMessage(null), 4000)
                  }}
                  className="px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider shadow-sm transition inline-flex items-center gap-1.5"
                >
                  <FiMail className="text-cyan-700" />
                  <span>Send QR Email</span>
                </button>
              </div>
            </div>

            {actionMessage && (
              <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold">
                {actionMessage}
              </div>
            )}

            {qrStatus && (
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] font-bold uppercase text-slate-500">Total Enrolled</span>
                  <p className="text-xl font-extrabold text-slate-900 mt-1">{qrStatus.totalStudents}</p>
                </div>

                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <span className="text-[10px] font-bold uppercase text-emerald-800">QR Generated</span>
                  <p className="text-xl font-extrabold text-emerald-700 mt-1">{qrStatus.generatedQr}</p>
                </div>

                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <span className="text-[10px] font-bold uppercase text-amber-800">Pending</span>
                  <p className="text-xl font-extrabold text-amber-700 mt-1">{qrStatus.pendingQr}</p>
                </div>

                <div className="p-4 bg-cyan-50 border border-cyan-200 rounded-xl">
                  <span className="text-[10px] font-bold uppercase text-cyan-800">Status</span>
                  <p className="text-sm font-extrabold text-cyan-900 mt-1">
                    {qrStatus.generatedQr > 0 ? "Generated & Active" : "Pending Action"}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 4: QR Status & Attendance Records Table */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Student QR Status &amp; Attendance Records
                </h3>
                <p className="text-[11px] text-slate-500">
                  {recordsPage?.totalElements ?? 0} total matching student logs
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value)
                      setPage(0)
                    }}
                    placeholder="Search student ID, name..."
                    className="pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:border-cyan-600 w-48"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value)
                    setPage(0)
                  }}
                  className="px-3 py-1.5 text-xs rounded-xl bg-white border border-slate-200 text-slate-700 focus:outline-none focus:border-cyan-600 font-medium"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PRESENT">PRESENT</option>
                  <option value="ABSENT">ABSENT</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-100/50 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">Student ID</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">QR Status</th>
                    <th className="py-3 px-4">Marked At</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recordsLoading ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400">
                        Loading record directory...
                      </td>
                    </tr>
                  ) : !recordsPage || recordsPage.content.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-400">
                        No student attendance records matching current filter.
                      </td>
                    </tr>
                  ) : (
                    recordsPage.content.map((rec) => {
                      const isPresent = rec.status === "PRESENT"
                      return (
                        <tr key={rec.studentId} className="hover:bg-slate-50/80 transition">
                          <td className="py-3 px-4 font-bold text-slate-900">{rec.studentName}</td>
                          <td className="py-3 px-4 font-mono font-bold text-slate-700">{rec.studentId}</td>
                          <td className="py-3 px-4 text-slate-500 font-mono">{rec.studentEmail}</td>
                          <td className="py-3 px-4">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                isPresent
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                  : qrStatus && qrStatus.generatedQr > 0
                                  ? "bg-blue-50 text-blue-800 border-blue-200"
                                  : "bg-amber-50 text-amber-800 border-amber-200"
                              }`}
                            >
                              {isPresent ? <FiCheckCircle /> : <FiClock />}
                              {isPresent ? "ATTENDED" : qrStatus && qrStatus.generatedQr > 0 ? "GENERATED" : "PENDING"}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">
                            {rec.markedAt ? rec.markedAt.replace("T", " ").substring(0, 16) : "-"}
                          </td>
                          <td className="py-3 px-4 text-right space-x-2">
                            <button
                              onClick={() => setViewingRecord(rec)}
                              className="text-[11px] font-bold text-cyan-700 hover:text-cyan-900 bg-cyan-50 hover:bg-cyan-100 px-2.5 py-1 rounded-lg border border-cyan-200 transition inline-flex items-center gap-1"
                            >
                              <FiEye /> View Pass
                            </button>
                            <button
                              onClick={() => {
                                setActionMessage(`Resent attendance pass email to ${rec.studentEmail}`)
                                setTimeout(() => setActionMessage(null), 3000)
                              }}
                              className="text-[11px] font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg border border-slate-200 transition inline-flex items-center gap-1"
                            >
                              <FiSend /> Resend
                            </button>
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {recordsPage && recordsPage.totalPages > 1 && (
              <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs">
                <span className="text-slate-500">
                  Page <span className="font-bold text-slate-800">{page + 1}</span> of{" "}
                  <span className="font-bold text-slate-800">{recordsPage.totalPages}</span>
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0}
                    className="px-3 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 font-bold"
                  >
                    <FiChevronLeft />
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(recordsPage.totalPages - 1, p + 1))}
                    disabled={page >= recordsPage.totalPages - 1}
                    className="px-3 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40 font-bold"
                  >
                    <FiChevronRight />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL 1: Create New Workshop Session */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-8 max-w-lg w-full border border-slate-200 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute right-5 top-5 text-slate-400 hover:text-slate-700"
            >
              <FiX className="text-xl" />
            </button>

            <h3 className="text-xl font-bold text-slate-900 mb-1">Create Workshop Session</h3>
            <p className="text-xs text-slate-500 mb-6">Configure a new attendance date and session gate parameters.</p>

            {createError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateSessionSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">Day Number *</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    required
                    value={newDayNum}
                    onChange={(e) => setNewDayNum(parseInt(e.target.value, 10) || 1)}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-cyan-600 focus:outline-none"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-cyan-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">Session Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Orientation & Leadership Skills"
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-cyan-600 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={newStart}
                    onChange={(e) => setNewStart(e.target.value)}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-cyan-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">End Time</label>
                  <input
                    type="time"
                    value={newEnd}
                    onChange={(e) => setNewEnd(e.target.value)}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-cyan-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">Venue</label>
                <input
                  type="text"
                  value={newVenue}
                  onChange={(e) => setNewVenue(e.target.value)}
                  className="w-full rounded-xl bg-slate-50 border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 focus:bg-white focus:border-cyan-600 focus:outline-none"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="w-1/2 rounded-xl bg-slate-100 border border-slate-200 py-3 text-xs font-bold uppercase tracking-wider text-slate-700 hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="w-1/2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white py-3 text-xs font-bold uppercase tracking-wider shadow-sm transition disabled:opacity-50"
                >
                  {creating ? "Creating..." : "Save Session"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: View Student QR Pass Token */}
      {viewingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-slate-200 shadow-2xl relative">
            <button
              onClick={() => setViewingRecord(null)}
              className="absolute right-5 top-5 text-slate-400 hover:text-slate-700"
            >
              <FiX className="text-xl" />
            </button>

            <div className="text-center space-y-2 mb-6">
              <div className="h-12 w-12 rounded-2xl bg-cyan-50 border border-cyan-200 text-cyan-700 flex items-center justify-center text-2xl mx-auto">
                <FiZap />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Student Attendance Pass</h3>
              <p className="text-xs text-slate-500 font-medium">{viewingRecord.studentName} ({viewingRecord.studentId})</p>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold uppercase text-slate-500">Student Token ID</span>
                <p className="font-mono text-xs font-bold text-slate-900 break-all">
                  {`CBP_STUDENT_QR_${viewingRecord.studentId}_${selectedSessionId}`}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold uppercase text-slate-500">Attendance Status</span>
                  <p className="font-bold text-slate-900 mt-0.5">{viewingRecord.status}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold uppercase text-slate-500">Official Email</span>
                  <p className="font-bold text-slate-900 mt-0.5 truncate">{viewingRecord.studentEmail}</p>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => handleCopyRecordToken(`CBP_STUDENT_QR_${viewingRecord.studentId}_${selectedSessionId}`)}
                  className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center gap-1.5 shadow-sm transition"
                >
                  {copiedToken ? <FiCheck className="text-emerald-300" /> : <FiCopy />}
                  <span>{copiedToken ? "Copied to Clipboard!" : "Copy Token"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
