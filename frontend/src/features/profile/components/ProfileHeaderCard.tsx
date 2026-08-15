"use client"

import React from "react"
import { ProfileAvatar } from "@/components/ui/ProfileAvatar"
import { FiUserCheck, FiCheckCircle, FiInfo } from "react-icons/fi"

interface ProfileHeaderCardProps {
  displayName: string
  studentId?: string | null
  email?: string | null
  isComplete: boolean
  registrationEligible: boolean
  profileStatus: string
  missingRequiredFields: string[]
  missingOptionalFields: string[]
}

export function ProfileHeaderCard({
  displayName,
  studentId,
  email,
  isComplete,
  registrationEligible,
  profileStatus,
  missingRequiredFields,
  missingOptionalFields,
}: ProfileHeaderCardProps) {
  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl shadow-slate-200/60 mb-6">
      <div className="flex flex-col md:flex-row items-center gap-6">
        <ProfileAvatar name={displayName} size="lg" />
        <div className="flex-1 text-center md:text-left space-y-1.5">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
            <h1 className="text-2xl font-extrabold text-slate-900">{displayName}</h1>
            {isComplete ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                <FiCheckCircle className="text-xs" /> Complete Profile
              </span>
            ) : registrationEligible ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-700 text-xs font-bold">
                <FiUserCheck className="text-xs" /> Eligible Profile
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
                <FiInfo className="text-xs" /> Incomplete Profile
              </span>
            )}
          </div>
          <p className="text-xs font-mono font-bold text-slate-500">
            Student ID: <span className="text-slate-900">{studentId || "Pending Setup"}</span>
          </p>
          <p className="text-xs font-medium text-slate-500">{email || ""}</p>
        </div>
      </div>

      {/* Completion Alerts */}
      {!isComplete && (
        <div className="mt-6 pt-6 border-t border-slate-100">
          {missingRequiredFields.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium space-y-1">
              <span className="font-bold block">Required fields remaining for full completion:</span>
              <p>{missingRequiredFields.join(", ")}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
