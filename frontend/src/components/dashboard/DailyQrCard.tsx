"use client"

import { useState } from "react"
import { AttendanceQrResponse } from "@/types/attendance"
import { FiCalendar, FiClock, FiCheckCircle } from "react-icons/fi"

interface DailyQrCardProps {
  studentQr: AttendanceQrResponse | null
}

const CBP_DAYS = [
  { day: 1, title: "Day 1: Orientation & Communication", time: "09:30 AM - 04:30 PM", date: "Day 1 Event" },
  { day: 2, title: "Day 2: Soft Skills & Team Building", time: "09:30 AM - 04:30 PM", date: "Day 2 Event" },
  { day: 3, title: "Day 3: Leadership & Aptitude", time: "09:30 AM - 04:30 PM", date: "Day 3 Event" },
  { day: 4, title: "Day 4: Resume & Interview Prep", time: "09:30 AM - 04:30 PM", date: "Day 4 Event" },
  { day: 5, title: "Day 5: Placement Strategy & Valedictory", time: "09:30 AM - 04:30 PM", date: "Day 5 Event" },
]

export default function DailyQrCard({ studentQr }: DailyQrCardProps) {
  const [selectedDay, setSelectedDay] = useState(1)

  const activeDayObj = CBP_DAYS.find((d) => d.day === selectedDay) || CBP_DAYS[0]

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <span className="text-cyan-700 text-base"><FiCalendar /></span>
          <span>Daily CBP Session Schedule &amp; QR</span>
        </h3>
        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-cyan-50 border border-cyan-200 text-cyan-800">
          5-Day Program
        </span>
      </div>

      {/* Day Selector Buttons */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 mb-3 no-scrollbar">
        {CBP_DAYS.map((d) => (
          <button
            key={d.day}
            onClick={() => setSelectedDay(d.day)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 border transition ${
              selectedDay === d.day
                ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
            }`}
          >
            Day {d.day}
          </button>
        ))}
      </div>

      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-xs font-bold text-slate-900">{activeDayObj.title}</h4>
          <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
            <FiCheckCircle /> Session QR Active
          </span>
        </div>

        <div className="flex items-center gap-4 text-xs text-slate-600 mb-3">
          <span className="flex items-center gap-1">
            <FiClock className="text-slate-500" /> Timing: <strong className="text-slate-800 font-mono">{activeDayObj.time}</strong>
          </span>
        </div>

        {studentQr ? (
          <div className="flex items-center gap-4 bg-white p-3 rounded-lg border border-slate-200">
            <img
              src={studentQr.qrImageBase64}
              alt="Daily QR"
              className="w-16 h-16 rounded border border-slate-200"
            />
            <div className="text-xs space-y-0.5 min-w-0 flex-1">
              <p className="text-slate-500 font-medium">Event QR Payload Token:</p>
              <p className="font-mono text-cyan-800 font-bold truncate text-[11px]">{studentQr.token}</p>
              <p className="text-[11px] text-slate-500">Scan at Entry Gate (Active 3h before session)</p>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-500 italic">Generate student attendance QR to view session entry token.</p>
        )}
      </div>
    </div>
  )
}
