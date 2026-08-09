"use client"

import React from "react"
import Link from "next/link"
import PageTransition from "@/components/animations/PageTransition"
import PermissionGuard from "@/components/auth/PermissionGuard"
import { useSessions } from "../hooks/useSessions"
import { PageHeader } from "@/components/ui/PageHeader"
import { StatusBadge } from "@/components/ui/StatusBadge"
import {
  FiClock,
  FiMapPin,
  FiCamera,
  FiRefreshCw,
  FiCheckCircle,
  FiAlertCircle,
  FiUsers,
  FiZap,
} from "react-icons/fi"

export default function SessionManagement() {
  const {
    sessions,
    selectedSessionId,
    setSelectedSessionId,
    selectedSession,
    qrStatus,
    loadingSessions,
    loadingStatus,
    generating,
    message,
    error,
    handleGenerateStudentQrs,
    handleRegenerateStudentQrs,
  } = useSessions()

  return (
    <PageTransition>
      <PermissionGuard requiredPermission="SESSION_VIEW">
        <div className="space-y-4">
          {/* Header */}
          <PageHeader
            title="Session Management"
            count={sessions.length}
            countLabel="sessions"
            subtitle="Workshop day schedules and student QR gate pass generation"
            actions={
              <Link
                href="/admin/attendance"
                className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition shadow-2xs cursor-pointer"
              >
                <FiCamera className="text-xs text-slate-500" /> Live Gate Logs
              </Link>
            }
          />

          {/* Sessions List Cards */}
          {loadingSessions ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-slate-100 rounded-xl border border-slate-200" />
              ))}
            </div>
          ) : sessions.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {sessions.map((s) => (
                <div
                  key={s.id}
                  onClick={() => setSelectedSessionId(s.id)}
                  className={`bg-white border rounded-xl p-3.5 shadow-2xs transition cursor-pointer flex flex-col justify-between ${
                    selectedSessionId === s.id
                      ? "border-cyan-600 ring-1 ring-cyan-500/30 bg-cyan-50/20"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold font-mono text-slate-900">
                        Day {s.dayNumber}
                      </span>
                      <StatusBadge status={s.status} dot={false} className="text-[9px] px-1.5 py-0" />
                    </div>
                    <h2 className="text-xs font-bold text-slate-900 truncate">
                      {s.title || (s as any).sessionName}
                    </h2>
                    <div className="mt-1.5 space-y-0.5 text-[11px] text-slate-500 font-mono">
                      <div className="flex items-center gap-1">
                        <FiClock className="text-slate-400 shrink-0 text-[10px]" />
                        <span>{s.startTime || "09:00 AM"} &ndash; {s.endTime || "05:00 PM"}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FiMapPin className="text-slate-400 shrink-0 text-[10px]" />
                        <span className="truncate">{s.venue || "MNIT Auditorium"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center bg-white border border-slate-200 rounded-xl text-slate-500 text-xs font-semibold">
              No workshop sessions configured.
            </div>
          )}

          {/* Selected Session QR Pass Operations */}
          {selectedSession && (
            <div className="bg-white border border-slate-200 rounded-xl p-4 sm:p-5 shadow-2xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2.5 border-b border-slate-100 gap-2">
                <div>
                  <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                    Student Gate QR Passes &mdash; {selectedSession.title || (selectedSession as any).sessionName}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Generate and refresh HMAC QR passes for registered students
                  </p>
                </div>

                {qrStatus && (
                  <span className="text-xs font-bold font-mono px-2.5 py-0.5 bg-slate-100 rounded-md border border-slate-200 text-slate-700 self-start sm:self-auto">
                    {qrStatus.generatedQr} / {qrStatus.totalStudents} Generated
                  </span>
                )}
              </div>

              {/* Feedback Alerts */}
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

              {/* Status Summary & Action Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-3 text-xs text-slate-600">
                  <FiUsers className="text-cyan-700 text-sm" />
                  <span>Eligible Students: <strong className="text-slate-900 font-mono">{qrStatus?.totalStudents ?? 0}</strong></span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleGenerateStudentQrs}
                    disabled={generating || loadingStatus}
                    className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold uppercase tracking-wider transition shadow-2xs disabled:opacity-50 inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    {generating ? <FiRefreshCw className="animate-spin text-xs" /> : <FiZap className="text-xs" />}
                    <span>Generate Passes</span>
                  </button>

                  <button
                    onClick={handleRegenerateStudentQrs}
                    disabled={generating || loadingStatus}
                    className="px-3.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider transition border border-slate-200 disabled:opacity-50 inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <FiRefreshCw className={generating ? "animate-spin text-xs" : "text-xs"} />
                    <span>Regenerate All</span>
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
