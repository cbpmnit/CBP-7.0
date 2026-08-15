"use client"

import { UserProfileResponse } from "@/features/profile/types"
import { safeText } from "@/utils/formatters"
import { ProfileAvatar } from "@/components/ui/ProfileAvatar"
import { StatusBadge } from "@/components/ui/StatusBadge"

interface StudentSummaryProps {
  name: string | null
  studentId: string | null
  profile: UserProfileResponse | null
}

export function StudentSummary({ name, studentId, profile }: StudentSummaryProps) {
  const fullName = profile ? `${profile.firstName} ${profile.lastName}`.trim() : (name || "Student")
  const firstName = profile?.firstName || name?.split(" ")[0] || "Student"
  const isProfileComplete = !!profile
  const deptName = profile?.department || (profile as any)?.branch || "Computer Science and Engineering"
  const progLevel = profile?.programLevel || (profile as any)?.course || "Undergraduate"

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-center gap-4 min-w-0">
        <ProfileAvatar name={fullName} size="lg" />
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight break-words">
            Welcome, {firstName}
          </h1>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 mt-1">
            <span>{progLevel} in {deptName}</span>
            <span className="hidden sm:inline text-slate-400">&middot;</span>
            <span className="font-mono text-cyan-800 font-bold break-all">{safeText(studentId)}</span>
          </div>
        </div>
      </div>

      <div className="shrink-0 self-start sm:self-center">
        <StatusBadge
          status={isProfileComplete ? "ACTIVE" : "PENDING"}
          label={isProfileComplete ? "Profile Verified \u2713" : "Action Required"}
        />
      </div>
    </div>
  )
}

export default StudentSummary
