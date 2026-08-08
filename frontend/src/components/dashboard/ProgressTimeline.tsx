"use client"

import { useState } from "react"
import { FiCheck, FiInfo, FiExternalLink } from "react-icons/fi"

interface ProgressTimelineProps {
  isProfileComplete?: boolean
  isRegistered: boolean
  isPaymentSuccess: boolean
  attendancePercentage: number
  isCertificateIssued: boolean
  onStepClick?: (stepId: string) => void
}

export default function ProgressTimeline({
  isRegistered,
  isPaymentSuccess,
  attendancePercentage,
  isCertificateIssued,
  onStepClick,
}: ProgressTimelineProps) {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null)

  const steps = [
    {
      id: "overview",
      label: "Registration",
      completed: isRegistered,
      detail: isRegistered ? "Completed ✓" : "Action Needed",
      tooltip: "CBP program student enrollment and student ID allocation.",
    },
    {
      id: "payments",
      label: "Payment",
      completed: isPaymentSuccess,
      detail: isPaymentSuccess ? "Paid ✓" : "Pending Fee",
      tooltip: "₹500 PhonePe online gateway fee verification.",
    },
    {
      id: "attendance",
      label: "Attendance",
      completed: attendancePercentage >= 75,
      detail: `${attendancePercentage.toFixed(0)}% (Min 75%)`,
      tooltip: "Requires 75% workshop attendance across 5 daily sessions.",
    },
    {
      id: "certificates",
      label: "Certificate",
      completed: isCertificateIssued,
      detail: isCertificateIssued ? "Issued ✓" : "Locked",
      tooltip: "Official PDF credential unlocked upon meeting 75% attendance.",
    },
  ]

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 mb-6 shadow-sm">
      <div className="flex items-center justify-between gap-2 max-w-4xl mx-auto relative">
        <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-100 -translate-y-1/2 z-0" />
        {steps.map((step, idx) => (
          <div key={step.id} className="relative z-10 flex flex-col items-center text-center bg-white px-2 group">
            <button
              onClick={() => onStepClick && onStepClick(step.id)}
              onMouseEnter={() => setActiveTooltip(step.id)}
              onMouseLeave={() => setActiveTooltip(null)}
              className={`h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 mb-1.5 cursor-pointer transform group-hover:scale-110 ${
                step.completed
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20 group-hover:bg-emerald-700"
                  : "bg-slate-100 border border-slate-200 text-slate-600 group-hover:border-cyan-600 group-hover:text-cyan-800"
              }`}
            >
              {step.completed ? <FiCheck className="text-sm" /> : idx + 1}
            </button>

            <button
              onClick={() => onStepClick && onStepClick(step.id)}
              className="text-xs font-bold text-slate-900 group-hover:text-cyan-700 transition flex items-center gap-1"
            >
              <span>{step.label}</span>
              <FiExternalLink className="text-[10px] opacity-0 group-hover:opacity-100 transition" />
            </button>

            <span className={`text-[10px] font-semibold mt-0.5 ${step.completed ? "text-emerald-700 font-bold" : "text-slate-500"}`}>
              {step.detail}
            </span>

            {/* Interactive Hover Tooltip */}
            {activeTooltip === step.id && (
              <div className="absolute bottom-full mb-2 bg-slate-900 text-white text-[11px] font-medium px-3 py-1.5 rounded-xl shadow-xl w-44 z-30 pointer-events-none transition-all duration-200">
                {step.tooltip}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
