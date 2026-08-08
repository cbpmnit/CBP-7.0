"use client"

import Link from "next/link"
import { UserProfileResponse } from "@/types/profile"
import { safeText } from "@/utils/formatters"
import { FiShield, FiCode, FiCheckCircle, FiAlertCircle } from "react-icons/fi"

interface DashboardHeaderProps {
  name: string | null
  studentId: string | null
  role: string | null
  profile: UserProfileResponse | null
  onOpenQr?: () => void
  hasQr?: boolean
}

export default function DashboardHeader({
  name,
  studentId,
  role,
  profile,
  onOpenQr,
  hasQr,
}: DashboardHeaderProps) {
  const displayName = safeText(profile ? `${profile.firstName} ${profile.lastName}` : name, "Student")
  const isProfileComplete = !!profile
  const branchName = profile?.branch ? profile.branch.replace(/_/g, " ") : ""
  const academicLine = profile
    ? `${profile.course} ${branchName ? "in " + branchName : ""} • Year ${profile.year}`
    : "Academic Profile Pending"

  return (
    <header className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 mb-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              MNIT Jaipur &middot; CBP 7.0 Portal
            </span>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold ${
                isProfileComplete
                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                  : "bg-amber-50 text-amber-800 border border-amber-200"
              }`}
            >
              {isProfileComplete ? <FiCheckCircle /> : <FiAlertCircle />}
              <span>{isProfileComplete ? "Profile Verified" : "Action Required"}</span>
            </span>
            {role === "ROLE_ADMIN" && (
              <Link
                href="/admin/dashboard"
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-purple-50 border border-purple-200 text-xs font-semibold text-purple-800 hover:bg-purple-100 transition"
              >
                <FiShield /> Admin Portal
              </Link>
            )}
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Welcome, <span className="gradient-text-cyan">{displayName}</span>
          </h1>
          <p className="mt-0.5 text-xs sm:text-sm text-slate-600 font-medium">
            {academicLine} &middot; Student ID: <span className="font-mono text-cyan-800 font-bold">{safeText(studentId)}</span>
          </p>
        </div>

        {hasQr && onOpenQr && (
          <div className="flex items-center shrink-0">
            <button
              onClick={onOpenQr}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-4 py-2.5 text-xs font-bold uppercase tracking-wider shadow-sm transition"
            >
              <FiCode className="text-base" /> Attendance QR
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
