"use client"

import React, { useState } from "react"
import Link from "next/link"
import PageTransition from "@/components/animations/PageTransition"
import PermissionGuard from "@/components/auth/PermissionGuard"
import { useSessions } from "../hooks/useSessions"
import { AttendanceSessionDto } from "../types"
import { PageHeader } from "@/components/ui/PageHeader"
import { StatusBadge } from "@/components/ui/StatusBadge"
import {
  FiCalendar,
  FiClock,
  FiMapPin,
  FiRefreshCw,
  FiCheckCircle,
  FiAlertCircle,
  FiPlus,
  FiEdit2,
  FiUsers,
  FiX,
  FiPlay,
  FiSquare,
  FiInfo,
  FiTrash2,
  FiAlertTriangle,
} from "react-icons/fi"

export default function SessionManagement() {
  const {
    sessions,
    loadingSessions,
    actionLoadingSessionId,
    actionType,
    modalLoading,
    message,
    error,
    showEditModal,
    editingSession,
    showCreateModal,
    setShowCreateModal,
    showDeleteModal,
    deletingSession,
    openEditModal,
    closeEditModal,
    openDeleteModal,
    closeDeleteModal,
    handleActivateSession,
    handleCloseSession,
    handleCreateSession,
    handleUpdateSession,
    handleDeleteSession,
    reload,
  } = useSessions()

  // Create Form State
  const [createDayNum, setCreateDayNum] = useState(1)
  const [createTitle, setCreateTitle] = useState("")
  const [createDesc, setCreateDesc] = useState("")
  const [createDate, setCreateDate] = useState("")
  const [createStart, setCreateStart] = useState("09:30")
  const [createEnd, setCreateEnd] = useState("16:30")
  const [createVenue, setCreateVenue] = useState("VLTC Auditorium, MNIT Jaipur")
  const [createError, setCreateError] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)

  // Edit Form State
  const [editTitle, setEditTitle] = useState("")
  const [editDesc, setEditDesc] = useState("")
  const [editDate, setEditDate] = useState("")
  const [editStart, setEditStart] = useState("")
  const [editEnd, setEditEnd] = useState("")
  const [editVenue, setEditVenue] = useState("")
  const [editStatus, setEditStatus] = useState<any>("UPCOMING")
  const [editError, setEditError] = useState<string | null>(null)
  const [updating, setUpdating] = useState(false)

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

  const handleOpenEdit = (session: AttendanceSessionDto) => {
    setEditTitle(session.title || "")
    setEditDesc(session.description || "")
    setEditDate(session.sessionDate || "")
    setEditStart(session.startTime ? session.startTime.substring(0, 5) : "09:30")
    setEditEnd(session.endTime ? session.endTime.substring(0, 5) : "16:30")
    setEditVenue(session.venue || "VLTC Auditorium, MNIT Jaipur")
    setEditStatus(session.status || "UPCOMING")
    setEditError(null)
    openEditModal(session)
  }

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!createTitle.trim() || !createDate) {
      setCreateError("Please enter a session title and date.")
      return
    }

    setCreating(true)
    setCreateError(null)

    try {
      await handleCreateSession({
        dayNumber: Number(createDayNum),
        title: createTitle.trim(),
        description: createDesc.trim() || undefined,
        sessionDate: createDate,
        startTime: createStart ? `${createStart}:00` : undefined,
        endTime: createEnd ? `${createEnd}:00` : undefined,
        venue: createVenue.trim() || undefined,
      })
      setCreateTitle("")
      setCreateDesc("")
    } catch (err: any) {
      setCreateError(err?.message || "Failed to create session.")
    } finally {
      setCreating(false)
    }
  }

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingSession || !editTitle.trim() || !editDate) {
      setEditError("Please enter session title and date.")
      return
    }

    setUpdating(true)
    setEditError(null)

    try {
      await handleUpdateSession(editingSession.id, {
        title: editTitle.trim(),
        description: editDesc.trim() || undefined,
        sessionDate: editDate,
        startTime: editStart ? `${editStart}:00` : undefined,
        endTime: editEnd ? `${editEnd}:00` : undefined,
        venue: editVenue.trim() || undefined,
        status: editStatus,
      })
    } catch (err: any) {
      setEditError(err?.message || "Failed to update session.")
    } finally {
      setUpdating(false)
    }
  }

  return (
    <PageTransition>
      <PermissionGuard requiredPermission="SESSION_VIEW">
        <div className="space-y-4">
          {/* Header */}
          <PageHeader
            title="Session Management"
            count={sessions.length}
            countLabel="sessions"
            subtitle="Workshop day schedules, venues, timings, and lifecycle management"
            actions={
              <div className="flex items-center gap-2">
                <Link
                  href="/admin/attendance"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider transition shadow-2xs cursor-pointer"
                >
                  <FiUsers className="text-xs text-cyan-600" />
                  <span>Live Attendance &rarr;</span>
                </Link>

                <button
                  onClick={() => {
                    setCreateDayNum(sessions.length + 1)
                    setCreateError(null)
                    setShowCreateModal(true)
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold uppercase tracking-wider transition shadow-2xs inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <FiPlus className="text-xs" />
                  <span>Create Session</span>
                </button>

                <button
                  onClick={reload}
                  disabled={loadingSessions || actionLoadingSessionId !== null}
                  className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition border border-slate-200 cursor-pointer disabled:opacity-50"
                  title="Refresh sessions"
                >
                  <FiRefreshCw className={loadingSessions ? "animate-spin text-xs" : "text-xs"} />
                </button>
              </div>
            }
          />

          {/* Feedback Messages */}
          {message && (
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2">
              <FiCheckCircle className="text-emerald-600 shrink-0" />
              <span>{message}</span>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-900 text-xs font-semibold flex items-center gap-2">
              <FiAlertCircle className="text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Sessions List Cards */}
          {loadingSessions ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-44 bg-slate-100 rounded-xl border border-slate-200" />
              ))}
            </div>
          ) : sessions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {sessions.map((s) => (
                <div
                  key={s.id}
                  className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs hover:shadow-xs transition flex flex-col justify-between"
                >
                  {/* Top Card Info */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold font-mono px-2 py-0.5 bg-slate-100 rounded-md border border-slate-200 text-slate-800">
                        Day {s.dayNumber}
                      </span>
                      <StatusBadge status={s.status} dot={true} className="text-[10px] px-2 py-0.5" />
                    </div>

                    <h3 className="text-sm font-extrabold text-slate-900 mt-1 line-clamp-1">
                      {s.title || (s as any).sessionName}
                    </h3>

                    {s.description && (
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                        {s.description}
                      </p>
                    )}

                    <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1.5 text-xs text-slate-600 font-mono">
                      <div className="flex items-center gap-2">
                        <FiCalendar className="text-slate-400 shrink-0 text-xs" />
                        <span className="text-slate-800 font-semibold">{s.sessionDate}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <FiClock className="text-slate-400 shrink-0 text-xs" />
                        <span>
                          {formatTime12h(s.startTime)} &ndash; {formatTime12h(s.endTime)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <FiMapPin className="text-slate-400 shrink-0 text-xs" />
                        <span className="truncate">{s.venue || "VLTC Auditorium, MNIT Jaipur"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Bottom Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(s)}
                        className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition inline-flex items-center gap-1 cursor-pointer"
                      >
                        <FiEdit2 className="text-[10px]" />
                        <span>Edit</span>
                      </button>

                      {s.status === "UPCOMING" && (
                        <button
                          onClick={() => handleActivateSession(s.id)}
                          disabled={actionLoadingSessionId !== null}
                          className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        >
                          {actionLoadingSessionId === s.id && actionType === "activate" ? (
                            <>
                              <FiRefreshCw className="animate-spin text-[10px]" />
                              <span>Activating...</span>
                            </>
                          ) : (
                            <>
                              <FiPlay className="text-[10px]" />
                              <span>Activate</span>
                            </>
                          )}
                        </button>
                      )}

                      {s.status === "ACTIVE" && (
                        <button
                          onClick={() => handleCloseSession(s.id)}
                          disabled={actionLoadingSessionId !== null}
                          className="px-2.5 py-1 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg border border-amber-200 transition inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        >
                          {actionLoadingSessionId === s.id && actionType === "close" ? (
                            <>
                              <FiRefreshCw className="animate-spin text-[10px]" />
                              <span>Closing...</span>
                            </>
                          ) : (
                            <>
                              <FiSquare className="text-[10px]" />
                              <span>Close</span>
                            </>
                          )}
                        </button>
                      )}

                      <button
                        onClick={() => openDeleteModal(s)}
                        disabled={actionLoadingSessionId !== null}
                        className="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        title="Delete Session and all connected records"
                      >
                        <FiTrash2 className="text-[10px]" />
                        <span>Delete</span>
                      </button>
                    </div>

                    <Link
                      href={`/admin/attendance?sessionId=${s.id}`}
                      className="px-3 py-1 text-xs font-bold text-cyan-700 bg-cyan-50 hover:bg-cyan-100 rounded-lg border border-cyan-200 transition inline-flex items-center gap-1 cursor-pointer"
                    >
                      <FiUsers className="text-[10px]" />
                      <span>Attendance</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-white border border-slate-200 rounded-xl space-y-3 shadow-2xs">
              <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-500">
                <FiInfo className="text-lg" />
              </div>
              <h3 className="text-xs font-bold text-slate-800">No Workshop Sessions Configured</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Schedule workshop days to start managing session details and timing.
              </p>
              <button
                onClick={() => {
                  setCreateDayNum(1)
                  setShowCreateModal(true)
                }}
                className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold uppercase tracking-wider transition shadow-2xs inline-flex items-center gap-1.5 cursor-pointer"
              >
                <FiPlus className="text-xs" />
                <span>Create Day 1 Session</span>
              </button>
            </div>
          )}

          {/* Modal: Create Session */}
          {showCreateModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-sm font-extrabold text-slate-900">Create Workshop Session</h3>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                  >
                    <FiX />
                  </button>
                </div>

                {createError && (
                  <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
                    {createError}
                  </div>
                )}

                <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Day Number</label>
                      <input
                        type="number"
                        min="1"
                        value={createDayNum}
                        onChange={(e) => setCreateDayNum(Number(e.target.value))}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-cyan-500 font-mono text-xs"
                        required
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block font-bold text-slate-700 mb-1">Session Date</label>
                      <input
                        type="date"
                        value={createDate}
                        onChange={(e) => setCreateDate(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-cyan-500 font-mono text-xs"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Orientation & Core Python Foundations"
                      value={createTitle}
                      onChange={(e) => setCreateTitle(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-cyan-500 text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Description / Speaker</label>
                    <textarea
                      placeholder="Topic overview, key speaker, or session agenda..."
                      rows={2}
                      value={createDesc}
                      onChange={(e) => setCreateDesc(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-cyan-500 text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Start Time</label>
                      <input
                        type="time"
                        value={createStart}
                        onChange={(e) => setCreateStart(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-cyan-500 font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">End Time</label>
                      <input
                        type="time"
                        value={createEnd}
                        onChange={(e) => setCreateEnd(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-cyan-500 font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Venue</label>
                    <input
                      type="text"
                      value={createVenue}
                      onChange={(e) => setCreateVenue(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-cyan-500 text-xs"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={creating}
                      className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-bold transition disabled:opacity-50 inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      {creating && <FiRefreshCw className="animate-spin text-xs" />}
                      <span>Create Session</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal: Edit Session */}
          {showEditModal && editingSession && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">
                      Edit Day {editingSession.dayNumber} Session
                    </h3>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">
                      Session ID: {editingSession.id.substring(0, 8)}...
                    </p>
                  </div>
                  <button
                    onClick={closeEditModal}
                    className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
                  >
                    <FiX />
                  </button>
                </div>

                {editError && (
                  <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
                    {editError}
                  </div>
                )}

                <form onSubmit={handleEditSubmit} className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Session Date</label>
                      <input
                        type="date"
                        value={editDate}
                        onChange={(e) => setEditDate(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-cyan-500 font-mono text-xs"
                        required
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Status</label>
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-cyan-500 text-xs font-bold"
                      >
                        <option value="UPCOMING">UPCOMING</option>
                        <option value="ACTIVE">ACTIVE</option>
                        <option value="CLOSED">CLOSED</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Title</label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-cyan-500 text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Description / Speaker</label>
                    <textarea
                      rows={2}
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-cyan-500 text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Start Time</label>
                      <input
                        type="time"
                        value={editStart}
                        onChange={(e) => setEditStart(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-cyan-500 font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">End Time</label>
                      <input
                        type="time"
                        value={editEnd}
                        onChange={(e) => setEditEnd(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-cyan-500 font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Venue</label>
                    <input
                      type="text"
                      value={editVenue}
                      onChange={(e) => setEditVenue(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-cyan-500 text-xs"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={closeEditModal}
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={updating}
                      className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white font-bold transition disabled:opacity-50 inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      {updating && <FiRefreshCw className="animate-spin text-xs" />}
                      <span>Save Changes</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Modal: Delete Confirmation */}
          {showDeleteModal && deletingSession && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
              <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 shadow-xl relative animate-in zoom-in-95 duration-150 space-y-4">
                <div className="flex items-start gap-3.5">
                  <div className="p-3 bg-rose-100 text-rose-600 rounded-xl shrink-0">
                    <FiAlertTriangle className="text-xl" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-base font-extrabold text-slate-900">
                      Delete Session?
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      This will permanently remove <strong className="text-slate-900 font-bold">Day {deletingSession.dayNumber}: {deletingSession.title}</strong> and all related data including attendance records, QR passes, volunteer assignments, and notifications. This action cannot be undone.
                    </p>
                  </div>
                </div>

                {deletingSession.status === "ACTIVE" && (
                  <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center gap-2">
                    <FiAlertCircle className="shrink-0 text-amber-600 text-sm" />
                    <span>Warning: This session is currently <strong>ACTIVE</strong>. Deleting it will immediately invalidate all live gate QR passes.</span>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={closeDeleteModal}
                    disabled={modalLoading}
                    className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteSession(deletingSession.id)}
                    disabled={modalLoading}
                    className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition shadow-2xs inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {modalLoading ? (
                      <>
                        <FiRefreshCw className="animate-spin text-xs" />
                        <span>Deleting...</span>
                      </>
                    ) : (
                      <>
                        <FiTrash2 className="text-xs" />
                        <span>Delete Session</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </PermissionGuard>
    </PageTransition>
  )
}
