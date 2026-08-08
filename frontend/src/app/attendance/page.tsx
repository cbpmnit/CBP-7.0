"use client"

import { useState } from "react"
import StudentAttendanceView from "@/components/attendance/StudentAttendanceView"
import AdminAttendanceView from "@/components/attendance/AdminAttendanceView"
import VolunteerAttendanceView from "@/components/attendance/VolunteerAttendanceView"
import SidebarNavigation from "@/components/dashboard/SidebarNavigation"
import { FiUserCheck, FiShield, FiCamera, FiArrowLeft } from "react-icons/fi"
import Link from "next/link"

export default function MasterAttendancePage() {
  const [activeRoleView, setActiveRoleView] = useState<"student" | "admin" | "volunteer">("student")

  return (
    <div className="flex-1 w-full text-slate-900 min-h-[calc(100vh-72px)] relative">
      <SidebarNavigation />

      <main className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl space-y-6">
          {/* Top Bar */}
          <div className="flex items-center justify-between">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 px-4 py-2 text-xs font-bold uppercase tracking-wider shadow-sm transition"
            >
              <FiArrowLeft /> Back to Dashboard
            </Link>
            <span className="text-[11px] font-bold text-cyan-800 bg-cyan-50 px-3 py-1 rounded-full border border-cyan-200 uppercase tracking-wider">
              CBP 7.0 Attendance Portal
            </span>
          </div>

          {/* Role Navigation Tab Switcher */}
          <div className="bg-white border border-slate-200 rounded-2xl p-2 shadow-sm flex items-center justify-between gap-2 overflow-x-auto">
            <div className="flex items-center gap-1 min-w-max">
              <button
                onClick={() => setActiveRoleView("student")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
                  activeRoleView === "student"
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <FiUserCheck className="text-sm" />
                <span>Student View</span>
              </button>

              <button
                onClick={() => setActiveRoleView("admin")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
                  activeRoleView === "admin"
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <FiShield className="text-sm" />
                <span>Admin View</span>
              </button>

              <button
                onClick={() => setActiveRoleView("volunteer")}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
                  activeRoleView === "volunteer"
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <FiCamera className="text-sm" />
                <span>Volunteer View</span>
              </button>
            </div>

            <div className="hidden sm:flex items-center gap-2 pr-2 text-[11px] font-semibold text-slate-500">
              Direct Routes:
              <Link href="/attendance/student" className="text-cyan-700 hover:underline">/student</Link> •
              <Link href="/attendance/admin" className="text-cyan-700 hover:underline">/admin</Link> •
              <Link href="/attendance/volunteer" className="text-cyan-700 hover:underline">/volunteer</Link>
            </div>
          </div>

          {/* Active Role View */}
          <div>
            {activeRoleView === "student" && <StudentAttendanceView />}
            {activeRoleView === "admin" && <AdminAttendanceView />}
            {activeRoleView === "volunteer" && <VolunteerAttendanceView />}
          </div>
        </div>
      </main>
    </div>
  )
}
