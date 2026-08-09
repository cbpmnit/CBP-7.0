"use client"

import { useState } from "react"
import { AttendanceQrResponse } from "@/types/attendance"
import { FiCalendar, FiClock, FiCheckCircle } from "react-icons/fi"

interface DailyQrCardProps {
  studentQr: AttendanceQrResponse | null
}

const CBP_DAYS = [
  { day: 1, title: "Day 1: Orientation & Communication", time: "09:30 AM - 04:30 PM" },
  { day: 2, title: "Day 2: Soft Skills & Team Building", time: "09:30 AM - 04:30 PM" },
  { day: 3, title: "Day 3: Leadership & Aptitude", time: "09:30 AM - 04:30 PM" },
  { day: 4, title: "Day 4: Resume & Interview Prep", time: "09:30 AM - 04:30 PM" },
  { day: 5, title: "Day 5: Placement Strategy & Valedictory", time: "09:30 AM - 04:30 PM" },
]

export default function DailyQrCard({ studentQr }: DailyQrCardProps) {
  const [selectedDay, setSelectedDay] = useState(1)
  const activeDayObj = CBP_DAYS.find((d) => d.day === selectedDay) || CBP_DAYS[0]

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
          <FiCalendar className="text-cyan-700" /> Daily Schedule &amp; QR
        </h3>
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-50 border border-cyan-200 text-cyan-800">
          5-Day Program
        </span>
      </div>

      {/* Day Selector Buttons */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {CBP_DAYS.map((d) => (
          <button
            key={d.day}
            onClick={() => setSelectedDay(d.day)}
            className={`px-3 py-1 rounded-lg text-xs font-bold shrink-0 border transition cursor-pointer ${
              selectedDay === d.day
                ? "bg-slate-900 text-white border-slate-900 shadow-2xs"
                : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
            }`}
          >
            Day {d.day}
          </button>
        ))}
      </div>

      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-extrabold text-slate-900">{activeDayObj.title}</h4>
          <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
            <FiCheckCircle /> Active
          </span>
        </div>

        <div className="text-[11px] text-slate-500 flex items-center gap-1">
          <FiClock className="text-slate-400" />
          <span>Timing: <strong className="text-slate-800 font-mono">{activeDayObj.time}</strong></span>
        </div>

        {studentQr ? (
          <div className="flex items-center gap-3 bg-white p-2.5 rounded-lg border border-slate-200 mt-2">
            <img
              key={studentQr.token}
              src={studentQr.qrImageBase64}
              alt="Daily QR"
              className="w-14 h-14 rounded border border-slate-100 shrink-0"
            />
            <div className="text-xs min-w-0 flex-1 space-y-0.5">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Token</span>
              <p className="font-mono text-cyan-800 font-bold truncate text-[11px]">{studentQr.token}</p>
            </div>
          </div>
        ) : (
          <p className="text-[11px] text-slate-400 italic pt-1">
            Entry QR pass will be active for this session day.
          </p>
        )}
      </div>
    </div>
  )
}
