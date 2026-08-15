"use client"

import { useState, useEffect, useCallback, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useAppSelector } from "@/store/hooks"
import { attendanceApi } from "../services/attendanceApi"

import { PageHeader } from "@/components/ui/PageHeader"
import { DataTable } from "@/components/ui/DataTable"
import { FilterBar } from "@/components/ui/FilterBar"
import { StatusBadge } from "@/components/ui/StatusBadge"
import { ExportCsvButton } from "@/components/ui/ExportCsvButton"
import {
  AttendanceSessionDto,
  SessionSummaryResponse,
  StudentSessionRecordDto,
  PageResponse,
  StudentAttendanceProfile,
  UserAttendanceProfile,
} from "@/types/attendance"
import {
  FiRefreshCw,
  FiCheck,
  FiCopy,
  FiX,
  FiEye,
  FiAlertCircle,
  FiCheckCircle,
  FiUser,
  FiSliders,
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

  // Session Summary State
  const [summary, setSummary] = useState<SessionSummaryResponse | null>(null)
  const [summaryLoading, setSummaryLoading] = useState(false)

  // Attendance Records Log State (Monitoring)
  const [recordsPage, setRecordsPage] = useState<PageResponse<StudentSessionRecordDto> | null>(null)
  const [recordsLoading, setRecordsLoading] = useState(false)
  const [recordSearch, setRecordSearch] = useState("")
  const [recordStatusFilter, setRecordStatusFilter] = useState("ALL")
  const [recordPage, setRecordPage] = useState(0)

  // Feedback Messages
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // View Details Modal & Profile Drawers State
  const [viewingRecord, setViewingRecord] = useState<StudentSessionRecordDto | null>(null)
  const [copiedToken, setCopiedToken] = useState(false)

  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null)
  const [studentProfile, setStudentProfile] = useState<StudentAttendanceProfile | null>(null)
  const [studentProfileLoading, setStudentProfileLoading] = useState(false)

  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [userProfile, setUserProfile] = useState<UserAttendanceProfile | null>(null)
  const [userProfileLoading, setUserProfileLoading] = useState(false)

  const fetchSessions = useCallback(async () => {
    setLoadingSessions(true)
    try {
      const data = await attendanceApi.getAllSessions()
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

  // Synchronize URL Session ID
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
    setRecordPage(0)
    router.replace(`/admin/attendance?sessionId=${sessionId}`, { scroll: false })
  }

  // Load Session Summary Metrics
  const loadSessionDetails = useCallback(async (sessionId: string) => {
    setSummaryLoading(true)
    try {
      const sumRes = await attendanceApi.getSessionSummary(sessionId)
      setSummary(sumRes)
    } catch (err) {
      setSummary(null)
    } finally {
      setSummaryLoading(false)
    }
  }, [])

  // Load Attendance Records Log Table (Monitoring)
  const loadAttendanceRecords = useCallback(
    async (sessionId: string, searchTerm: string, status: string, pageNum: number) => {
      setRecordsLoading(true)
      try {
        const data = await attendanceApi.getSessionRecords(
          sessionId,
          searchTerm,
          status,
          pageNum,
          20
        )
        setRecordsPage(data)
      } catch (err) {
        console.error("Failed to load attendance records log", err)
      } finally {
        setRecordsLoading(false)
      }
    },
    []
  )

  useEffect(() => {
    if (selectedSessionId) {
      loadSessionDetails(selectedSessionId)
      loadAttendanceRecords(selectedSessionId, recordSearch, recordStatusFilter, recordPage)
    }
  }, [selectedSessionId, recordSearch, recordStatusFilter, recordPage, loadSessionDetails, loadAttendanceRecords])

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

  const handleActivateSession = async (sessionId: string) => {
    try {
      await attendanceApi.activateSession(sessionId)
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
      await attendanceApi.closeSession(sessionId)
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
      const data = await attendanceApi.getStudentAttendanceProfile(studentId)
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
      const data = await attendanceApi.getUserAttendanceProfile(userId)
      setUserProfile(data)
    } catch (err) {
      console.error("Failed to load user profile:", err)
    } finally {
      setUserProfileLoading(false)
    }
  }

  const selectedSession = sessions.find((s) => s.id === selectedSessionId)
  const attendanceRecords = recordsPage?.content || []

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <PageHeader
        title="Attendance Monitoring Dashboard"
        count={sessions.length}
        countLabel="sessions"
        subtitle="Track participant check-in metrics, session counts, and live gate records"
        actions={
          <div className="flex items-center gap-2">
            <ExportCsvButton
              endpoint="/api/v1/admin/attendance/export"
              filenamePrefix="cbp-attendance"
              params={{
                search: recordSearch,
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
                  loadAttendanceRecords(selectedSessionId, recordSearch, recordStatusFilter, recordPage)
                }
              }}
              className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition border border-slate-200 cursor-pointer"
              title="Refresh attendance records"
            >
              <FiRefreshCw className={loadingSessions || summaryLoading || recordsLoading ? "animate-spin text-xs" : "text-xs"} />
            </button>
          </div>
        }
      />

      {/* Action Notification Banners */}
      {actionMessage && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <FiCheckCircle className="text-emerald-600 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <FiAlertCircle className="text-rose-600 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Section 1: Session Selector Cards */}
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

      {/* Section 2: Metrics Summary Row */}
      {selectedSession && (
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
      )}

      {/* Section 3: FilterBar for Attendance Records */}
      <FilterBar
        search={recordSearch}
        onSearchChange={(val) => {
          setRecordSearch(val)
          setRecordPage(0)
        }}
        searchPlaceholder="Search attendance record by student ID, name..."
        filters={[
          {
            id: "recordStatusFilter",
            value: recordStatusFilter,
            onChange: (val) => {
              setRecordStatusFilter(val)
              setRecordPage(0)
            },
            options: [
              { label: "All Statuses", value: "ALL" },
              { label: "Present", value: "PRESENT" },
              { label: "Absent", value: "ABSENT" },
            ],
          },
        ]}
      />

      {/* Section 4: Attendance Records Table (Monitoring Only) */}
      <DataTable
        title="Attendance Records Log"
        totalCount={recordsPage?.totalElements}
        loading={recordsLoading}
        data={attendanceRecords}
        currentPage={recordPage}
        totalPages={recordsPage?.totalPages ?? 1}
        pageSize={20}
        onPageChange={(p) => setRecordPage(p)}
        emptyMessage="No attendance scan entries recorded for this session yet"
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
            {attendanceRecords.map((rec) => {
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
                  <td className="px-4 py-2.5 text-slate-500 font-mono text-[11px]">{rec.studentEmail}</td>
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
                      title="View Details"
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold inline-flex items-center gap-1 border border-slate-200 cursor-pointer"
                    >
                      <FiEye className="text-xs text-slate-600" />
                      <span>View Details</span>
                    </button>
                    <button
                      onClick={() => handleOpenStudentDrawer(rec.studentId)}
                      title="View Student Profile"
                      className="p-1.5 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-800 text-xs font-semibold inline-flex items-center gap-1 border border-cyan-100 cursor-pointer"
                    >
                      <FiUser className="text-xs text-cyan-600" />
                      <span>Profile</span>
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </DataTable>

      {/* MODAL: View Entry Details */}
      {viewingRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-slate-200 shadow-xl relative animate-in zoom-in-95 duration-150">
            <button
              onClick={() => setViewingRecord(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <FiX className="text-lg" />
            </button>

            <h3 className="text-sm font-extrabold text-slate-900 mb-1">Attendance Entry Details</h3>
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

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleCopyRecordToken(`CBP_STUDENT_QR_${viewingRecord.studentId}_${selectedSessionId}`)}
                  className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-bold inline-flex items-center gap-1.5 transition text-xs cursor-pointer"
                >
                  {copiedToken ? <FiCheck /> : <FiCopy />}
                  <span>{copiedToken ? "Copied!" : "Copy Token"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function AdminAttendanceView() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-xs text-slate-400">Loading attendance monitoring...</div>}>
      <AttendanceContent />
    </Suspense>
  )
}
