"use client"

import { FiBell, FiCheckCircle, FiInfo, FiAlertCircle } from "react-icons/fi"
import { formatDate } from "@/utils/formatters"

interface NotificationItem {
  id: string
  title: string
  message: string
  date: string
  type: "success" | "info" | "warning"
}

interface NotificationPanelProps {
  isRegistered: boolean
  isPaid: boolean
  attendancePct: number
  isCertAvailable: boolean
}

export default function NotificationPanel({
  isRegistered,
  isPaid,
  attendancePct,
  isCertAvailable,
}: NotificationPanelProps) {
  const notifications: NotificationItem[] = []

  if (isCertAvailable) {
    notifications.push({
      id: "notif-cert",
      title: "Certificate Available",
      message: "Your official CBP 7.0 completion certificate is ready for download.",
      date: new Date().toISOString(),
      type: "success",
    })
  } else if (attendancePct >= 75) {
    notifications.push({
      id: "notif-att-eligible",
      title: "Attendance Requirement Met",
      message: `Your current attendance is ${attendancePct.toFixed(0)}%, satisfying the 75% threshold.`,
      date: new Date().toISOString(),
      type: "success",
    })
  }

  if (isPaid) {
    notifications.push({
      id: "notif-paid",
      title: "Payment Confirmed",
      message: "Registration fee payment confirmed by gateway.",
      date: new Date().toISOString(),
      type: "success",
    })
  } else if (isRegistered) {
    notifications.push({
      id: "notif-pay-pending",
      title: "Payment Pending",
      message: "Please complete registration fee payment to finalize your spot.",
      date: new Date().toISOString(),
      type: "warning",
    })
  }

  if (isRegistered) {
    notifications.push({
      id: "notif-reg",
      title: "CBP Program Registration Active",
      message: "Enrolled in soft skills training workshops at MNIT Jaipur.",
      date: new Date().toISOString(),
      type: "info",
    })
  } else {
    notifications.push({
      id: "notif-profile-welcome",
      title: "Welcome to CBP 7.0 Portal",
      message: "Complete your academic profile details to get started.",
      date: new Date().toISOString(),
      type: "info",
    })
  }

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <span className="text-cyan-700 text-base"><FiBell /></span>
          <span>Notification Inbox</span>
        </h3>
        <span className="text-xs font-mono text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200 font-bold">
          {notifications.length} Updates
        </span>
      </div>

      <div className="space-y-2.5">
        {notifications.map((n) => (
          <div
            key={n.id}
            className="flex items-start gap-2.5 pb-2.5 border-b border-slate-100 last:border-0 last:pb-0"
          >
            <div className="mt-0.5 shrink-0 text-sm">
              {n.type === "success" ? (
                <FiCheckCircle className="text-emerald-600" />
              ) : n.type === "warning" ? (
                <FiAlertCircle className="text-amber-600" />
              ) : (
                <FiInfo className="text-cyan-600" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-xs font-bold text-slate-900 truncate">{n.title}</h4>
                <span className="text-[10px] font-mono text-slate-400 shrink-0">{formatDate(n.date)}</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed mt-0.5">{n.message}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
