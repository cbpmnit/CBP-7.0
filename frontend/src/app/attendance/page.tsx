"use client"

import Link from "next/link"
import PageTransition from "@/components/animations/PageTransition"
import AttendanceModule from "@/components/attendance/AttendanceModule"
import { FiArrowLeft } from "react-icons/fi"

export default function AttendancePage() {
  return (
    <PageTransition>
      <main className="min-h-[calc(100vh-80px)] bg-cbp-grid text-slate-900 py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          {/* Top Return Bar */}
          <div className="flex items-center justify-between mb-6">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 px-4 py-2 text-xs font-bold uppercase tracking-wider shadow-sm transition"
            >
              <FiArrowLeft /> Back to Dashboard
            </Link>
            <span className="text-[11px] font-bold text-cyan-800 bg-cyan-50 px-3 py-1 rounded-full border border-cyan-200 uppercase tracking-wider">
              CBP 7.0 Module
            </span>
          </div>

          {/* Master Attendance Module Component */}
          <AttendanceModule />
        </div>
      </main>
    </PageTransition>
  )
}
