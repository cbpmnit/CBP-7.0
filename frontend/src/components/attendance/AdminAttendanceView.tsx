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
      setActionMessage(`Successfully generated ${res.generated} student QR codes for this session!`)
      await loadSessionDetails(selectedSessionId)
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

  const selectedSession = sessions.find((s) => s.id === selectedSessionId)

  return (
    <div className="space-y-6">
      {/* SECTION A: Session List */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <FiCalendar className="text-cyan-700 text-sm" /> Workshop Day Sessions
          </h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold uppercase tracking-wider transition inline-flex items-center gap-1 shadow-sm"
            >
              <FiPlus /> Create Session
            </button>
            <button
              onClick={fetchSessions}
              className="text-xs text-slate-500 hover:text-slate-900 font-semibold inline-flex items-center gap-1"
            >
              <FiRefreshCw className={loadingSessions ? "animate-spin" : ""} /> Refresh
            </button>
          </div>
        </div>

        {loadingSessions ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading sessions...</div>
        ) : sessions.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
            No attendance sessions created yet. Click &quot;+ Create Session&quot; above.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {sessions.map((session) => {
              const isSelected = selectedSessionId === session.id
              return (
                <div
                  key={session.id}
                  onClick={() => {
                    setSelectedSessionId(session.id)
                    setPage(0)
                  }}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative group flex flex-col justify-between ${
                    isSelected
                      ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                      : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-800"
                  }`}
                >
                  <div>
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
                  </div>

                  {/* Status Toggle Actions */}
                  <div className="mt-2 pt-2 border-t border-slate-200/40 flex items-center justify-between">
                    {session.status === "UPCOMING" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleActivateSession(session.id)
                        }}
                        className="text-[10px] font-extrabold text-emerald-600 hover:underline"
                      >
                        Activate Session →
                      </button>
                    )}
                    {session.status === "ACTIVE" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleCloseSession(session.id)
                        }}
                        className="text-[10px] font-extrabold text-amber-600 hover:underline"
                      >
                        Close Session ✕
                      </button>
                    )}
                    {session.status === "CLOSED" && (
                      <span className="text-[10px] text-slate-400 font-semibold">Concluded</span>
                    )}
                  </div>
                </div>
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
                  Session Attendance Metrics
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

          {/* SECTION D: Student QR Code Generation Control */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-slate-100 gap-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                  <FiZap className="text-cyan-700 text-sm" /> Student Session QR Code Generation
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Generate unique student-specific QR passes for all registered students for this session.
                </p>
              </div>

              <button
                onClick={handleGenerateStudentQrs}
                disabled={generatingStudentQrs}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider shadow-sm transition disabled:opacity-50 inline-flex items-center gap-2 shrink-0"
              >
                {generatingStudentQrs ? <FiRefreshCw className="animate-spin" /> : <FiZap />}
                <span>{generatingStudentQrs ? "Generating..." : "Generate Student QR Codes"}</span>
              </button>
            </div>

            {actionMessage && (
              <div className="mb-4 p-3.5 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-900 text-xs font-semibold">
                {actionMessage}
              </div>
            )}

            {qrStatus && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="text-[10px] font-bold uppercase text-slate-500">Total Enrolled Students</span>
                  <p className="text-xl font-extrabold text-slate-900 mt-1">{qrStatus.totalStudents}</p>
                </div>

                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                  <span className="text-[10px] font-bold uppercase text-emerald-800">Student QRs Generated</span>
                  <p className="text-xl font-extrabold text-emerald-700 mt-1">{qrStatus.generatedQr}</p>
                </div>

                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <span className="text-[10px] font-bold uppercase text-amber-800">Pending QRs</span>
                  <p className="text-xl font-extrabold text-amber-700 mt-1">{qrStatus.pendingQr}</p>
                </div>
              </div>
            )}
          </div>

          {/* SECTION C: Attendance Records Table */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Attendance Record Log
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

      {/* CREATE SESSION MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-lg p-6 space-y-4 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-extrabold text-slate-900">Create Attendance Session</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg"
              >
                <FiX />
              </button>
            </div>

            {createError && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateSessionSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Day Number</label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={newDayNum}
                    onChange={(e) => setNewDayNum(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Session Date</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Session Title</label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Orientation & Leadership Skills"
                  required
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Description</label>
                <textarea
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="Brief summary of session topic and agenda..."
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={newStart}
                    onChange={(e) => setNewStart(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">End Time</label>
                  <input
                    type="time"
                    value={newEnd}
                    onChange={(e) => setNewEnd(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Venue</label>
                <input
                  type="text"
                  value={newVenue}
                  onChange={(e) => setNewVenue(e.target.value)}
                  placeholder="e.g. VLTC Auditorium 1, MNIT Jaipur"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-xl font-extrabold uppercase tracking-wider"
                >
                  {creating ? "Creating..." : "Save Session"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
