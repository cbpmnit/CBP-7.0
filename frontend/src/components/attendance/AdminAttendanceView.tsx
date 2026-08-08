"use client"

import { useState } from "react"
import {
  FiCalendar,
  FiClock,
  FiMail,
  FiCopy,
  FiDownload,
  FiCheck,
  FiUserPlus,
  FiCheckCircle,
  FiRefreshCw,
} from "react-icons/fi"

const WORKSHOP_SESSIONS = [
  {
    day: 1,
    title: "Day 1: Orientation & Communication Skills",
    time: "09:30 AM - 04:30 PM",
    venue: "VLTC Auditorium 1, MNIT Jaipur",
    status: "ACTIVE",
  },
  {
    day: 2,
    title: "Day 2: Leadership & Team Dynamics",
    time: "09:30 AM - 04:30 PM",
    venue: "VLTC Auditorium 1, MNIT Jaipur",
    status: "UPCOMING",
  },
  {
    day: 3,
    title: "Day 3: Technical Problem Solving & Ethics",
    time: "09:30 AM - 04:30 PM",
    venue: "VLTC Hall L002, MNIT Jaipur",
    status: "UPCOMING",
  },
  {
    day: 4,
    title: "Day 4: Resume Building & Mock Interviews",
    time: "09:30 AM - 04:30 PM",
    venue: "VLTC Hall L002, MNIT Jaipur",
    status: "UPCOMING",
  },
  {
    day: 5,
    title: "Day 5: Capstone Project & Valedictory",
    time: "09:30 AM - 04:30 PM",
    venue: "Central Auditorium, MNIT Jaipur",
    status: "UPCOMING",
  },
]

