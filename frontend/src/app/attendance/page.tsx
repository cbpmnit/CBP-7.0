"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAppSelector } from "@/store/hooks"
import StudentAttendanceView from "@/components/attendance/StudentAttendanceView"
import SidebarNavigation from "@/components/dashboard/SidebarNavigation"
import { FiArrowLeft } from "react-icons/fi"
import Link from "next/link"
import PageTransition from "@/components/animations/PageTransition"

export default function StudentAttendancePage() {
  const router = useRouter()
  const { role: reduxRole } = useAppSelector((state) => state.auth)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const storedRole = typeof window !== "undefined" ? localStorage.getItem("cbp-role") || "" : ""
    const activeRole = (reduxRole || storedRole || "").toUpperCase()

    if (activeRole === "ROLE_VOLUNTEER" || activeRole === "VOLUNTEER") {
      router.replace("/volunteer/scanner")
    } else if (activeRole === "ROLE_ADMIN" || activeRole === "ADMIN") {
      router.replace("/admin/attendance")
    }
  }, [reduxRole, router])

  if (!mounted) {
    return (
      <div className="flex-1 w-full min-h-[calc(100vh-72px)] flex items-center justify-center bg-slate-50">
        <div className="h-7 w-7 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <PageTransition>
      <div className="flex-1 w-full text-slate-900 min-h-[calc(100vh-72px)] relative bg-slate-50">
        <SidebarNavigation />

        <main className="py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-6">
          {/* Top Bar Header */}
          <div className="flex items-center justify-between">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 px-4 py-2 text-xs font-bold uppercase tracking-wider shadow-sm transition"
            >
              <FiArrowLeft /> Back to Dashboard
            </Link>
            <span className="text-[11px] font-bold text-cyan-800 bg-cyan-50 px-3.5 py-1 rounded-full border border-cyan-200 uppercase tracking-wider">
              Student Gate Pass & Attendance
            </span>
          </div>

          <StudentAttendanceView />
        </main>
      </div>
    </PageTransition>
  )
}
