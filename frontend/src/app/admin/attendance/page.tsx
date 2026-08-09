"use client"

import Link from "next/link"
import AdminAttendanceView from "@/components/attendance/AdminAttendanceView"
import SidebarNavigation from "@/components/dashboard/SidebarNavigation"
import PageTransition from "@/components/animations/PageTransition"
import { FiArrowLeft, FiCode } from "react-icons/fi"

export default function AdminAttendancePage() {
  return (
    <PageTransition>
      <div className="flex-1 w-full text-slate-900 min-h-[calc(100vh-72px)] relative bg-slate-50">
        <SidebarNavigation />

        <main className="py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-6">
          {/* Top Bar Header */}
          <div className="flex items-center justify-between">
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 px-4 py-2 text-xs font-bold uppercase tracking-wider shadow-sm transition"
            >
              <FiArrowLeft /> Admin Dashboard
            </Link>
            <div className="flex items-center gap-2">
              <Link
                href="/admin/sessions"
                className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 px-4 py-2 text-xs font-bold uppercase tracking-wider shadow-sm transition"
              >
                <FiCode className="text-cyan-700" /> Projector QR
              </Link>
              <span className="text-[11px] font-bold text-cyan-800 bg-cyan-50 px-3.5 py-1 rounded-full border border-cyan-200 uppercase tracking-wider">
                Admin Attendance & Gate Management
              </span>
            </div>
          </div>

          <AdminAttendanceView />
        </main>
      </div>
    </PageTransition>
  )
}
