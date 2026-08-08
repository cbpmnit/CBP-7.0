"use client"

import { FiCheck } from "react-icons/fi"

interface ProgressTimelineProps {
  isProfileComplete: boolean
  isRegistered: boolean
  isPaymentSuccess: boolean
  attendancePercentage: number
  isCertificateIssued: boolean
}

export default function ProgressTimeline({
  isProfileComplete,
  isRegistered,
  isPaymentSuccess,
  attendancePercentage,
  isCertificateIssued,
}: ProgressTimelineProps) {
  const steps = [
    {
      label: "Registration",
      status: isRegistered ? "Completed ✓" : "Pending",
      completed: isRegistered,
    },
    {
      label: "Payment",
      status: isPaymentSuccess ? "Paid ✓" : "Pending",
      completed: isPaymentSuccess,
    },
    {
      label: "Attendance",
      status: `${attendancePercentage.toFixed(0)}% Attended`,
      completed: attendancePercentage >= 75,
    },
    {
      label: "Certificate",
      status: isCertificateIssued ? "Issued ✓" : "Pending",
      completed: isCertificateIssued,
    },
  ]

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 mb-6 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
          Student Progress Journey
        </h2>
        <span className="text-[11px] text-slate-500 font-mono">CBP 7.0 Lifecycle</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {steps.map((step, idx) => (
          <div
            key={step.label}
            className={`p-3 rounded-xl border transition-all duration-200 hover:-translate-y-0.5 ${
              step.completed
                ? "bg-emerald-50/60 border-emerald-200 text-slate-900 shadow-sm"
                : "bg-slate-50/80 border-slate-200 text-slate-600"
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-900">{step.label}</span>
              <span
                className={`inline-flex items-center justify-center h-4 w-4 rounded-full text-[10px] font-bold shrink-0 ${
                  step.completed
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-200 text-slate-600"
                }`}
              >
                {step.completed ? <FiCheck /> : idx + 1}
              </span>
            </div>
            <div
              className={`text-[11px] font-semibold ${
                step.completed ? "text-emerald-700 font-bold" : "text-slate-500"
              }`}
            >
              {step.status}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
