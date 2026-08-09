"use client"

import { AttendanceQrResponse } from "@/types/attendance"
import { safeText } from "@/utils/formatters"
import { FiCode, FiClock, FiCheckCircle } from "react-icons/fi"

interface StudentQrCardProps {
  qrCode: AttendanceQrResponse | null
  registrationId?: string | null
  loading?: boolean
}

export default function StudentQrCard({ qrCode, registrationId, loading }: StudentQrCardProps) {
  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 animate-pulse shadow-xs space-y-3">
        <div className="h-4 w-32 bg-slate-100 rounded" />
        <div className="h-36 w-36 bg-slate-100 rounded-xl mx-auto" />
        <div className="h-8 w-full bg-slate-100 rounded" />
      </div>
    )
  }

  if (!qrCode) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs text-center space-y-1.5">
        <FiCode className="mx-auto text-2xl text-slate-400" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">Attendance QR</h3>
        <p className="text-[11px] text-slate-500">Your attendance QR pass will be active once registration is verified.</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
          <FiCode className="text-cyan-700" /> Student Attendance QR
        </h3>
        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-1">
          <FiCheckCircle /> Active
        </span>
      </div>

      <div className="text-center py-1">
        <div className="p-3 bg-slate-50 rounded-xl inline-block border border-slate-200">
          <img
            key={qrCode.token}
            src={qrCode.qrImageBase64}
            alt="Attendance QR Code"
            className="w-36 h-36 sm:w-40 sm:h-40 mx-auto"
          />
        </div>
      </div>

      <div className="space-y-1 text-xs border-t border-slate-100 pt-2.5">
        <div className="flex justify-between items-center">
          <span className="text-[11px] text-slate-400 font-medium">Student ID:</span>
          <span className="font-bold text-slate-900 font-mono">{safeText(qrCode.studentId)}</span>
        </div>
        {registrationId && (
          <div className="flex justify-between items-center">
            <span className="text-[11px] text-slate-400 font-medium">Registration ID:</span>
            <span className="font-bold text-cyan-800 font-mono">{safeText(registrationId)}</span>
          </div>
        )}
        <div className="flex justify-between items-center">
          <span className="text-[11px] text-slate-400 font-medium">Token:</span>
          <span className="font-bold text-slate-800 font-mono truncate max-w-[140px] sm:max-w-[180px]">
            {qrCode.token}
          </span>
        </div>
      </div>
    </div>
  )
}
