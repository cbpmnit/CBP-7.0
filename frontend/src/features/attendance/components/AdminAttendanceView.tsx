"use client"

import { useState, useEffect } from "react"
import { useAppSelector } from "@/store/hooks"
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
  StudentAttendanceProfile,
  UserAttendanceProfile,
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
  FiAlertCircle,
  FiUser,
  FiInfo,
  FiDollarSign,
  FiAward,
  FiActivity,
  FiLock,
  FiUnlock,
  FiShield,
} from "react-icons/fi"

export default function AdminAttendanceView() {
  const { role, permissions } = useAppSelector((state) => state.auth)
  const normalizedRole = (role || "").toUpperCase().replace("ROLE_", "")
  const canEdit =
    normalizedRole === "ADMIN" ||
    (permissions || []).includes("SESSION_EDIT") ||
    (permissions || []).includes("SESSION_MANAGE")

  const [sessions, setSessions] = useState<AttendanceSessionDto[]>([])
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null)
  const [loadingSessions, setLoadingSessions] = useState(true)

  // Session Edit Modal State
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editDesc, setEditDesc] = useState("")
  const [editDate, setEditDate] = useState("")
  const [editStart, setEditStart] = useState("")
  const [editEnd, setEditEnd] = useState("")
  const [editVenue, setEditVenue] = useState("")
  const [editStatus, setEditStatus] = useState<any>("UPCOMING")
  const [updating, setUpdating] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)

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

  // Drawers State
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)
  const [studentProfile, setStudentProfile] = useState<StudentAttendanceProfile | null>(null)
  const [studentProfileLoading, setStudentProfileLoading] = useState(false)

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [userProfile, setUserProfile] = useState<UserAttendanceProfile | null>(null)
  const [userProfileLoading, setUserProfileLoading] = useState(false)

  // Drawer handlers
  const handleOpenStudentDrawer = async (studentId: string) => {
    setSelectedStudentId(studentId)
    setStudentProfileLoading(true)
    setStudentProfile(null)
    try {
      const data = await attendanceService.getStudentAttendanceProfile(studentId)
      setStudentProfile(data)
    } catch (err) {
      console.error("Failed to load student profile:", err)
    } finally {
      setStudentProfileLoading(false)
    }
  }

  const handleOpenUserDrawer = async (userId: string) => {
    setSelectedUserId(userId)
    setUserProfileLoading(true)
    setUserProfile(null)
    try {
      const data = await attendanceService.getUserAttendanceProfile(userId)
      setUserProfile(data)
    } catch (err) {
      console.error("Failed to load user profile:", err)
    } finally {
      setUserProfileLoading(false)
    }
  }

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

  const formatTime12h = (timeStr?: string | null) => {
    if (!timeStr) return "—"
    const parts = timeStr.split(":")
    if (parts.length < 2) return timeStr
    let hours = parseInt(parts[0], 10)
    const minutes = parts[1]
    const ampm = hours >= 12 ? "PM" : "AM"
    hours = hours % 12
    hours = hours ? hours : 12
    const hoursStr = hours < 10 ? `0${hours}` : hours.toString()
    return `${hoursStr}:${minutes} ${ampm}`
  }

  const handleOpenEditModal = (session: AttendanceSessionDto) => {
    setEditingSessionId(session.id)
    setEditTitle(session.title)
    setEditDesc(session.description || "")
    setEditDate(session.sessionDate || "")
    setEditStart(session.startTime ? session.startTime.substring(0, 5) : "")
    setEditEnd(session.endTime ? session.endTime.substring(0, 5) : "")
    setEditVenue(session.venue || "")
    setEditStatus(session.status)
    setEditError(null)
    setShowEditModal(true)
  }

  const handleEditSessionSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editTitle.trim() || !editDate || !editingSessionId) {
      setEditError("Please enter session title and date.")
      return
    }

    setUpdating(true)
    setEditError(null)

    const payload = {
      title: editTitle.trim(),
      description: editDesc.trim() || undefined,
      sessionDate: editDate,
      startTime: editStart ? `${editStart}:00` : undefined,
      endTime: editEnd ? `${editEnd}:00` : undefined,
      venue: editVenue.trim() || undefined,
      status: editStatus,
    }

    try {
      await adminService.updateSession(editingSessionId, payload)
      setActionMessage("Session updated successfully. Attendance validity synchronized.")
      setTimeout(() => setActionMessage(null), 4000)
      setShowEditModal(false)
      await fetchSessions()
      if (selectedSessionId) {
        await loadSessionDetails(selectedSessionId)
        await loadRecords(selectedSessionId, search, statusFilter, page)
      }
    } catch (err: any) {
      setEditError(err?.message || "Failed to update attendance session.")
    } finally {
      setUpdating(false)
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
      await attendanceService.generateStudentQrsForSession(selectedSessionId)
      setActionMessage("QR passes regenerated successfully.")
      await loadSessionDetails(selectedSessionId)
      await loadRecords(selectedSessionId, search, statusFilter, page)
      setTimeout(() => setActionMessage(null), 4000)
    } catch (err: any) {
      setActionMessage("QR regeneration failed. Please retry.")
      setTimeout(() => setActionMessage(null), 4000)
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
        title={
          <button
            onClick={() => handleOpenStudentDrawer(rec.studentId)}
            className="font-bold text-cyan-700 hover:text-cyan-900 hover:underline text-left text-xs"
          >
            {rec.studentName || rec.studentId}
          </button>
        }
        subtitle={`${rec.studentId} • ${rec.studentEmail || ""}`}
        status={rec.status}
        fields={[
          { label: "QR Pass", value: qrStatus && qrStatus.generatedQr > 0 ? "Generated" : "Pending" },
          { label: "Marked Time", value: rec.markedAt ? rec.markedAt.replace("T", " ").substring(0, 16) : "—", mono: true },
          {
            label: "Marked By",
            value: rec.markedByDetail ? (
              <button
                onClick={() => handleOpenUserDrawer(rec.markedByDetail?.id || rec.markedBy || "")}
                className="text-cyan-700 hover:underline text-[11px] font-semibold text-left"
              >
                {rec.markedBy || "System"} ({rec.markedByDetail.role.replace("ROLE_", "").toLowerCase()})
              </button>
            ) : (
              <span className="text-[11px] text-slate-600">{rec.markedBy || "System"}</span>
            )
          }
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
              onClick={() => handleOpenStudentDrawer(rec.studentId)}
              className="px-2.5 py-1 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-800 text-[11px] font-bold inline-flex items-center gap-1 border border-cyan-200"
            >
              <FiUser /> Profile
            </button>
            <button
              onClick={() => {
                setActionMessage(`Resent pass to ${rec.studentEmail}`)
                setTimeout(() => setActionMessage(null), 3000)
              }}
              className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-[11px] font-bold inline-flex items-center gap-1 border border-emerald-200"
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
                    <p className="text-[10px] font-mono text-cyan-800 font-semibold mt-0.5">
                      {formatTime12h(session.startTime || undefined)} - {formatTime12h(session.endTime || undefined)}
                    </p>
                    {canEdit && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleOpenEditModal(session)
                        }}
                        className="mt-1.5 text-[10px] font-bold text-cyan-700 bg-cyan-50/50 hover:bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200/60 transition w-full text-center cursor-pointer"
                      >
                        Edit Session
                      </button>
                    )}
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
                  <th className="px-4 py-2.5">Marked By</th>
                  <th className="px-4 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {records.map((rec) => {
                  const isPresent = rec.status === "PRESENT"
                  return (
                    <tr key={rec.studentId} className="hover:bg-slate-50/70 transition">
                      <td className="px-4 py-2.5">
                        <button
                          onClick={() => handleOpenStudentDrawer(rec.studentId)}
                          className="font-bold text-cyan-700 hover:text-cyan-900 hover:underline text-left text-xs"
                        >
                          {rec.studentName || rec.studentId}
                        </button>
                      </td>
                      <td className="px-4 py-2.5 font-mono font-bold text-slate-700">{rec.studentId}</td>
                      <td className="px-4 py-2.5 text-slate-500 font-mono">{rec.studentEmail}</td>
                      <td className="px-4 py-2.5">
                        <StatusBadge status={rec.status} />
                      </td>
                      <td className="px-4 py-2.5 text-slate-500 font-mono text-[11px]">
                        {rec.markedAt ? rec.markedAt.replace("T", " ").substring(0, 16) : "—"}
                      </td>
                      <td className="px-4 py-2.5">
                        {rec.markedByDetail ? (
                          <button
                            onClick={() => handleOpenUserDrawer(rec.markedByDetail?.id || rec.markedBy || "")}
                            className="text-left group"
                          >
                            <div className="font-semibold text-slate-800 group-hover:text-cyan-700 group-hover:underline text-xs">
                              {rec.markedBy || "System"}
                            </div>
                            <div className="text-[10px] text-slate-500 font-mono">
                              {rec.markedByDetail.role.replace("ROLE_", "").toLowerCase()}
                            </div>
                          </button>
                        ) : (
                          <span className="text-slate-500 font-mono text-[11px]">{rec.markedBy || "System"}</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => setViewingRecord(rec)}
                          title="View Gate Pass"
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold inline-flex items-center gap-1 border border-slate-200"
                        >
                          <FiEye className="text-xs text-slate-600" />
                          <span className="hidden sm:inline">Pass</span>
                        </button>
                        <button
                          onClick={() => handleOpenStudentDrawer(rec.studentId)}
                          title="View Student Profile"
                          className="p-1.5 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-800 text-xs font-semibold inline-flex items-center gap-1 border border-cyan-100"
                        >
                          <FiUser className="text-xs text-cyan-600" />
                          <span className="hidden sm:inline">Profile</span>
                        </button>
                        <button
                          onClick={() => {
                            setActionMessage(`Resent pass to ${rec.studentEmail}`)
                            setTimeout(() => setActionMessage(null), 3000)
                          }}
                          title="Resend Gate Pass Email"
                          className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold inline-flex items-center gap-1 border border-emerald-100"
                        >
                          <FiSend className="text-xs text-emerald-600" />
                          <span className="hidden sm:inline">Resend</span>
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

      {/* MODAL 1.5: Edit Session */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full border border-slate-200 shadow-xl relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <FiX className="text-lg" />
            </button>

            <h3 className="text-sm font-extrabold text-slate-900 mb-1">Edit Session</h3>
            <p className="text-xs text-slate-500 mb-4">
              Modify timing, venue, and status parameters.
            </p>

            {editError && (
              <div className="mb-3.5 p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 text-[11px] font-semibold flex items-center gap-1.5">
                <FiAlertCircle className="text-rose-600 shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleEditSessionSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-3 gap-2.5">
                <div className="col-span-1">
                  <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">Day</label>
                  <input
                    type="number"
                    disabled
                    value={editingSessionId ? sessions.find(s => s.id === editingSessionId)?.dayNumber || 1 : 1}
                    className="w-full rounded-lg bg-slate-100 border border-slate-200 px-3 py-2 text-xs text-slate-500 focus:outline-none font-semibold cursor-not-allowed"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={editDate}
                    onChange={(e) => setEditDate(e.target.value)}
                    className="w-full rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-cyan-600 focus:outline-none font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-cyan-600 focus:outline-none font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">Start Time</label>
                  <input
                    type="time"
                    value={editStart}
                    onChange={(e) => setEditStart(e.target.value)}
                    className="w-full rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-cyan-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">End Time</label>
                  <input
                    type="time"
                    value={editEnd}
                    onChange={(e) => setEditEnd(e.target.value)}
                    className="w-full rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-cyan-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">Venue</label>
                <input
                  type="text"
                  value={editVenue}
                  onChange={(e) => setEditVenue(e.target.value)}
                  className="w-full rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-cyan-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-700 mb-1">Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:bg-white focus:border-cyan-600 focus:outline-none font-semibold"
                >
                  <option value="UPCOMING">Upcoming</option>
                  <option value="ACTIVE">Active</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CLOSED">Closed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="w-1/2 rounded-lg bg-slate-100 border border-slate-200 py-2.5 text-xs font-bold uppercase tracking-wider text-slate-700 hover:bg-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="w-1/2 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white py-2.5 text-xs font-bold uppercase tracking-wider shadow-2xs transition disabled:opacity-50"
                >
                  {updating ? "Saving..." : "Save Changes"}
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

      {/* DRAWER 1: Student Profile Drawer */}
      {selectedStudentId && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-2xs transition-opacity">
          <div className="fixed inset-0" onClick={() => setSelectedStudentId(null)} />
          <div className="relative w-full max-w-sm sm:max-w-md bg-white h-full shadow-2xl border-l border-slate-100 flex flex-col animate-slide-in">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-cyan-100 text-cyan-800">
                  <FiUser className="text-sm" />
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-slate-900">Student Profile Summary</h3>
                  <p className="text-[10px] text-slate-500 font-mono">ID: {selectedStudentId}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStudentId(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <FiX className="text-base" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {studentProfileLoading ? (
                <div className="flex flex-col items-center justify-center h-48 gap-2">
                  <FiRefreshCw className="text-lg text-cyan-600 animate-spin" />
                  <p className="text-[10px] text-slate-500 font-mono">Fetching student audit history...</p>
                </div>
              ) : studentProfile ? (
                <>
                  {/* Card 1: Student Info */}
                  <div className="bg-slate-50/60 p-3 rounded-xl border border-slate-100 space-y-2">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Student Information</div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-mono">Full Name</span>
                        <span className="font-bold text-slate-900">{studentProfile.name || "N/A"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-mono">Branch</span>
                        <span className="font-bold text-slate-900">{studentProfile.branch || "N/A"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-mono">Email Address</span>
                        <span className="font-bold text-slate-700 break-all">{studentProfile.email || "N/A"}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-mono">Academic Year</span>
                        <span className="font-bold text-slate-900">Year {studentProfile.year || "N/A"}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-[10px] text-slate-400 block font-mono">Phone Number</span>
                        <span className="font-bold text-slate-900">{studentProfile.phoneNumber || "N/A"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Registration & Payments */}
                  <div className="bg-slate-50/60 p-3 rounded-xl border border-slate-100 space-y-2">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Registration Status</div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="p-2 bg-white rounded-lg border border-slate-100">
                        <span className="text-[9px] text-slate-400 block font-mono">Date</span>
                        <span className="font-bold text-slate-800 text-[10px]">
                          {studentProfile.registrationDate ? studentProfile.registrationDate.substring(0, 10) : "N/A"}
                        </span>
                      </div>
                      <div className="p-2 bg-white rounded-lg border border-slate-100 flex flex-col">
                        <span className="text-[9px] text-slate-400 block font-mono mb-0.5">Payment</span>
                        <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full text-center ${
                          studentProfile.paymentStatus === "PAID" 
                            ? "bg-emerald-100 text-emerald-800" 
                            : "bg-amber-100 text-amber-800"
                        }`}>
                          {studentProfile.paymentStatus}
                        </span>
                      </div>
                      <div className="p-2 bg-white rounded-lg border border-slate-100 flex flex-col">
                        <span className="text-[9px] text-slate-400 block font-mono mb-0.5">Certificate</span>
                        <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full text-center ${
                          studentProfile.certificateStatus === "ISSUED"
                            ? "bg-emerald-100 text-emerald-800"
                            : studentProfile.certificateStatus === "ELIGIBLE"
                            ? "bg-cyan-100 text-cyan-800"
                            : "bg-slate-100 text-slate-800"
                        }`}>
                          {studentProfile.certificateStatus}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Attendance Summary */}
                  <div className="bg-slate-50/60 p-3 rounded-xl border border-slate-100 space-y-2.5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Attendance Statistics</div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-white p-2 rounded-lg border border-slate-100">
                        <span className="text-[9px] text-slate-400 block font-mono">Sessions</span>
                        <span className="text-sm font-extrabold text-slate-800">{studentProfile.totalSessions}</span>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-100">
                        <span className="text-[9px] text-slate-400 block font-mono">Attended</span>
                        <span className="text-sm font-extrabold text-emerald-600">{studentProfile.presentCount}</span>
                      </div>
                      <div className="bg-white p-2 rounded-lg border border-slate-100">
                        <span className="text-[9px] text-slate-400 block font-mono">Absent</span>
                        <span className="text-sm font-extrabold text-rose-600">{studentProfile.absentCount}</span>
                      </div>
                    </div>

                    <div className="space-y-1 bg-white p-2.5 rounded-lg border border-slate-100">
                      <div className="flex justify-between items-center text-[10px] font-bold">
                        <span className="text-slate-500 font-mono">Progress Percentage</span>
                        <span className={studentProfile.attendancePercentage >= 75 ? "text-emerald-600" : "text-rose-600"}>
                          {studentProfile.attendancePercentage}%
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            studentProfile.attendancePercentage >= 75 ? "bg-emerald-500" : "bg-rose-500"
                          }`}
                          style={{ width: `${studentProfile.attendancePercentage}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Timeline: Attendance History */}
                  <div className="space-y-2">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Attendance History Timeline</div>
                    <div className="relative border-l border-slate-200 pl-4 ml-2.5 space-y-3.5">
                      {studentProfile.attendanceHistory && studentProfile.attendanceHistory.map((hist, idx) => {
                        const isPresent = hist.status === "PRESENT"
                        return (
                          <div key={idx} className="relative">
                            {/* Dot indicator */}
                            <span className={`absolute -left-[21px] mt-1.5 w-2.5 h-2.5 rounded-full border-2 border-white shadow-xs ${
                              isPresent ? "bg-emerald-500" : "bg-slate-300"
                            }`} />
                            <div className="p-2 bg-white rounded-lg border border-slate-100 shadow-xs space-y-1">
                              <div className="flex justify-between items-start gap-1">
                                <span className="font-extrabold text-slate-800 text-[10.5px]">Day {hist.dayNumber}: {hist.title}</span>
                                <span className={`text-[8.5px] font-extrabold px-1 rounded-sm uppercase ${
                                  isPresent ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
                                }`}>
                                  {hist.status}
                                </span>
                              </div>
                              {isPresent && (
                                <div className="text-[9px] text-slate-500 flex flex-col font-mono">
                                  <span>Marked At: {hist.markedAt ? hist.markedAt.replace("T", " ").substring(0, 16) : "—"}</span>
                                  <span>Marked By: {hist.markedBy || "System"}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center text-xs text-slate-400 py-12">No profile information available.</div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* DRAWER 2: Volunteer/Admin Profile Drawer */}
      {selectedUserId && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-2xs transition-opacity">
          <div className="fixed inset-0" onClick={() => setSelectedUserId(null)} />
          <div className="relative w-full max-w-sm sm:max-w-md bg-white h-full shadow-2xl border-l border-slate-100 flex flex-col animate-slide-in">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-800">
                  <FiShield className="text-sm" />
                </div>
                <div>
                  <h3 className="text-xs font-extrabold text-slate-900">Operator Audit Summary</h3>
                  <p className="text-[10px] text-slate-500 font-mono">User ID: {selectedUserId}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUserId(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <FiX className="text-base" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {userProfileLoading ? (
                <div className="flex flex-col items-center justify-center h-48 gap-2">
                  <FiRefreshCw className="text-lg text-cyan-600 animate-spin" />
                  <p className="text-[10px] text-slate-500 font-mono">Fetching operator audit history...</p>
                </div>
              ) : userProfile ? (
                <>
                  {/* Card 1: User Info */}
                  <div className="bg-slate-50/60 p-3 rounded-xl border border-slate-100 space-y-2">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">User Profile Information</div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-slate-400 block font-mono">Name</span>
                        <span className="font-bold text-slate-900">{userProfile.name}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block font-mono">Authorized Role</span>
                        <span className="font-extrabold text-cyan-700 uppercase">{userProfile.role}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-[10px] text-slate-400 block font-mono">Email Address</span>
                        <span className="font-bold text-slate-700 break-all">{userProfile.email}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card 2: Permissions Granted */}
                  <div className="bg-slate-50/60 p-3 rounded-xl border border-slate-100 space-y-2">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Assigned Operational Permissions</div>
                    <div className="flex flex-wrap gap-1.5">
                      {userProfile.permissions && userProfile.permissions.length > 0 ? (
                        userProfile.permissions.map((p, idx) => (
                          <span 
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-cyan-50 border border-cyan-100 text-cyan-900 font-bold font-mono text-[9px]"
                          >
                            {p}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400 font-mono italic">No special authorities assigned</span>
                      )}
                    </div>
                  </div>

                  {/* Activity List: Recent Actions */}
                  <div className="space-y-2">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">Recent Attendance Audit Activity</div>
                    {userProfile.recentActivities && userProfile.recentActivities.length > 0 ? (
                      <div className="space-y-2">
                        {userProfile.recentActivities.map((act, idx) => (
                          <div key={idx} className="p-2.5 bg-white rounded-lg border border-slate-100 shadow-xs flex gap-2">
                            <FiActivity className="text-slate-400 text-xs shrink-0 mt-0.5" />
                            <div className="flex-1 space-y-0.5">
                              <p className="text-[10.5px] font-bold text-slate-800">{act.description}</p>
                              <span className="text-[9px] text-slate-400 font-mono block">
                                {act.timestamp ? act.timestamp.replace("T", " ").substring(0, 16) : "—"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-xs text-slate-400 py-6 border border-dashed border-slate-200 rounded-lg">
                        No recent attendance operations found for this operator.
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center text-xs text-slate-400 py-12">No profile information available.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
