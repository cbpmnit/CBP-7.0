"use client"

import { useState } from "react"
import QrScanner from "@/components/dashboard/QrScanner"
import { FiCamera, FiCheckCircle, FiUser, FiClock, FiCheck } from "react-icons/fi"

interface VolunteerScannerViewProps {
  onSuccessMark?: () => void
}

export default function VolunteerScannerView({ onSuccessMark }: VolunteerScannerViewProps) {
  const [scanHistory, setScanHistory] = useState<Array<{
    id: string
    name: string
    studentId: string
    session: string
    time: string
  }>>([])

  const handleScanComplete = () => {
    // Append mock scanned record for instant feedback without confirmation popups
    const now = new Date()
    const timeStr = now.toLocaleTimeString()
    const newRecord = {
      id: Math.random().toString(36).substring(7),
      name: "Samarth Singhal",
      studentId: "2024uch1186",
      session: "Day 1: Orientation & Communication Skills",
      time: timeStr,
    }

    setScanHistory((prev) => [newRecord, ...prev])
    if (onSuccessMark) onSuccessMark()
  }

  return (
    <div className="space-y-6">
      {/* Scanner Control Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
          <div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-800 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200 uppercase tracking-wider mb-1">
              Volunteer Gate Scanner
            </span>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <span className="text-cyan-700"><FiCamera /></span>
              <span>Instant QR Scanner &amp; Attendance Verification</span>
            </h3>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
            Scanner Ready
          </span>
        </div>

        {/* Camera Scanner Integration */}
        <QrScanner onSuccessMark={handleScanComplete} />
      </div>

      {/* Instant Scan Verification Feed (No Confirmation Step Required) */}
      {scanHistory.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-extrabold text-slate-900 mb-3 flex items-center gap-2">
            <span className="text-emerald-600"><FiCheckCircle /></span>
            <span>Recent Validated Scans Log</span>
          </h3>

          <div className="space-y-3">
            {scanHistory.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-emerald-600 text-white flex items-center justify-center text-lg font-bold shrink-0">
                    <FiCheck />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900 text-sm">{item.name}</span>
                      <span className="font-mono text-cyan-800 bg-white px-2 py-0.5 rounded border border-slate-200 font-bold">
                        Student ID: {item.studentId}
                      </span>
                    </div>
                    <p className="text-slate-600 font-semibold mt-0.5">{item.session}</p>
                  </div>
                </div>

                <div className="text-right sm:self-center shrink-0">
                  <span className="inline-flex items-center gap-1 font-mono font-bold text-emerald-900 bg-white px-2.5 py-1 rounded-xl border border-emerald-200">
                    <FiClock /> {item.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
