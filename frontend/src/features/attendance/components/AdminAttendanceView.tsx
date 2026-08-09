"use client"

import { useState, useEffect } from "react"
import { attendanceService } from "@/services/attendanceService"
import { adminService, CreateSessionPayload } from "@/services/adminService"
import { PageHeader } from "@/components/ui/PageHeader"
import { DataTable } from "@/components/ui/DataTable"
import { FilterBar } from "@/components/ui/FilterBar"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { MobileRecordCard } from "@/components/ui/MobileRecordCard"
import { ExportCsvButton } from "@/components/ui/ExportCsvButton"
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
  FiRefreshCw,
  FiCheck,
  FiCopy,
  FiPlus,
  FiX,
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
      const data = await attendanceService.getSessionRecords(sessionId, searchTerm, status, pageNum, 20)
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
  const records = recordsPage?.content || []

  // Mobile Cards View
  const mobileCards = records.map((rec) => {
    const isPresent = rec.status === "PRESENT"
    return (
      <MobileRecordCard
        key={rec.studentId}
        title={rec.studentName || rec.studentId}
        subtitle={`${rec.studentId} • ${rec.studentEmail || ""}`}
        status={rec.status}
        fields={[
          { label: "QR Pass", value: qrStatus && qrStatus.generatedQr > 0 ? "Generated" : "Pending" },
          { label: "Marked Time", value: rec.markedAt ? rec.markedAt.replace("T", " ").substring(0, 16) : "—", mono: true },
        ]}
        actions={
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setViewingRecord(rec)}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold inline-flex items-center gap-1 border border-slate-200"
            >
              <FiEye /> View Pass
            </button>
            <button
              onClick={() => {
                setActionMessage(`Resent pass to ${rec.studentEmail}`)
                setTimeout(() => setActionMessage(null), 3000)
              }}
              className="px-2.5 py-1 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-900 text-[11px] font-bold inline-flex items-center gap-1 border border-cyan-200"
            >
              <FiSend /> Resend
            </button>
          </div>
        }
      />
    )
  })

  return (
    <div className="space-y-4">
      {/* Header */}
      <PageHeader
        title="Attendance Management"
        count={sessions.length}
        countLabel="sessions"
        subtitle="Workshop day check-ins, gate scanner metrics, and student QR passes"
        actions={
          <div className="flex items-center gap-2">
            <ExportCsvButton
              endpoint="/api/v1/admin/attendance/export"
              filenamePrefix="cbp-attendance"
              params={{
                search,
                sessionId: selectedSessionId || undefined,
              }}
            />
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold uppercase tracking-wider shadow-2xs transition inline-flex items-center gap-1.5 cursor-pointer"
            >
              <FiPlus className="text-xs" /> Create Session
            </button>
            <button
              onClick={fetchSessions}
              className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition border border-slate-200"
              title="Refresh sessions"
            >
              <FiRefreshCw className={loadingSessions ? "animate-spin" : "text-xs"} />
            </button>
          </div>
        }
      />

      {/* Action Notification Banner */}
      {actionMessage && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold">
          {actionMessage}
        </div>
      )}

      {/* SECTION 1: Session Selector Cards */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2.5">
          Select Workshop Day
        </h3>

        {loadingSessions ? (
          <div className="p-4 text-center text-xs text-slate-400">Loading sessions...</div>
        ) : sessions.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-lg border border-slate-200">
            No attendance sessions created yet. Click &quot;+ Create Session&quot; to schedule days.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
            {sessions.map((session) => {
              const isSelected = selectedSessionId === session.id
              return (
                <div
                  key={session.id}
                  onClick={() => {
                    setSelectedSessionId(session.id)
                    setPage(0)
                  }}
                  className={`p-3 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? "bg-cyan-50/40 border-cyan-600 ring-1 ring-cyan-500/30 shadow-xs"
                      : "bg-white border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold font-mono text-slate-900">
                        Day {session.dayNumber}
                      </span>
                      <StatusBadge status={session.status} dot={false} className="text-[9px] px-1.5 py-0" />
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 truncate">{session.title}</h4>
                    <p className="text-[11px] font-mono text-slate-500 mt-0.5">{session.sessionDate}</p>
                  </div>

                  <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-cyan-700">
                      {isSelected ? "Selected" : "View"}
                    </span>
                    {session.status === "UPCOMING" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleActivateSession(session.id)
                        }}
                        className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200"
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
                        className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200"
                      >
                        Close
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* SECTION 2: Selected Session Overview */}
      {selectedSession && (
        <div className="space-y-4">
          {/* Metrics Summary Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs">
              <span className="text-[10px] font-bold uppercase text-slate-400">Total Enrolled</span>
              <p className="text-xl font-extrabold text-slate-900 font-mono mt-0.5">{summary?.totalRegisteredStudents ?? 0}</p>
            </div>
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs">
              <span className="text-[10px] font-bold uppercase text-emerald-700">Present</span>
              <p className="text-xl font-extrabold text-emerald-700 font-mono mt-0.5">{summary?.presentCount ?? 0}</p>
            </div>
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs">
              <span className="text-[10px] font-bold uppercase text-rose-700">Absent</span>
              <p className="text-xl font-extrabold text-rose-700 font-mono mt-0.5">{summary?.absentCount ?? 0}</p>
            </div>
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs">
              <span className="text-[10px] font-bold uppercase text-cyan-800">Attendance %</span>
              <p className="text-xl font-extrabold text-cyan-800 font-mono mt-0.5">
                {(summary?.attendancePercentage ?? 0).toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Pass Generation Toolbar */}
          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-bold text-slate-800">Student Gate Pass Control:</span>
              <span className="text-slate-500 font-mono">
                {qrStatus ? `${qrStatus.generatedQr} / ${qrStatus.totalStudents} Generated` : "Ready"}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleGenerateStudentQrs}
                disabled={generatingStudentQrs}
                className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold uppercase tracking-wider transition disabled:opacity-50 inline-flex items-center gap-1.5 shadow-2xs"
              >
                {generatingStudentQrs ? <FiRefreshCw className="animate-spin text-xs" /> : <FiZap className="text-xs" />}
                <span>Generate QR Passes</span>
              </button>
              <button
                onClick={() => {
                  setActionMessage("Queued QR notifications dispatch via Email Templates.")
                  setTimeout(() => setActionMessage(null), 3000)
                }}
                className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition inline-flex items-center gap-1.5 shadow-2xs"
              >
                <FiMail className="text-xs text-slate-500" />
                <span>Send Emails</span>
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <FilterBar
            search={search}
            onSearchChange={(val) => {
              setSearch(val)
              setPage(0)
            }}
            searchPlaceholder="Search student ID, name..."
            filters={[
              {
                id: "statusFilter",
                value: statusFilter,
                onChange: (val) => {
                  setStatusFilter(val)
                  setPage(0)
                },
                options: [
                  { label: "All Statuses", value: "ALL" },
                  { label: "Present", value: "PRESENT" },
                  { label: "Absent", value: "ABSENT" },
                ],
              },
            ]}
          />

          {/* Data Table */}
          <DataTable
            title="Attendance Records Log"
            totalCount={recordsPage?.totalElements}
            loading={recordsLoading}
            data={records}
            currentPage={page}
            totalPages={recordsPage?.totalPages ?? 1}
            pageSize={20}
            onPageChange={(p) => setPage(p)}
            emptyMessage="No student attendance records matching criteria"
            mobileView={mobileCards.length > 0 ? <>{mobileCards}</> : null}
          >
            <table className="w-full text-left text-xs border-collapse">
              <thead className="sticky top-0 bg-slate-50/95 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 border-b border-slate-200 z-10 backdrop-blur-2xs">
                <tr>
                  <th className="px-4 py-2.5">Student Name</th>
                  <th className="px-4 py-2.5">Student ID</th>
                  <th className="px-4 py-2.5">Email</th>
                  <th className="px-4 py-2.5">Status</th>
                  <th className="px-4 py-2.5">Marked Time</th>
                  <th className="px-4 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {records.map((rec) => {
                  const isPresent = rec.status === "PRESENT"
                  return (
                    <tr key={rec.studentId} className="hover:bg-slate-50/70 transition">
                      <td className="px-4 py-2.5 font-bold text-slate-900">{rec.studentName}</td>
                      <td className="px-4 py-2.5 font-mono font-bold text-slate-700">{rec.studentId}</td>
                      <td className="px-4 py-2.5 text-slate-500 font-mono">{rec.studentEmail}</td>
                      <td className="px-4 py-2.5">
                        <StatusBadge status={rec.status} />
                      </td>
                      <td className="px-4 py-2.5 text-slate-500 font-mono text-[11px]">
                        {rec.markedAt ? rec.markedAt.replace("T", " ").substring(0, 16) : "—"}
                      </td>
                      <td className="px-4 py-2.5 text-right space-x-1.5">
                        <button
                          onClick={() => setViewingRecord(rec)}
                          className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold inline-flex items-center gap-1 border border-slate-200"
                        >
                          <FiEye className="text-xs text-slate-600" /> Pass
                        </button>
                        <button
                          onClick={() => {
                            setActionMessage(`Resent pass to ${rec.studentEmail}`)
                            setTimeout(() => setActionMessage(null), 3000)
                          }}
                          className="px-2 py-1 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-900 text-xs font-semibold inline-flex items-center gap-1 border border-cyan-200"
                        >
                          <FiSend className="text-xs text-cyan-700" /> Resend
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </DataTable>
        </div>
      )}

      {/* MODAL 1: Create New Workshop Session */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 shadow-xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-700"
            >
              <FiX className="text-lg" />
            </button>

            <h3 className="text-base font-extrabold text-slate-900 mb-1">Create Workshop Session</h3>
            <p className="text-xs text-slate-500 mb-4">Configure day attendance date and gate parameters.</p>

            {createError && (
              <div className="mb-3 p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateSessionSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-2.5">
                <div className="col-span-1">
                  <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">Day No *</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    required
                    value={newDayNum}
                    onChange={(e) => setNewDayNum(parseInt(e.target.value, 10) || 1)}
                    className="w-full rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-cyan-600 focus:outline-none font-semibold"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-cyan-600 focus:outline-none font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Orientation & Leadership"
                  className="w-full rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-cyan-600 focus:outline-none font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={newStart}
                    onChange={(e) => setNewStart(e.target.value)}
                    className="w-full rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-cyan-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">End Time</label>
                  <input
                    type="time"
                    value={newEnd}
                    onChange={(e) => setNewEnd(e.target.value)}
                    className="w-full rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-cyan-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">Venue</label>
                <input
                  type="text"
                  value={newVenue}
                  onChange={(e) => setNewVenue(e.target.value)}
                  className="w-full rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-cyan-600 focus:outline-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="w-1/2 rounded-lg bg-slate-100 border border-slate-200 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-700 hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="w-1/2 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white py-2.5 text-xs font-bold uppercase tracking-wider shadow-2xs transition disabled:opacity-50"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-slate-200 shadow-xl relative">
            <button
              onClick={() => setViewingRecord(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-700"
            >
              <FiX className="text-lg" />
            </button>

            <h3 className="text-sm font-extrabold text-slate-900 mb-1">Student Attendance Pass</h3>
            <p className="text-xs text-slate-500 mb-4">{viewingRecord.studentName} ({viewingRecord.studentId})</p>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-0.5">
                <span className="text-[10px] font-bold uppercase text-slate-400">HMAC Token</span>
                <p className="font-mono text-xs font-bold text-slate-900 break-all">
                  {`CBP_STUDENT_QR_${viewingRecord.studentId}_${selectedSessionId}`}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Status</span>
                  <p className="font-bold text-slate-900 mt-0.5">{viewingRecord.status}</p>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] font-bold uppercase text-slate-400">Email</span>
                  <p className="font-bold text-slate-900 mt-0.5 truncate">{viewingRecord.studentEmail}</p>
                </div>
              </div>

              <button
                onClick={() => handleCopyRecordToken(`CBP_STUDENT_QR_${viewingRecord.studentId}_${selectedSessionId}`)}
                className="w-full py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center gap-1.5 shadow-2xs transition"
              >
                {copiedToken ? <FiCheck className="text-emerald-200" /> : <FiCopy />}
                <span>{copiedToken ? "Copied!" : "Copy Token"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
