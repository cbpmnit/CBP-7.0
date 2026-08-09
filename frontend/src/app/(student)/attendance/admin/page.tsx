"use client"

import AdminAttendanceView from "@/components/attendance/AdminAttendanceView"
import Link from "next/link"
import { FiShield } from "react-icons/fi"

export default function AdminAttendancePage() {
  return (
    <main className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header Banner */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="h-12 w-12 rounded-xl bg-cyan-600/30 border border-cyan-500/40 text-cyan-400 flex items-center justify-center text-2xl shrink-0">
              <FiShield />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-400 bg-cyan-950/60 px-2.5 py-0.5 rounded-full border border-cyan-800">
                Organizer Console
              </span>
              <h1 className="text-xl font-extrabold mt-1 text-white">Admin Attendance Management</h1>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto text-xs font-bold">
            <Link
              href="/attendance/student"
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              Student View →
            </Link>
            <Link
              href="/attendance/volunteer"
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              Volunteer View →
            </Link>
          </div>
        </div>

        <AdminAttendanceView />
      </div>
    </main>
  )
}
