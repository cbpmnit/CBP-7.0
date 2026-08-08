"use client"

import { AttendanceQrResponse } from "@/types/attendance"
import { safeText, formatDate } from "@/utils/formatters"
import { FiCode, FiClock, FiCheckCircle } from "react-icons/fi"

interface StudentQrCardProps {
  qrCode: AttendanceQrResponse | null
  registrationId?: string | null
  loading?: boolean
}

export default function StudentQrCard({ qrCode, registrationId, loading }: StudentQrCardProps) {
  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-5 animate-pulse shadow-sm">
        <div className="h-5 w-32 bg-slate-100 rounded mb-3" />
        <div className="h-40 w-40 bg-slate-100 rounded mx-auto mb-3" />
        <div className="h-10 w-full bg-slate-100 rounded" />
      </div>
    )
  }

  if (!qrCode) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm text-center">
        <FiCode className="mx-auto text-3xl text-slate-400 mb-2" />
        <h3 className="text-sm font-bold text-slate-900 mb-1">CBP Attendance QR</h3>
        <p className="text-xs text-slate-600">Your attendance QR will be generated upon CBP registration.</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-2">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <span className="text-cyan-700 text-base"><FiCode /></span>
          <span>Official Student Attendance QR</span>
        </h3>
        <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-1">
          <FiCheckCircle /> Active
        </span>
      </div>

      <div className="text-center my-3">
        <div className="p-3 bg-slate-50 rounded-xl inline-block border border-slate-200 shadow-sm">
          <img
            src={qrCode.qrImageBase64}
            alt="Attendance QR Code"
            className="w-44 h-44 mx-auto"
          />
        </div>
      </div>

      <div className="space-y-1 text-xs border-t border-slate-100 pt-3">
        <div className="flex justify-between items-center">
          <span className="text-slate-500 font-medium">Student ID:</span>
          <span className="font-bold text-slate-900 font-mono">{safeText(qrCode.studentId)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-500 font-medium">Registration ID:</span>
          <span className="font-bold text-cyan-800 font-mono">{safeText(registrationId)}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-500 font-medium">Identity Token:</span>
          <span className="font-bold text-slate-800 font-mono truncate max-w-[180px]">{qrCode.token}</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-slate-500 font-medium">Validity:</span>
          <span className="font-semibold text-emerald-700 flex items-center gap-1">
            <FiClock className="text-xs" /> Valid for CBP 7.0 Sessions
          </span>
        </div>
      </div>
    </div>
  )
}
