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
  const isProfileComplete = !!profile
  const branchName = profile?.branch ? profile.branch.replace(/_/g, " ") : "Engineering"
  const courseName = profile?.course || "B.Tech"
  const yearText = profile?.year ? `Year ${profile.year}` : "Year 1"

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 cbp-card-interactive">
      <div className="flex items-center gap-4 sm:gap-5 min-w-0">
        <ProfileAvatar name={fullName} size="lg" />
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight truncate">
            {fullName}
          </h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-700 mt-0.5">
            {courseName} in {branchName}
          </p>
          <p className="text-xs font-medium text-slate-500 font-mono mt-1">
            {yearText} &middot; Student ID: <span className="font-bold text-cyan-800">{safeText(studentId)}</span>
          </p>
        </div>
      </div>

      <div className="shrink-0 self-start sm:self-center">
        <span
          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold ${
            isProfileComplete
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-amber-50 text-amber-800 border border-amber-200"
          }`}
        >
          {isProfileComplete ? <FiCheckCircle className="text-emerald-600" /> : <FiAlertCircle className="text-amber-600" />}
          <span>{isProfileComplete ? "Profile Verified \u2713" : "Action Required"}</span>
        </span>
      </div>
    </div>
  )
}
