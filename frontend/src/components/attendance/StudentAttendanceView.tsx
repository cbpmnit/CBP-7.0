"use client"

import { useState } from "react"
import { StudentAttendanceSummaryResponse, AttendanceQrResponse } from "@/types/attendance"
import AttendanceCard from "@/components/cards/AttendanceCard"
import AttendanceTable from "@/components/tables/AttendanceTable"
import StudentQrCard from "@/components/dashboard/StudentQrCard"
import { FiCalendar, FiClock, FiMapPin, FiCopy, FiCheck, FiCheckCircle } from "react-icons/fi"

const WORKSHOP_DAYS = [
  {
    day: 1,
    title: "Day 1: Orientation & Communication Skills",
    time: "09:30 AM - 04:30 PM",
    venue: "VLTC Auditorium 1, MNIT Jaipur",
    description: "Foundational soft skills, personal branding, and corporate communication.",
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

interface StudentAttendanceViewProps {
  summary: StudentAttendanceSummaryResponse | null
  qrCode: AttendanceQrResponse | null
  loading: boolean
}

export default function StudentAttendanceView({
  summary,
  qrCode,
  loading,
}: StudentAttendanceViewProps) {
  const [selectedDay, setSelectedDay] = useState<number>(1)
  const [copied, setCopied] = useState(false)

  const handleCopyToken = () => {
    if (!qrCode?.token) return
    navigator.clipboard.writeText(qrCode.token)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const records = summary?.records || []
  const activeDayDetails = WORKSHOP_DAYS.find((d) => d.day === selectedDay) || WORKSHOP_DAYS[0]

  return (
    <div className="space-y-6">
      {/* Current Active Session & QR Code Display */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-100">
          <div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-800 bg-cyan-50 px-2.5 py-0.5 rounded-full border border-cyan-200 uppercase tracking-wider mb-1">
              Active Workshop Session
            </span>
            <h3 className="text-base font-extrabold text-slate-900">{activeDayDetails.title}</h3>
          </div>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0 self-start sm:self-auto">
            Ready for Gate Scanning
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StudentQrCard qrCode={qrCode} loading={loading} />
          <AttendanceCard summary={summary} loading={loading} />
        </div>

        {qrCode && (
          <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-700 min-w-0">
              <span className="font-bold text-cyan-800 shrink-0">Encrypted Token Payload:</span>
              <span className="truncate font-semibold text-slate-900 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200">
                {qrCode.token}
              </span>
            </div>
            <button
              onClick={handleCopyToken}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs font-bold hover:bg-cyan-100 transition shrink-0"
            >
              {copied ? <FiCheck className="text-emerald-600" /> : <FiCopy />}
              <span>{copied ? "Token Copied!" : "Copy Payload String"}</span>
            </button>
          </div>
        )}
      </div>

      {/* 5-Day Workshop Schedule Selector */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          <span className="text-cyan-700"><FiCalendar /></span>
          <span>5-Day Workshop Schedule Selector</span>
        </h3>

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

        {activeDayDetails && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
              <h4 className="font-bold text-slate-900">{activeDayDetails.title}</h4>
              <span className="font-mono text-cyan-800">{activeDayDetails.time}</span>
            </div>
            <p className="text-slate-600 mb-2">{activeDayDetails.description}</p>
            <div className="text-[11px] font-mono text-slate-500">
              Venue: <span className="font-bold text-slate-800">{activeDayDetails.venue}</span>
            </div>
          </div>
        )}
      </div>

      {/* Verified Attendance History Table */}
      <div>
        <h3 className="text-sm font-bold text-slate-900 mb-3">Attendance History Log</h3>
        <AttendanceTable records={records} loading={loading} />
      </div>
    </div>
  )
}
