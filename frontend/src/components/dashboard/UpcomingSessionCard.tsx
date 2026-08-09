"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { attendanceService } from "@/services/attendanceService"
import { AttendanceSessionDto } from "@/types/attendance"
import {
  FiCalendar,
  FiClock,
  FiMapPin,
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

  useEffect(() => {
    if (isPaymentSuccess) {
      fetchUpcomingSession()
    } else {
      setLoading(false)
    }
  }, [isPaymentSuccess])

  const fetchUpcomingSession = async () => {
    setLoading(true)
    try {
      const data = await attendanceService.getUpcomingSession()
      setSession(data)
    } catch {
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
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-100">
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
            Next Session
          </span>
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
            <FiLock className="text-xs" /> Locked
          </span>
        </div>

        <div className="flex items-start gap-3 text-xs text-slate-600">
          <div className="h-8 w-8 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center text-base shrink-0">
            <FiAlertCircle />
          </div>
          <div>
            <h4 className="font-extrabold text-slate-900 text-sm">Fee Payment Required</h4>
            <p className="mt-0.5 text-slate-600">
              Complete your ₹500 CBP registration fee to view your upcoming workshop schedule.
            </p>
            <Link
              href={!isRegistered ? "/cbp" : "/payment"}
              className="inline-flex items-center gap-1 text-cyan-700 font-extrabold mt-2 hover:underline text-xs"
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
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs animate-pulse space-y-3">
        <div className="h-4 w-28 bg-slate-100 rounded" />
        <div className="h-5 w-48 bg-slate-100 rounded" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="h-10 bg-slate-100 rounded-xl" />
          <div className="h-10 bg-slate-100 rounded-xl" />
          <div className="h-10 bg-slate-100 rounded-xl" />
        </div>
      </div>
    )
  }

  // CASE 2: Payment completed but no session published
  if (!session) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
          <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-800 bg-cyan-50 px-2.5 py-0.5 rounded-full border border-cyan-200">
            Upcoming Session
          </span>
          <span className="text-xs text-slate-400">Schedule Pending</span>
        </div>

        <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-center text-xs text-slate-500">
          No upcoming session scheduled right now.
        </div>
      </div>
    )
  }

  const isActive = session.status === "ACTIVE"
  const dayNumber = (session as any).dayNumber || (session as any).day || 1

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-900 bg-cyan-50 px-2.5 py-0.5 rounded-full border border-cyan-200">
            Day {dayNumber}
          </span>
          <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">
            {session.title}
          </h3>
        </div>

        <span
          className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border uppercase tracking-wider shrink-0 ${
            isActive
              ? "bg-emerald-50 text-emerald-800 border-emerald-200 animate-pulse"
              : "bg-blue-50 text-blue-800 border-blue-200"
          }`}
        >
          {isActive ? "Active Now" : "Upcoming"}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2">
          <FiCalendar className="text-cyan-700 text-sm shrink-0" />
          <div className="min-w-0">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Date</span>
            <span className="font-bold text-slate-900 truncate block">{session.sessionDate}</span>
          </div>
        </div>

        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2">
          <FiClock className="text-cyan-700 text-sm shrink-0" />
          <div className="min-w-0">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Time</span>
            <span className="font-bold text-slate-900 font-mono truncate block">
              {formatTimeRange(session.startTime, session.endTime)}
            </span>
          </div>
        </div>

        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2">
          <FiMapPin className="text-cyan-700 text-sm shrink-0" />
          <div className="min-w-0">
            <span className="text-[10px] text-slate-400 font-bold uppercase block">Venue</span>
            <span className="font-bold text-slate-900 truncate block">
              {session.venue || "VLTC Auditorium, MNIT"}
            </span>
          </div>
        </div>
      </div>

      <div className="pt-1 flex items-center justify-between">
        <span className="text-[11px] text-slate-500">
          {isActive ? "Scan your QR pass at the entrance." : "Present pass during workshop check-in."}
        </span>
        <Link
          href="/attendance"
          className="inline-flex items-center gap-1 text-xs font-bold text-cyan-700 hover:text-cyan-900 hover:underline"
        >
          <span>View Pass</span>
          <FiArrowRight />
        </Link>
      </div>
    </div>
  )
}
