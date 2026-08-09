"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { attendanceService } from "@/services/attendanceService"
import { AttendanceSessionDto, SessionQrCodeResponse } from "@/types/attendance"
import SidebarNavigation from "@/components/dashboard/SidebarNavigation"
import PageTransition from "@/components/animations/PageTransition"
import { FiCode, FiArrowLeft, FiSearch, FiPlus, FiAlertCircle, FiCalendar, FiClock, FiMapPin, FiCamera } from "react-icons/fi"

export default function AdminSessionsPage() {
  const [sessions, setSessions] = useState<AttendanceSessionDto[]>([])
  const [selectedSessionId, setSelectedSessionId] = useState("")
  const [loading, setLoading] = useState(false)
  const [qrCode, setQrCode] = useState<SessionQrCodeResponse | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    attendanceService.getAllSessions()
      .then((data) => {
        setSessions(data || [])
        if (data && data.length > 0) {
          setSelectedSessionId(data[0].id)
        }
      })
      .catch((err) => {
        console.error("Failed to load sessions", err)
      })
  }, [])

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedSessionId) return
    setLoading(true)
    setMessage(null)
    setError(null)
    setQrCode(null)
    try {
      const data = await attendanceService.generateSessionQr(selectedSessionId)
      setQrCode(data)
      setMessage(`Session QR generated successfully for session ID ${selectedSessionId}`)
    } catch (err: any) {
      setError(err?.message || "Failed to generate session QR code.")
    } finally {
      setLoading(false)
    }
  }

  const handleFetchExisting = async () => {
    if (!selectedSessionId) return
    setLoading(true)
    setMessage(null)
    setError(null)
    setQrCode(null)
    try {
      const data = await attendanceService.getActiveSessionQr(selectedSessionId)
      setQrCode(data)
    } catch (err: any) {
      setError(err?.message || "No active QR code found for this session.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageTransition>
      <div className="flex-1 w-full text-slate-900 min-h-[calc(100vh-72px)] relative bg-slate-50">
        <SidebarNavigation />

        <main className="py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto space-y-6">
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
                Configure workshop sessions, timings, venues, and project dynamic attendance QR codes.
              </p>
            </div>

            <Link
              href="/admin/attendance"
              className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 px-4 py-2.5 text-xs font-bold uppercase tracking-wider transition shadow-sm"
            >
              <FiCamera /> Live Gate Logs
            </Link>
          </div>

          {/* Sessions List Quick Cards */}
          {sessions.length > 0 && (
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
          )}

          {/* QR Generator Console */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
              <div className="h-10 w-10 rounded-2xl bg-cyan-50 text-cyan-700 border border-cyan-200 flex items-center justify-center text-xl">
                <FiCode />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">Projector Dynamic QR Generator</h3>
                <p className="text-xs text-slate-500">Generate rotating verification QR code for auditorium projection display</p>
              </div>
            </div>

            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                  Select Attendance Session
                </label>
                {sessions.length > 0 ? (
                  <select
                    value={selectedSessionId}
                    onChange={(e) => setSelectedSessionId(e.target.value)}
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-cyan-600 focus:outline-none font-medium"
                  >
                    {sessions.map((s) => (
                      <option key={s.id} value={s.id}>
                        Day {s.dayNumber}: {s.title} ({s.status})
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    required
                    value={selectedSessionId}
                    onChange={(e) => setSelectedSessionId(e.target.value)}
                    placeholder="Enter Session UUID"
                    className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-cyan-600 focus:outline-none font-mono"
                  />
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading || !selectedSessionId}
                  className="flex-1 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white py-3 px-4 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-50 shadow-cyan-600/20"
                >
                  <FiPlus className="text-base" />
                  <span>{loading ? "Processing..." : "Generate Session QR"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleFetchExisting}
                  disabled={loading || !selectedSessionId}
                  className="rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-200 px-6 py-3 text-xs font-bold uppercase tracking-wider text-slate-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <FiSearch />
                  <span>View Active QR</span>
                </button>
              </div>
            </form>

            {message && (
              <div className="mt-4 p-4 rounded-2xl border bg-cyan-50 border-cyan-200 text-cyan-800 text-xs font-semibold text-center">
                {message}
              </div>
            )}

            {error && (
              <div className="mt-4 p-4 rounded-2xl border bg-rose-50 border-rose-200 text-rose-800 text-xs font-semibold text-center flex items-center justify-center gap-2">
                <FiAlertCircle /> {error}
              </div>
            )}

            {/* QR Result Card */}
            {qrCode && (
              <div className="mt-6 pt-6 border-t border-slate-100 text-center">
                <h4 className="text-base font-extrabold text-slate-900 mb-1">Session Attendance Dynamic QR</h4>
                <p className="text-xs font-mono text-cyan-800 font-bold mb-6">Session ID: {qrCode.sessionId}</p>

                <div className="p-4 bg-slate-50 rounded-3xl inline-block mb-6 border border-slate-200 shadow-sm">
                  <img
                    src={qrCode.qrImageBase64}
                    alt="Session Attendance QR"
                    className="w-56 h-56 mx-auto rounded-xl"
                  />
                </div>

                <div className="max-w-md mx-auto text-left bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs font-mono">
                  <div className="text-slate-500">QR ID: <span className="text-slate-900 font-bold">{qrCode.id}</span></div>
                  <div className="text-slate-500">Token: <span className="text-cyan-800 font-bold break-all">{qrCode.token}</span></div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </PageTransition>
  )
}
