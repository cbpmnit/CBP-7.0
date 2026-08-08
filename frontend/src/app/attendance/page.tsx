"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { attendanceService } from "@/services/attendanceService"
import { StudentAttendanceSummaryResponse, AttendanceQrResponse } from "@/types/attendance"
import PageTransition from "@/components/animations/PageTransition"
import AttendanceCard from "@/components/cards/AttendanceCard"
import AttendanceTable from "@/components/tables/AttendanceTable"
import StudentQrCard from "@/components/dashboard/StudentQrCard"
import {
  FiCalendar,
  FiArrowLeft,
  FiCopy,
  FiCheck,
  FiClock,
  FiCheckCircle,
  FiChevronDown,
  FiChevronUp,
} from "react-icons/fi"

const WORKSHOP_DAYS = [
  {
    day: 1,
    title: "Day 1: Orientation & Communication Skills",
    time: "09:30 AM - 04:30 PM",
    venue: "VLTC Auditorium 1, MNIT Jaipur",
    description: "Foundational soft skills, personal branding, and effective corporate communication techniques.",
  },
  {
    day: 2,
    title: "Day 2: Leadership & Team Dynamics",
    time: "09:30 AM - 04:30 PM",
    venue: "VLTC Auditorium 1, MNIT Jaipur",
    description: "Interactive team building activities, conflict resolution, and leadership strategies.",
  },
  {
    day: 3,
    title: "Day 3: Technical Problem Solving & Ethics",
    time: "09:30 AM - 04:30 PM",
    venue: "VLTC Hall L002, MNIT Jaipur",
    description: "Analytical thinking workshops, case studies, and engineering ethics.",
  },
  {
    day: 4,
    title: "Day 4: Resume Building & Mock Interviews",
    time: "09:30 AM - 04:30 PM",
    venue: "VLTC Hall L002, MNIT Jaipur",
    description: "Resume critique sessions, group discussions, and 1-on-1 mock interview rounds.",
  },
  {
    day: 5,
    title: "Day 5: Capstone Project & Valedictory",
    time: "09:30 AM - 04:30 PM",
    venue: "Central Auditorium, MNIT Jaipur",
    description: "Final group presentations, guest keynote address, and certificate award ceremony.",
  },
]

export default function AttendancePage() {
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<StudentAttendanceSummaryResponse | null>(null)
  const [qrCode, setQrCode] = useState<AttendanceQrResponse | null>(null)
  const [copied, setCopied] = useState(false)
  const [selectedDay, setSelectedDay] = useState<number>(1)

  useEffect(() => {
    fetchAttendanceData()
  }, [])

  const fetchAttendanceData = async () => {
    setLoading(true)
    try {
      const [sumData, qrData] = await Promise.allSettled([
        attendanceService.getMyAttendance(),
        attendanceService.getMyQr(),
      ])

      if (sumData.status === "fulfilled") setSummary(sumData.value)
      if (qrData.status === "fulfilled") setQrCode(qrData.value)
    } catch (e) {
      console.error("Error fetching attendance data", e)
    } finally {
      setLoading(false)
    }
  }

  const handleCopyToken = () => {
    if (!qrCode?.token) return
    navigator.clipboard.writeText(qrCode.token)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const records = summary?.records || []
  const activeDayDetails = WORKSHOP_DAYS.find((d) => d.day === selectedDay) || WORKSHOP_DAYS[0]

  return (
    <PageTransition>
      <main className="min-h-[calc(100vh-80px)] bg-cbp-grid text-slate-900 py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          {/* Header Bar */}
          <div className="flex items-center justify-between mb-6">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 px-4 py-2 text-xs font-bold uppercase tracking-wider shadow-sm transition"
            >
              <FiArrowLeft /> Dashboard
            </Link>
            <span className="inline-flex items-center gap-2 rounded-full bg-cyan-50 border border-cyan-200 px-4 py-1 text-xs font-bold text-cyan-800 uppercase tracking-wider">
              Student Attendance Portal
            </span>
          </div>

          {/* Today's Attendance QR Hero Area */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <StudentQrCard qrCode={qrCode} loading={loading} />
            <AttendanceCard summary={summary} loading={loading} />
          </div>

          {/* Copy Token Bar */}
          {qrCode && (
            <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-8 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-700 min-w-0">
                <span className="font-bold text-cyan-800 shrink-0">Session QR Token Payload:</span>
                <span className="truncate font-semibold text-slate-900 bg-slate-50 px-2 py-1 rounded border border-slate-200">{qrCode.token}</span>
              </div>
              <button
                onClick={handleCopyToken}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs font-bold hover:bg-cyan-100 transition shrink-0"
              >
                {copied ? <FiCheck className="text-emerald-600" /> : <FiCopy />}
                <span>{copied ? "Token Copied!" : "Copy Token Payload"}</span>
              </button>
            </div>
          )}

          {/* Interactive 5-Day Workshop Schedule Selector */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-8">
            <h3 className="text-sm font-extrabold text-slate-900 mb-4 flex items-center gap-2">
              <span className="text-cyan-700"><FiCalendar /></span>
              <span>5-Day Workshop Schedule &amp; Session Selector</span>
            </h3>

            {/* Day Selector Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mb-6">
              {WORKSHOP_DAYS.map((d, idx) => {
                const recordForDay = records[idx]
                const isAttended = recordForDay?.status === "PRESENT"
                const isSelected = selectedDay === d.day

                return (
                  <button
                    key={d.day}
                    onClick={() => setSelectedDay(d.day)}
                    className={`p-3 rounded-xl border text-left transition-all duration-200 ${
                      isSelected
                        ? "bg-cyan-50 border-cyan-600 ring-2 ring-cyan-600/20 shadow-sm"
                        : "bg-slate-50 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-extrabold text-slate-900">Day {d.day}</span>
                      {isAttended ? (
                        <FiCheckCircle className="text-emerald-600 text-xs" />
                      ) : (
                        <span className="h-2 w-2 rounded-full bg-slate-300" />
                      )}
                    </div>
                    <p className="text-[10px] font-semibold text-slate-600 truncate">{d.time}</p>
                  </button>
                )
              })}
            </div>

            {/* Selected Session Details Card */}
            {activeDayDetails && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                  <h4 className="text-base font-bold text-slate-900">{activeDayDetails.title}</h4>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-800 bg-cyan-100 px-3 py-1 rounded-full border border-cyan-200 shrink-0 self-start sm:self-auto">
                    <FiClock /> {activeDayDetails.time}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mb-3">{activeDayDetails.description}</p>
                <div className="text-[11px] font-mono text-slate-500">
                  Venue: <span className="font-bold text-slate-800">{activeDayDetails.venue}</span>
                </div>
              </div>
            )}
          </div>

          {/* Session Attendance History Table */}
          <div className="mb-8">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Attendance History Log</h3>
            <AttendanceTable records={records} loading={loading} />
          </div>
        </div>
      </main>
    </PageTransition>
  )
}
