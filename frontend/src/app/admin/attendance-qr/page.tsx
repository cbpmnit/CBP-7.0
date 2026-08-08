"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { attendanceService } from "@/services/attendanceService"
import { AttendanceSessionDto, SessionQrCodeResponse } from "@/types/attendance"
import PageTransition from "@/components/animations/PageTransition"
import { FiCode, FiArrowLeft, FiSearch, FiPlus, FiAlertCircle, FiCalendar } from "react-icons/fi"

export default function AdminAttendanceQrPage() {
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
      <main className="min-h-screen bg-slate-50 text-slate-900 py-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-center justify-between mb-8">
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 px-4 py-2 text-xs font-semibold uppercase tracking-wider transition shadow-sm"
            >
              <FiArrowLeft /> Admin Dashboard
            </Link>
            <span className="inline-flex items-center gap-2 rounded-full bg-cyan-50 border border-cyan-200 px-4 py-1 text-xs font-bold text-cyan-800 uppercase tracking-wider">
              Admin Session QR Control
            </span>
          </div>

          <div className="text-center mb-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-50 border border-cyan-200 text-cyan-700 shadow-sm mb-6">
              <FiCode className="text-3xl" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Session <span className="gradient-text-cyan">QR Manager</span>
            </h1>
            <p className="mt-2 text-sm text-slate-600 max-w-md mx-auto">
              Generate and manage session QR codes for CBP 7.0 workshop event days.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm mb-8">
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

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={loading || !selectedSessionId}
                  className="flex-1 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white py-3.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition disabled:opacity-50"
                >
                  <FiPlus className="text-base" />
                  <span>{loading ? "Processing..." : "Generate Session QR"}</span>
                </button>

                <button
                  type="button"
                  onClick={handleFetchExisting}
                  disabled={loading || !selectedSessionId}
                  className="rounded-xl bg-slate-100 border border-slate-200 hover:bg-slate-200 px-6 py-3.5 text-xs font-bold uppercase tracking-wider text-slate-700 transition flex items-center gap-2 disabled:opacity-50"
                >
                  <FiSearch />
                  <span>View Active QR</span>
                </button>
              </div>
            </form>
          </div>

          {message && (
            <div className="mb-6 p-4 rounded-2xl border bg-cyan-50 border-cyan-200 text-cyan-800 text-xs font-semibold text-center">
              {message}
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 rounded-2xl border bg-rose-50 border-rose-200 text-rose-800 text-xs font-semibold text-center flex items-center justify-center gap-2">
              <FiAlertCircle /> {error}
            </div>
          )}

          {/* QR Result Card */}
          {qrCode && (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 mb-1">Session Attendance QR</h3>
              <p className="text-xs font-mono text-cyan-800 font-bold mb-6">Session ID: {qrCode.sessionId}</p>

              <div className="p-4 bg-slate-50 rounded-2xl inline-block mb-6 border border-slate-200 shadow-sm">
                <img
                  src={qrCode.qrImageBase64}
                  alt="Session Attendance QR"
                  className="w-56 h-56 mx-auto"
                />
              </div>

              <div className="max-w-md mx-auto text-left bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs font-mono">
                <div className="text-slate-500">QR ID: <span className="text-slate-900 font-bold">{qrCode.id}</span></div>
                <div className="text-slate-500">Token: <span className="text-cyan-800 font-bold break-all">{qrCode.token}</span></div>
                <div className="text-slate-500">Expires At: <span className="text-slate-900 font-bold">{qrCode.expiresAt ? new Date(qrCode.expiresAt).toLocaleString() : "Derived from Session End Time"}</span></div>
              </div>
            </div>
          )}
        </div>
      </main>
    </PageTransition>
  )
}