export default function AdminAttendanceView() {
  const [selectedSessionDay, setSelectedSessionDay] = useState<number>(1)
  const [generatedQr, setGeneratedQr] = useState<string | null>(null)
  const [genLoading, setGenLoading] = useState(false)
  const [emailStatus, setEmailStatus] = useState<string | null>(null)
  const [copiedLink, setCopiedLink] = useState(false)

  const [selectedVolunteer, setSelectedVolunteer] = useState("VOL-101 (Team Alpha)")
  const [assignMessage, setAssignMessage] = useState<string | null>(null)

  const activeSession = WORKSHOP_SESSIONS.find((s) => s.day === selectedSessionDay) || WORKSHOP_SESSIONS[0]

  const handleGenerateQr = () => {
    setGenLoading(true)
    setTimeout(() => {
      // Mock QR code data URL generation for admin session management
      const mockPayload = `CBP7_SESSION_DAY${selectedSessionDay}_VERIFIED_${Date.now()}`
      setGeneratedQr(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(mockPayload)}`)
      setGenLoading(false)
    }, 600)
  }

  const handleSendEmail = () => {
    setEmailStatus("Sending session QR notifications to registered students...")
    setTimeout(() => {
      setEmailStatus("Batch email dispatch completed! 412 registered students notified.")
    }, 1200)
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://cbp.mnit.ac.in/attendance/session-${selectedSessionDay}`)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  const handleAssignVolunteer = () => {
    setAssignMessage(`Scanner access assigned successfully to ${selectedVolunteer}.`)
    setTimeout(() => setAssignMessage(null), 3000)
  }

  return (
    <div className="space-y-6">
      {/* 1. Session Selection */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
          <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <span className="text-cyan-700"><FiCalendar /></span>
            <span>1. Session Selection &amp; Program Schedule</span>
          </h3>
          <span className="text-xs font-bold text-cyan-800 bg-cyan-50 px-3 py-1 rounded-full border border-cyan-200 uppercase tracking-wider">
            Admin View
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 mb-4">
          {WORKSHOP_SESSIONS.map((session) => {
            const isSelected = selectedSessionDay === session.day
            return (
              <button
                key={session.day}
                onClick={() => {
                  setSelectedSessionDay(session.day)
                  setGeneratedQr(null)
                }}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? "bg-cyan-50 border-cyan-600 ring-2 ring-cyan-600/20 shadow-sm"
                    : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-900">Day {session.day}</span>
                  <span
                    className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                      session.status === "ACTIVE"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {session.status}
                  </span>
                </div>
                <p className="text-[11px] font-semibold text-slate-700 truncate">{session.title.split(":")[1] || session.title}</p>
              </button>
            )
          })}
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
            <h4 className="font-bold text-slate-900">{activeSession.title}</h4>
            <span className="font-mono text-cyan-800 font-semibold">{activeSession.time}</span>
          </div>
          <p className="text-slate-600">Venue: <span className="font-bold text-slate-800">{activeSession.venue}</span></p>
        </div>
      </div>

      {/* 2. Generate Attendance QR */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
          <h3 className="text-sm font-extrabold text-slate-900">2. Generate Session Attendance QR</h3>
          <button
            onClick={handleGenerateQr}
            disabled={genLoading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider shadow-sm transition disabled:opacity-50"
          >
            <FiRefreshCw className={genLoading ? "animate-spin" : ""} />
            <span>{genLoading ? "Generating..." : `Generate QR for Day ${selectedSessionDay}`}</span>
          </button>
        </div>

        {generatedQr ? (
          <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="p-2 bg-white rounded-xl border border-slate-200 shrink-0">
              <img src={generatedQr} alt="Session QR" className="w-36 h-36" />
            </div>
            <div className="space-y-2 flex-1 text-center sm:text-left text-xs">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <FiCheckCircle /> Session QR Active &amp; Verified
              </span>
              <h4 className="text-sm font-bold text-slate-900">{activeSession.title}</h4>
              <p className="text-slate-600">Validity: Valid for Day {selectedSessionDay} workshop attendance gate scanning.</p>
              <div className="pt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
                <button
                  onClick={handleSendEmail}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white text-xs font-bold uppercase tracking-wider shadow-sm transition"
                >
                  <FiMail /> Send Email Notification
                </button>
                <button
                  onClick={handleCopyLink}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 transition"
                >
                  {copiedLink ? <FiCheck className="text-emerald-600" /> : <FiCopy />}
                  <span>{copiedLink ? "Link Copied" : "Copy Session Link"}</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-500">
            Click &quot;Generate QR for Day {selectedSessionDay}&quot; to publish session QR code for volunteer scanning.
          </div>
        )}

        {emailStatus && (
          <div className="mt-3 p-3 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-900 text-xs font-semibold">
            {emailStatus}
          </div>
        )}
      </div>

      {/* 3. Volunteer Assignment Preparation */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-extrabold text-slate-900 mb-2 flex items-center gap-2">
          <span className="text-purple-700"><FiUserPlus /></span>
          <span>3. Assign Attendance Scanner Access</span>
        </h3>
        <p className="text-xs text-slate-600 mb-4">
          Assign scanner permissions to authorized volunteer staff members for gate validation.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <select
            value={selectedVolunteer}
            onChange={(e) => setSelectedVolunteer(e.target.value)}
            className="w-full sm:w-72 rounded-xl bg-slate-50 border border-slate-200 px-3 py-2 text-xs text-slate-900 focus:border-cyan-600 focus:outline-none font-medium"
          >
            <option value="VOL-101 (Team Alpha)">VOL-101 (Team Alpha Gate Control)</option>
            <option value="VOL-102 (Team Beta)">VOL-102 (Team Beta Hall Control)</option>
            <option value="VOL-103 (Team Gamma)">VOL-103 (Team Gamma Auditorium Control)</option>
          </select>

          <button
            onClick={handleAssignVolunteer}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider shadow-sm transition"
          >
            <FiUserPlus /> Assign Scanner Access
          </button>
        </div>

        {assignMessage && (
          <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
            <FiCheckCircle /> {assignMessage}
          </div>
        )}
      </div>
    </div>
  )
}
