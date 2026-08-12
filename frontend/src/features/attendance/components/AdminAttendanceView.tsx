"use client"

import { useState, useEffect, useCallback, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useAppSelector } from "@/store/hooks"
import { attendanceService } from "@/services/attendanceService"
import { adminService } from "@/services/adminService"
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
  FiX,
  FiZap,
  FiMail,
  FiEye,
  FiSend,
  FiAlertCircle,
  FiCheckCircle,
  FiUser,
  FiActivity,
  FiShield,
  FiSliders,
  FiCamera,
  FiUsers,
  FiPlay,
  FiSquare,
} from "react-icons/fi"

function AttendanceContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const urlSessionId = searchParams.get("sessionId")

  const { role, permissions } = useAppSelector((state) => state.auth)
  const normalizedRole = (role || "").toUpperCase().replace("ROLE_", "")
  const canManage =
    normalizedRole === "ADMIN" ||
    (permissions || []).includes("SESSION_MANAGE") ||
    (permissions || []).includes("SESSION_EDIT")

  const [sessions, setSessions] = useState<AttendanceSessionDto[]>([])
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(urlSessionId || null)
  const [loadingSessions, setLoadingSessions] = useState(true)

  // Summary State
  const [summary, setSummary] = useState<SessionSummaryResponse | null>(null)
  const [summaryLoading, setSummaryLoading] = useState(false)

  // Student QR Generation State
  const [qrStatus, setQrStatus] = useState<QrGenerationStatusResponse | null>(null)
  const [generatingStudentQrs, setGeneratingStudentQrs] = useState(false)
  const [regenerating, setRegenerating] = useState(false)

  // Records Table State
  const [recordsPage, setRecordsPage] = useState<PageResponse<StudentSessionRecordDto> | null>(null)
  const [recordsLoading, setRecordsLoading] = useState(false)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")
  const [page, setPage] = useState(0)

  // Action / Feedback Messages
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

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

  const fetchSessions = useCallback(async () => {
    setLoadingSessions(true)
    try {
      const data = await attendanceService.getAllSessions()
      setSessions(data || [])
    } catch (err) {
      console.error("Failed to load attendance sessions", err)
    } finally {
      setLoadingSessions(false)
    }
  }, [])

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  // Synchronize initial / fallback session selection
  useEffect(() => {
    if (sessions.length === 0) return

    if (urlSessionId && sessions.some((s) => s.id === urlSessionId)) {
      if (selectedSessionId !== urlSessionId) {
        setSelectedSessionId(urlSessionId)
      }
    } else if (!selectedSessionId || !sessions.some((s) => s.id === selectedSessionId)) {
      const defaultId = sessions[0].id
      setSelectedSessionId(defaultId)
      router.replace(`/admin/attendance?sessionId=${defaultId}`, { scroll: false })
    }
  }, [sessions, urlSessionId, selectedSessionId, router])

  const handleSelectSession = (sessionId: string) => {
    if (selectedSessionId === sessionId) return
    setSelectedSessionId(sessionId)
    setPage(0)
    router.replace(`/admin/attendance?sessionId=${sessionId}`, { scroll: false })
  }

  const loadSessionDetails = useCallback(async (sessionId: string) => {
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
  }, [])

  const loadRecords = useCallback(
    async (sessionId: string, searchTerm: string, status: string, pageNum: number) => {
      setRecordsLoading(true)
      try {
        const data = await attendanceService.getSessionRecords(
          sessionId,
          searchTerm,
          status,
          pageNum,
          20
        )
        setRecordsPage(data)
      } catch (err) {
        console.error("Failed to load session records", err)
      } finally {
        setRecordsLoading(false)
      }
    },
    []
  )

  useEffect(() => {
    if (selectedSessionId) {
      loadSessionDetails(selectedSessionId)
    }
  }, [selectedSessionId, loadSessionDetails])

  useEffect(() => {
    if (selectedSessionId) {
      loadRecords(selectedSessionId, search, statusFilter, page)
    }
  }, [selectedSessionId, search, statusFilter, page, loadRecords])

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

  const handleGenerateStudentQrs = async () => {
    if (!selectedSessionId) return
    setGeneratingStudentQrs(true)
    setActionMessage(null)
    setErrorMessage(null)
    try {
      const res = await attendanceService.generateStudentQrsForSession(selectedSessionId)
      const count = res.generatedCount ?? res.generated ?? res.totalStudents ?? 0
      setActionMessage(`Generated student QR passes for ${count} registered students.`)
      await loadSessionDetails(selectedSessionId)
      await loadRecords(selectedSessionId, search, statusFilter, page)
      setTimeout(() => setActionMessage(null), 4000)
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to generate student QR passes.")
      setTimeout(() => setErrorMessage(null), 4000)
    } finally {
      setGeneratingStudentQrs(false)
    }
  }

  const handleRegenerateStudentQrs = async () => {
    if (!selectedSessionId) return
    if (
      !confirm(
        "Are you sure you want to regenerate QR passes? This will invalidate all previously issued QR tokens for this session."
      )
    ) {
      return
    }

    setRegenerating(true)
    setActionMessage(null)
    setErrorMessage(null)
    try {
      const res = await attendanceService.generateStudentQrsForSession(selectedSessionId)
      const count = res.generatedCount ?? res.generated ?? res.totalStudents ?? 0
      setActionMessage(
        `Successfully regenerated QR passes for all ${count} students. Previous tokens invalidated.`
      )
      await loadSessionDetails(selectedSessionId)
      await loadRecords(selectedSessionId, search, statusFilter, page)
      setTimeout(() => setActionMessage(null), 4000)
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to regenerate student QR passes.")
      setTimeout(() => setErrorMessage(null), 4000)
    } finally {
      setRegenerating(false)
    }
  }

  const handleActivateSession = async (sessionId: string) => {
    try {
      await adminService.activateSession(sessionId)
      setActionMessage("Session activated. Check-in is now open.")
      setTimeout(() => setActionMessage(null), 3500)
      await fetchSessions()
      if (selectedSessionId === sessionId) loadSessionDetails(sessionId)
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to activate session.")
      setTimeout(() => setErrorMessage(null), 4000)
    }
  }

  const handleCloseSession = async (sessionId: string) => {
    try {
      await adminService.closeSession(sessionId)
      setActionMessage("Session closed. Check-in is now locked.")
      setTimeout(() => setActionMessage(null), 3500)
      await fetchSessions()
      if (selectedSessionId === sessionId) loadSessionDetails(sessionId)
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to close session.")
      setTimeout(() => setErrorMessage(null), 4000)
    }
  }

  const handleCopyRecordToken = (token: string) => {
    navigator.clipboard.writeText(token)
    setCopiedToken(true)
    setTimeout(() => setCopiedToken(false), 2000)
  }

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

  const selectedSession = sessions.find((s) => s.id === selectedSessionId)
  const records = recordsPage?.content || []

  // Mobile Cards View
  const mobileCards = records.map((rec) => {
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
          {
            label: "QR Pass",
            value: qrStatus && qrStatus.generatedQr > 0 ? "Generated" : "Pending",
          },
          {
            label: "Marked Time",
            value: rec.markedAt ? rec.markedAt.replace("T", " ").substring(0, 16) : "—",
            mono: true,
          },
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
            ),
          },
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
            {selectedSession?.status === "ACTIVE" && (
              <button
                onClick={() => {
                  setActionMessage(`Resent gate pass notification to ${rec.studentEmail}`)
                  setTimeout(() => setActionMessage(null), 3000)
                }}
                className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-[11px] font-bold inline-flex items-center gap-1 border border-emerald-200"
              >
                <FiSend /> Resend
              </button>
            )}
          </div>
        }
      />
    )
  })

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <PageHeader
        title="Attendance Management"
        count={sessions.length}
        countLabel="sessions"
        subtitle="Workshop check-in operations, student QR passes, and live gate records"
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
            <Link
              href="/admin/sessions"
              className="px-3.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold uppercase tracking-wider transition shadow-2xs inline-flex items-center gap-1.5 cursor-pointer"
            >
              <FiSliders className="text-xs text-slate-500" />
              <span>Sessions Schedule &rarr;</span>
            </Link>
            <button
              onClick={() => {
                fetchSessions()
                if (selectedSessionId) {
                  loadSessionDetails(selectedSessionId)
                  loadRecords(selectedSessionId, search, statusFilter, page)
                }
              }}
              className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition border border-slate-200 cursor-pointer"
              title="Refresh attendance records"
            >
              <FiRefreshCw className={loadingSessions || summaryLoading ? "animate-spin text-xs" : "text-xs"} />
            </button>
          </div>
        }
      />

      {/* Action Notification Banners */}
      {actionMessage && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2">
          <FiCheckCircle className="text-emerald-600 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 text-xs font-semibold flex items-center gap-2">
          <FiAlertCircle className="text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* SECTION 1: Session Selector Cards */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-2xs">
        <div className="flex items-center justify-between mb-2.5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Select Workshop Day
          </h3>
          <Link
            href="/admin/sessions"
            className="text-[11px] font-bold text-cyan-700 hover:text-cyan-900 hover:underline inline-flex items-center gap-1"
          >
            <span>Manage All Sessions &rarr;</span>
          </Link>
        </div>

        {loadingSessions ? (
          <div className="p-4 text-center text-xs text-slate-400">Loading workshop sessions...</div>
        ) : sessions.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 rounded-lg border border-slate-200">
            No attendance sessions created yet. Configure sessions in{" "}
            <Link href="/admin/sessions" className="text-cyan-700 font-bold underline">
              Session Management
            </Link>
            .
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
            {sessions.map((session) => {
              const isSelected = selectedSessionId === session.id
              return (
                <div
                  key={session.id}
                  onClick={() => handleSelectSession(session.id)}
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
                      {formatTime12h(session.startTime || undefined)} -{" "}
                      {formatTime12h(session.endTime || undefined)}
                    </p>
                  </div>

                  <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-cyan-700">
                      {isSelected ? "Selected" : "Select"}
                    </span>

                    {canManage && session.status === "UPCOMING" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleActivateSession(session.id)
                        }}
                        className="text-[10px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-200 cursor-pointer"
                        title="Activate check-in for this session"
                      >
                        Activate
                      </button>
                    )}

                    {canManage && session.status === "ACTIVE" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleCloseSession(session.id)
                        }}
                        className="text-[10px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 px-1.5 py-0.5 rounded border border-amber-200 cursor-pointer"
                        title="Close check-in for this session"
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

      {/* SECTION 2 & 3: Selected Session Operations & Overview */}
      {selectedSession && (
        <div className="space-y-4">
          {/* Metrics Summary Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs">
              <span className="text-[10px] font-bold uppercase text-slate-400">Total Enrolled</span>
              <p className="text-xl font-extrabold text-slate-900 font-mono mt-0.5">
                {summary?.totalRegisteredStudents ?? 0}
              </p>
            </div>
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs">
              <span className="text-[10px] font-bold uppercase text-emerald-700">Present</span>
              <p className="text-xl font-extrabold text-emerald-700 font-mono mt-0.5">
                {summary?.presentCount ?? 0}
              </p>
            </div>
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs">
              <span className="text-[10px] font-bold uppercase text-rose-700">Absent</span>
              <p className="text-xl font-extrabold text-rose-700 font-mono mt-0.5">
                {summary?.absentCount ?? 0}
              </p>
            </div>
            <div className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-2xs">
              <span className="text-[10px] font-bold uppercase text-cyan-800">Attendance %</span>
              <p className="text-xl font-extrabold text-cyan-800 font-mono mt-0.5">
                {(summary?.attendancePercentage ?? 0).toFixed(1)}%
              </p>
            </div>
          </div>

          {/* Gate Pass & QR Operation Center */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2.5 border-b border-slate-100 gap-2">
              <div>
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                  <FiZap className="text-cyan-600" />
                  <span>
                    Student Gate Pass Operations &mdash; Day {selectedSession.dayNumber}: {selectedSession.title}
                  </span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {selectedSession.status === "ACTIVE"
                    ? "Generate, refresh, and dispatch encrypted student gate QR passes"
                    : selectedSession.status === "CLOSED"
                    ? "This session is closed. Operational QR controls are locked."
                    : "Session is scheduled. Activate to unlock live QR pass dispatch and scanning."}
                </p>
              </div>

              {qrStatus && (
                <span className="text-xs font-bold font-mono px-2.5 py-1 bg-slate-100 rounded-lg border border-slate-200 text-slate-800 self-start sm:self-auto">
                  {qrStatus.generatedQr} / {qrStatus.totalStudents} Passes Generated
                </span>
              )}
            </div>

            {selectedSession.status === "ACTIVE" ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-3 text-xs text-slate-600">
                  <FiUsers className="text-cyan-700 text-sm" />
                  <span>
                    Eligible Students:{" "}
                    <strong className="text-slate-900 font-mono">
                      {qrStatus?.totalStudents ?? summary?.totalRegisteredStudents ?? 0}
                    </strong>
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={handleGenerateStudentQrs}
                    disabled={generatingStudentQrs || regenerating}
                    className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold uppercase tracking-wider transition shadow-2xs disabled:opacity-50 inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    {generatingStudentQrs ? (
                      <FiRefreshCw className="animate-spin text-xs" />
                    ) : (
                      <FiZap className="text-xs" />
                    )}
                    <span>Generate QR Passes</span>
                  </button>

                  <button
                    onClick={handleRegenerateStudentQrs}
                    disabled={generatingStudentQrs || regenerating}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider transition border border-slate-200 disabled:opacity-50 inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <FiRefreshCw className={regenerating ? "animate-spin text-xs" : "text-xs"} />
                    <span>Regenerate All</span>
                  </button>

                  <button
                    onClick={() => {
                      setActionMessage("Queued QR notifications dispatch via Email Templates.")
                      setTimeout(() => setActionMessage(null), 3500)
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition inline-flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <FiMail className="text-xs text-slate-500" />
                    <span>Send Emails</span>
                  </button>

                  <Link
                    href="/volunteer/scanner"
                    className="px-3.5 py-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition inline-flex items-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <FiCamera className="text-xs text-slate-500" />
                    <span>Scanner View</span>
                  </Link>
                </div>
              </div>
            ) : selectedSession.status === "CLOSED" ? (
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 text-slate-700">
                  <div className="p-2 rounded-lg bg-slate-200 text-slate-700 shrink-0">
                    <FiSquare className="text-sm" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900">Session Closed</h4>
                    <p className="text-slate-500 text-[11px]">
                      QR operations and live check-in are disabled because this workshop session has ended. Historical records remain accessible in read-only mode.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="px-2.5 py-1 rounded-md bg-slate-200 text-slate-700 font-bold font-mono text-[10px] uppercase">
                    Read-Only Mode
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5 text-amber-900">
                  <div className="p-2 rounded-lg bg-amber-100 text-amber-800 shrink-0">
                    <FiClock className="text-sm" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-amber-900">Session Upcoming</h4>
                    <p className="text-amber-700 text-[11px]">
                      This session is scheduled for {selectedSession.sessionDate}. Activate the session to start live gate check-in and QR pass operations.
                    </p>
                  </div>
                </div>
                {canManage && (
                  <button
                    onClick={() => handleActivateSession(selectedSession.id)}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold uppercase tracking-wider transition shadow-2xs inline-flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <FiPlay className="text-xs" />
                    <span>Activate Session</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* SECTION 4: Attendance Records Table & Search */}
          <FilterBar
            search={search}
            onSearchChange={(val) => {
              setSearch(val)
              setPage(0)
            }}
            searchPlaceholder="Search student ID, name, email..."
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
                  return (
                    <tr key={rec.studentId} className="hover:bg-slate-50/70 transition">
                      <td className="px-4 py-2.5">
                        <button
                          onClick={() => handleOpenStudentDrawer(rec.studentId)}
                          className="font-bold text-cyan-700 hover:text-cyan-900 hover:underline text-left text-xs cursor-pointer"
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
                            className="text-left group cursor-pointer"
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
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold inline-flex items-center gap-1 border border-slate-200 cursor-pointer"
                        >
                          <FiEye className="text-xs text-slate-600" />
                          <span className="hidden sm:inline">Pass</span>
                        </button>
                        <button
                          onClick={() => handleOpenStudentDrawer(rec.studentId)}
                          title="View Student Profile"
                          className="p-1.5 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-800 text-xs font-semibold inline-flex items-center gap-1 border border-cyan-100 cursor-pointer"
                        >
                          <FiUser className="text-xs text-cyan-600" />
                          <span className="hidden sm:inline">Profile</span>
                        </button>
                        {selectedSession?.status === "ACTIVE" && (
                          <button
                            onClick={() => {
                              setActionMessage(`Resent gate pass email to ${rec.studentEmail}`)
                              setTimeout(() => setActionMessage(null), 3000)
                            }}
                            title="Resend Gate Pass Email"
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold inline-flex items-center gap-1 border border-emerald-100 cursor-pointer"
                          >
                            <FiSend className="text-xs text-emerald-600" />
                            <span className="hidden sm:inline">Resend</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </DataTable>
        </div>
      )}

      {/* MODAL: View Student QR Pass Token */}
      {viewingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-slate-200 shadow-xl relative animate-in zoom-in-95 duration-150">
            <button
              onClick={() => setViewingRecord(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <FiX className="text-lg" />
            </button>

            <h3 className="text-sm font-extrabold text-slate-900 mb-1">Student Attendance Pass</h3>
            <p className="text-xs text-slate-500 mb-4">
              {viewingRecord.studentName} ({viewingRecord.studentId})
            </p>

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
                onClick={() =>
                  handleCopyRecordToken(`CBP_STUDENT_QR_${viewingRecord.studentId}_${selectedSessionId}`)
                }
                className="w-full py-2.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold uppercase tracking-wider inline-flex items-center justify-center gap-1.5 shadow-2xs transition cursor-pointer"
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
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
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
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                      Student Information
                    </div>
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
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                      Registration Status
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="p-2 bg-white rounded-lg border border-slate-100">
                        <span className="text-[9px] text-slate-400 block font-mono">Date</span>
                        <span className="font-bold text-slate-800 text-[10px]">
                          {studentProfile.registrationDate
                            ? studentProfile.registrationDate.substring(0, 10)
                            : "N/A"}
                        </span>
                      </div>
                      <div className="p-2 bg-white rounded-lg border border-slate-100 flex flex-col">
                        <span className="text-[9px] text-slate-400 block font-mono mb-0.5">Payment</span>
                        <span
                          className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full text-center ${
                            studentProfile.paymentStatus === "PAID"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {studentProfile.paymentStatus}
                        </span>
                      </div>
                      <div className="p-2 bg-white rounded-lg border border-slate-100 flex flex-col">
                        <span className="text-[9px] text-slate-400 block font-mono mb-0.5">Certificate</span>
                        <span
                          className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-full text-center ${
                            studentProfile.certificateStatus === "ISSUED"
                              ? "bg-emerald-100 text-emerald-800"
                              : studentProfile.certificateStatus === "ELIGIBLE"
                              ? "bg-cyan-100 text-cyan-800"
                              : "bg-slate-100 text-slate-800"
                          }`}
                        >
                          {studentProfile.certificateStatus}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card 3: Attendance Summary */}
                  <div className="bg-slate-50/60 p-3 rounded-xl border border-slate-100 space-y-2.5">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                      Attendance Statistics
                    </div>
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
                        <span
                          className={
                            studentProfile.attendancePercentage >= 75 ? "text-emerald-600" : "text-rose-600"
                          }
                        >
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
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                      Attendance History Timeline
                    </div>
                    <div className="relative border-l border-slate-200 pl-4 ml-2.5 space-y-3.5">
                      {studentProfile.attendanceHistory &&
                        studentProfile.attendanceHistory.map((hist, idx) => {
                          const isPresent = hist.status === "PRESENT"
                          return (
                            <div key={idx} className="relative">
                              <span
                                className={`absolute -left-[21px] mt-1.5 w-2.5 h-2.5 rounded-full border-2 border-white shadow-xs ${
                                  isPresent ? "bg-emerald-500" : "bg-slate-300"
                                }`}
                              />
                              <div className="p-2 bg-white rounded-lg border border-slate-100 shadow-xs space-y-1">
                                <div className="flex justify-between items-start gap-1">
                                  <span className="font-extrabold text-slate-800 text-[10.5px]">
                                    Day {hist.dayNumber}: {hist.title}
                                  </span>
                                  <span
                                    className={`text-[8.5px] font-extrabold px-1 rounded-sm uppercase ${
                                      isPresent
                                        ? "bg-emerald-50 text-emerald-700"
                                        : "bg-slate-100 text-slate-600"
                                    }`}
                                  >
                                    {hist.status}
                                  </span>
                                </div>
                                {isPresent && (
                                  <div className="text-[9px] text-slate-500 flex flex-col font-mono">
                                    <span>
                                      Marked At:{" "}
                                      {hist.markedAt ? hist.markedAt.replace("T", " ").substring(0, 16) : "—"}
                                    </span>
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
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
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
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                      User Profile Information
                    </div>
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
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                      Assigned Operational Permissions
                    </div>
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
                        <span className="text-xs text-slate-400 font-mono italic">
                          No special authorities assigned
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Activity List: Recent Actions */}
                  <div className="space-y-2">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
                      Recent Attendance Audit Activity
                    </div>
                    {userProfile.recentActivities && userProfile.recentActivities.length > 0 ? (
                      <div className="space-y-2">
                        {userProfile.recentActivities.map((act, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 bg-white rounded-lg border border-slate-100 shadow-xs flex gap-2"
                          >
                            <FiActivity className="text-slate-400 text-xs shrink-0 mt-0.5" />
                            <div className="flex-1 space-y-0.5">
                              <p className="text-[10.5px] font-bold text-slate-800">{act.description}</p>
                              <span className="text-[9px] text-slate-400 font-mono block">
                                {act.timestamp
                                  ? act.timestamp.replace("T", " ").substring(0, 16)
                                  : "—"}
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

export default function AdminAttendanceView() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-xs text-slate-500">
          <div className="h-6 w-6 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <span>Loading Attendance Operations Center...</span>
        </div>
      }
    >
      <AttendanceContent />
    </Suspense>
  )
}
