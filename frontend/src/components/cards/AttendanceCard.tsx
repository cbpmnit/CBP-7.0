"use client"

import { StudentAttendanceSummaryResponse } from "@/types/attendance"
import { FiCheckCircle, FiClock, FiPercent } from "react-icons/fi"

interface AttendanceCardProps {
  summary: StudentAttendanceSummaryResponse | null
  loading?: boolean
}

export default function AttendanceCard({ summary, loading }: AttendanceCardProps) {
  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-5 animate-pulse shadow-sm">
        <div className="h-5 w-32 bg-slate-100 rounded mb-3" />
        <div className="h-7 w-20 bg-slate-100 rounded mb-2" />
        <div className="h-2.5 w-full bg-slate-100 rounded" />
      </div>
    )
  }

  const percentage = summary?.attendancePercentage ?? summary?.percentage ?? 0
  const isEligible = percentage >= 75
  const present = summary?.attendedSessions ?? summary?.present ?? 0
  const total = summary?.totalSessions ?? summary?.totalClasses ?? 0

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm cbp-card-interactive flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span className="text-cyan-700 text-base"><FiPercent /></span>
            <span>Attendance Progress</span>
          </h3>
          <span
            className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
              isEligible
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-amber-50 border-amber-200 text-amber-800"
            }`}
          >
            {isEligible ? "Eligible for Certificate" : "< 75% Requirement"}
          </span>
        </div>

        <div className="flex items-baseline justify-between mb-2">
          <div className="text-2xl font-extrabold text-slate-900 font-mono">
            {percentage.toFixed(1)}%
          </div>
          <div className="text-xs text-slate-700 font-medium">
            <span className="font-bold text-slate-900">{present}</span> / <span className="font-bold text-slate-900">{total}</span> sessions completed
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-3 border border-slate-200">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              isEligible ? "bg-gradient-to-r from-cyan-600 to-blue-600" : "bg-amber-500"
            }`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-600 border-t border-slate-100 pt-2.5">
        <span className="flex items-center gap-1">
          <FiCheckCircle className="text-emerald-600" /> Present: <strong className="text-slate-900 font-mono">{present}</strong>
        </span>
        <span className="flex items-center gap-1">
          <FiClock className="text-slate-500" /> Threshold: <strong className="text-slate-900 font-mono">75%</strong>
        </span>
      </div>
    </div>
  )
}
