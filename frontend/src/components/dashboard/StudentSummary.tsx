"use client"

import { UserProfileResponse } from "@/types/profile"
import { safeText } from "@/utils/formatters"
import ProfileAvatar from "@/components/navbar/ProfileAvatar"
import { FiCheckCircle, FiAlertCircle } from "react-icons/fi"

interface StudentSummaryProps {
  name: string | null
  studentId: string | null
  profile: UserProfileResponse | null
}

export default function StudentSummary({ name, studentId, profile }: StudentSummaryProps) {
  const fullName = profile ? `${profile.firstName} ${profile.lastName}`.trim() : (name || "Student")
  const firstName = profile?.firstName || name?.split(" ")[0] || "Student"
  const isProfileComplete = !!profile
  const branchName = profile?.branch ? profile.branch.replace(/_/g, " ") : "Engineering"
  const courseName = profile?.course || "B.Tech"
  const yearText = profile?.year ? `Year ${profile.year}` : "Year 1"

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-center gap-4 min-w-0">
        <ProfileAvatar name={fullName} size="lg" />
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight break-words">
            Welcome, {firstName}
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 mt-1">
            <span>{courseName} in {branchName}</span>
            <span className="hidden sm:inline text-slate-400">&middot;</span>
            <span className="font-mono text-cyan-800 font-bold break-all">{safeText(studentId)}</span>
          </div>
        </div>
      </div>

      <div className="shrink-0 self-start sm:self-center">
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
            isProfileComplete
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-amber-50 text-amber-800 border border-amber-200"
          }`}
        >
          {isProfileComplete ? <FiCheckCircle className="text-emerald-600 text-sm" /> : <FiAlertCircle className="text-amber-600 text-sm" />}
          <span>{isProfileComplete ? "Profile Verified \u2713" : "Action Required"}</span>
        </span>
      </div>
    </div>
  )
}
