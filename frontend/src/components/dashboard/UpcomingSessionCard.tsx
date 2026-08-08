"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { attendanceService } from "@/services/attendanceService"
import { AttendanceSessionDto } from "@/types/attendance"
import {
  FiCalendar,
  FiClock,
  FiMapPin,
  FiCheckCircle,
  FiArrowRight,
  FiAlertCircle,
  FiLock,
  FiInfo,
} from "react-icons/fi"

interface UpcomingSessionCardProps {
  isPaymentSuccess?: boolean
  isProfileComplete?: boolean
  isRegistered?: boolean
}

export default function UpcomingSessionCard({
  isPaymentSuccess = false,
  isProfileComplete = false,
  isRegistered = false,
}: UpcomingSessionCardProps) {
  const [session, setSession] = useState<AttendanceSessionDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isPaymentSuccess) {
      fetchUpcomingSession()
    } else {
      setLoading(false)
    }
  }, [isPaymentSuccess])

  const fetchUpcomingSession = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await attendanceService.getUpcomingSession()
      setSession(data)
    } catch (err: any) {
      if (err?.status !== 404) {
        // Silent graceful fallback without cluttering console/UI
        setError(null)
      }
      setSession(null)
    } finally {
      setLoading(false)
    }
  }

  const formatTimeRange = (start?: string | null, end?: string | null) => {
    if (!start && !end) return "09:30 AM - 04:30 PM"
    if (start && end) return `${start} - ${end}`
    return start || end || ""
  }

  // CASE 1: Payment not completed
  if (!isPaymentSuccess) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
            Next Session Status
          </span>
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
            <FiLock className="text-xs" /> Locked
          </span>
        </div>

        <div className="flex items-start gap-3 text-xs text-slate-600">
          <div className="h-9 w-9 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center text-lg shrink-0">
            <FiAlertCircle />
          </div>
          <div>
            <h4 className="font-extrabold text-slate-900 text-sm">Fee Payment Required</h4>
            <p className="mt-0.5 text-slate-600">
              Complete your ₹500 CBP registration payment first to unlock your workshop session schedule.
            </p>
            <Link
              href={!isRegistered ? "/cbp" : "/payment"}
              className="inline-flex items-center gap-1 text-cyan-700 font-extrabold mt-2 hover:underline"
            >
              <span>{!isRegistered ? "Complete Registration" : "Proceed to Payment"}</span>
              <FiArrowRight />
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm animate-pulse">
        <div className="h-4 w-28 bg-slate-100 rounded mb-3" />
        <div className="h-6 w-48 bg-slate-100 rounded mb-2" />
        <div className="h-4 w-36 bg-slate-100 rounded" />
      </div>
    )
  }

  // CASE 2: Payment completed but no upcoming session published
  if (!session) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
          <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-800 bg-cyan-50 px-2.5 py-0.5 rounded-full border border-cyan-200">
            Upcoming Session
          </span>
          <span className="text-xs font-semibold text-slate-500">No active session</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-center">
          <FiInfo className="text-slate-400 text-xl mx-auto mb-1.5" />
          <p className="font-bold text-slate-800 text-xs">No upcoming sessions right now</p>
          <p className="text-slate-500 mt-0.5">Your next CBP session schedule will appear here once published.</p>
        </div>
      </div>
    )
  }

  const isActive = session.status === "ACTIVE"

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-900 bg-cyan-50 px-2.5 py-0.5 rounded-full border border-cyan-200">
            Next Session
          </span>
          <span className="text-xs font-bold text-slate-900">Day {session.dayNumber}</span>
        </div>

        <span
          className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${
            isActive
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-blue-50 text-blue-800 border-blue-200"
          }`}
        >
          {isActive ? "Attendance Available" : "Upcoming"}
        </span>
      </div>

      <div className="space-y-3">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900">{session.title}</h3>
          {session.description && (
            <p className="text-xs text-slate-600 mt-0.5 line-clamp-1">{session.description}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs pt-1">
          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2">
            <FiCalendar className="text-cyan-700 text-sm shrink-0" />
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Date</span>
              <span className="font-extrabold text-slate-900">{session.sessionDate}</span>
            </div>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2">
            <FiClock className="text-cyan-700 text-sm shrink-0" />
            <div>
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Timing</span>
              <span className="font-bold text-slate-900 font-mono">
                {formatTimeRange(session.startTime, session.endTime)}
              </span>
            </div>
          </div>

          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-2">
            <FiMapPin className="text-cyan-700 text-sm shrink-0" />
            <div className="min-w-0">
              <span className="text-[10px] text-slate-500 font-bold uppercase block">Venue</span>
              <span className="font-extrabold text-slate-900 truncate block">
                {session.venue || "VLTC Auditorium, MNIT"}
              </span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-2 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            {isActive ? "Gate scanning active for this session." : "Mark attendance during session hours."}
          </span>
          <Link
            href="/attendance"
            className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition ${
              isActive
                ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                : "bg-slate-900 hover:bg-slate-800 text-white"
            }`}
          >
            <span>{isActive ? "Open Attendance" : "View Schedule"}</span>
            <FiArrowRight />
          </Link>
        </div>
      </div>
    </div>
  )
}
