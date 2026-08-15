"use client"

import React from "react"
import { FiShield, FiUser, FiGlobe, FiKey, FiCheck } from "react-icons/fi"
import { Badge, Card } from "@/components/ui"

interface AccountIdentityCardProps {
  studentId?: string | null
  role?: string | null
  hasPassword: boolean
}

export function AccountIdentityCard({ studentId, role, hasPassword }: AccountIdentityCardProps) {
  return (
    <Card className="space-y-6">
      <div className="flex items-center gap-3.5 pb-5 border-b border-slate-100">
        <div className="p-3 rounded-2xl bg-slate-100 text-slate-700">
          <FiShield className="text-lg" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            Account Identity &amp; Security Status
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Your authenticated credentials and login connection details
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Student ID */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-white text-cyan-600 shadow-xs mt-0.5">
            <FiUser className="text-base" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Student ID
            </span>
            <p className="text-sm font-extrabold text-slate-900 font-mono mt-0.5">
              {studentId || "Not assigned"}
            </p>
          </div>
        </div>

        {/* Account Role */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-white text-cyan-600 shadow-xs mt-0.5">
            <FiShield className="text-base" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Account Role
            </span>
            <p className="text-sm font-extrabold text-slate-900 uppercase mt-0.5">
              {role || "STUDENT"}
            </p>
          </div>
        </div>

        {/* Connected Login Methods */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-white text-blue-600 shadow-xs mt-0.5">
            <FiGlobe className="text-base" />
          </div>
          <div className="flex-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Google OAuth Authentication
            </span>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="success" icon={<FiCheck className="text-xs" />}>
                Connected
              </Badge>
            </div>
          </div>
        </div>

        {/* Password Credential Status */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-white text-emerald-600 shadow-xs mt-0.5">
            <FiKey className="text-base" />
          </div>
          <div className="flex-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Student ID Credential Login
            </span>
            <div className="flex items-center gap-2 mt-1">
              {hasPassword ? (
                <Badge variant="success" icon={<FiCheck className="text-xs" />}>
                  Password Active
                </Badge>
              ) : (
                <Badge variant="warning">
                  Password Pending
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
