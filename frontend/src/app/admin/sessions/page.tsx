"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { attendanceService } from "@/services/attendanceService"
import { AttendanceSessionDto, QrGenerationStatusResponse } from "@/types/attendance"
import SidebarNavigation from "@/components/dashboard/SidebarNavigation"
import PageTransition from "@/components/animations/PageTransition"
import {
  FiCalendar,
  FiClock,
  FiMapPin,
  FiCamera,
  FiRefreshCw,
  FiCheckCircle,
  FiAlertCircle,
  FiUsers,
  FiShield,
  FiZap,
} from "react-icons/fi"

export default function AdminSessionsPage() {
  const [sessions, setSessions] = useState<AttendanceSessionDto[]>([])
  const [selectedSessionId, setSelectedSessionId] = useState("")
  const [qrStatus, setQrStatus] = useState<QrGenerationStatusResponse | null>(null)
  const [loadingSessions, setLoadingSessions] = useState(true)
  const [loadingStatus, setLoadingStatus] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSessions()
  }, [])

  useEffect(() => {
    if (selectedSessionId) {
      fetchQrStatus(selectedSessionId)
    }
  }, [selectedSessionId])

  const fetchSessions = async () => {
    setLoadingSessions(true)
    try {
      const data = await attendanceService.getAllSessions()
      setSessions(data || [])
      if (data && data.length > 0 && !selectedSessionId) {
        setSelectedSessionId(data[0].id)
      }
    } catch (err) {
      console.error("Failed to load sessions", err)
    } finally {
      setLoadingSessions(false)
    }
  }

  const fetchQrStatus = async (sessionId: string) => {
    setLoadingStatus(true)
    try {
      const res = await attendanceService.getQrGenerationStatus(sessionId)
      setQrStatus(res)
    } catch (err) {
      console.warn("Failed to load QR generation status", err)
    } finally {
      setLoadingStatus(false)
    }
  }

  const handleGenerateStudentQrs = async () => {
    if (!selectedSessionId) return
    setGenerating(true)
    setMessage(null)
    setError(null)
    try {
      const res = await attendanceService.generateStudentQrsForSession(selectedSessionId)
      const count = res.generatedCount ?? res.generated ?? res.totalStudents ?? 0
      setMessage(`Successfully generated student QR passes for all ${count} registered students!`)
      await fetchQrStatus(selectedSessionId)
    } catch (err: any) {
      setError(err?.message || "Failed to generate student QR passes.")
    } finally {
      setGenerating(false)
    }
  }

  const handleRegenerateStudentQrs = async () => {
    if (!selectedSessionId) return
    if (!confirm("Are you sure you want to regenerate QR passes? This will invalidate all previous QR tokens for this session.")) {
      return
    }
    setGenerating(true)
    setMessage(null)
    setError(null)
    try {
      const res = await attendanceService.generateStudentQrsForSession(selectedSessionId)
      const count = res.generatedCount ?? res.generated ?? res.totalStudents ?? 0
      setMessage(`Successfully regenerated and issued fresh QR passes for all ${count} registered students. Previous tokens invalidated.`)
      await fetchQrStatus(selectedSessionId)
    } catch (err: any) {
      setError(err?.message || "Failed to regenerate student QR passes.")
    } finally {
      setGenerating(false)
    }
  }

  const selectedSession = sessions.find((s) => s.id === selectedSessionId)

  return (
    <PageTransition>
      <div className="flex-1 w-full text-slate-900 min-h-[calc(100vh-72px)] relative bg-slate-50">
        <SidebarNavigation />

        <main className="py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-6">
          {/* Header Banner */}
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-50 text-cyan-800 border border-cyan-200">
                  <FiCalendar /> Workshop Schedules
                </span>
                <span className="text-[10px] font-mono font-bold text-slate-400">MNIT Jaipur</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                Session <span className="gradient-text-cyan">Management</span>
              </h1>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Configure workshop schedules and manage individual student attendance QR passes.
              </p>
            </div>

            <Link
              href="/admin/attendance"
              className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition shadow-sm"
            >
              <FiCamera /> Live Gate Logs
            </Link>
          </div>

          {/* Sessions List Cards */}
          {loadingSessions ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-pulse">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-28 bg-slate-100 rounded-2xl border border-slate-200" />
              ))}
            </div>
          ) : sessions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {sessions.map((s) => (
                <div
                  key={s.id}
                  onClick={() => setSelectedSessionId(s.id)}
                  className={`bg-white border rounded-2xl p-5 shadow-sm transition cursor-pointer ${
                    selectedSessionId === s.id
                      ? "border-cyan-500 ring-2 ring-cyan-500/20"
                      : "border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-cyan-50 text-cyan-800 border border-cyan-200">
                      Day {s.dayNumber}
                    </span>
                    <span className={`text-[10px] font-bold uppercase ${s.status === "ACTIVE" ? "text-emerald-600 font-extrabold" : "text-slate-400"}`}>
                      {s.status}
                    </span>
                  </div>
                  <h3 className="text-xs font-extrabold text-slate-900 line-clamp-1">{s.title}</h3>
                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                    <span className="flex items-center gap-1"><FiClock className="text-cyan-600" /> {s.startTime || "09:30"} - {s.endTime || "16:30"}</span>
                    <span className="flex items-center gap-1"><FiMapPin className="text-cyan-600" /> {s.venue || "VLTC"}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {/* Student QR Pass Management Card */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-cyan-50 text-cyan-700 border border-cyan-200 flex items-center justify-center text-2xl shrink-0">
                  <FiShield />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Student QR Pass Management</h3>
                  <p className="text-xs text-slate-500">
                    Generate and manage individual student attendance QR passes for this session.
                  </p>
                </div>
              </div>

              {selectedSession && (
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Selected Session</span>
                  <span className="text-xs font-extrabold text-slate-800">
                    Day {selectedSession.dayNumber}: {selectedSession.title}
                  </span>
                </div>
              )}
            </div>

            {/* QR Generation Status Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Registered Students</span>
                    <h4 className="text-2xl font-extrabold text-slate-900 mt-1">
                      {loadingStatus ? "-" : qrStatus?.totalRegisteredStudents ?? qrStatus?.totalStudents ?? 0}
                    </h4>
                  </div>
                  <div className="h-9 w-9 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 flex items-center justify-center text-lg">
                    <FiUsers />
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">QR Generated</span>
                    <h4 className="text-2xl font-extrabold text-emerald-700 mt-1">
                      {loadingStatus ? "-" : qrStatus?.generatedQr ?? qrStatus?.qrGenerated ?? 0}
                    </h4>
                  </div>
                  <div className="h-9 w-9 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center text-lg">
                    <FiCheckCircle />
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Pending Generation</span>
                    <h4 className="text-2xl font-extrabold text-amber-700 mt-1">
                      {loadingStatus ? "-" : qrStatus?.pendingGeneration ?? qrStatus?.pendingQr ?? 0}
                    </h4>
                  </div>
                  <div className="h-9 w-9 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center text-lg">
                    <FiAlertCircle />
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={handleGenerateStudentQrs}
                disabled={generating || !selectedSessionId}
                className="flex-1 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white py-3.5 px-6 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-50 shadow-cyan-600/20"
              >
                {generating ? <FiRefreshCw className="animate-spin text-base" /> : <FiZap className="text-base" />}
                <span>{generating ? "Generating..." : "GENERATE STUDENT QR PASSES"}</span>
              </button>

              <button
                type="button"
                onClick={handleRegenerateStudentQrs}
                disabled={generating || !selectedSessionId}
                className="rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-200 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <FiRefreshCw className={generating ? "animate-spin" : ""} />
                <span>REGENERATE QR PASSES</span>
              </button>
            </div>

            {message && (
              <div className="p-4 rounded-2xl border bg-emerald-50 border-emerald-200 text-emerald-950 text-xs font-bold flex items-center gap-2">
                <FiCheckCircle className="text-emerald-600 text-base shrink-0" />
                <span>{message}</span>
              </div>
            )}

            {error && (
              <div className="p-4 rounded-2xl border bg-rose-50 border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                <FiAlertCircle className="text-rose-600 text-base shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Architecture Operational Notice */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5 text-xs">
              <h5 className="font-bold text-slate-900">Personal Student QR Architecture</h5>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                When passes are generated, each registered student receives a cryptographically unique token accessible on their Student Dashboard under <strong>Attendance &gt; Today&apos;s Session &gt; Personal QR Pass</strong>. Volunteers use the Attendance Scanner to authenticate passes at the auditorium gate.
              </p>
            </div>
          </div>
        </main>
      </div>
    </PageTransition>
  )
}
