"use client"

import React from "react"
import Link from "next/link"
import { useDashboard } from "../hooks/useDashboard"
import StudentSummary from "@/components/dashboard/StudentSummary"
import ProgressTimeline from "@/components/dashboard/ProgressTimeline"
import {
  FiUser,
  FiCamera,
  FiCreditCard,
  FiAward,
  FiArrowRight,
} from "react-icons/fi"

export default function StudentDashboard() {
  const {
    studentId,
    name,
    loading,
    profile,
    isProfileComplete,
    isCbpRegistered,
    isPaymentSuccess,
    attendancePct,
    isCertificateIssued,
  } = useDashboard()

  const quickNavPortals = [
    {
      title: "Student Profile",
      href: "/profile",
      icon: <FiUser />,
      badge: isProfileComplete ? "Verified ✓" : "Pending",
      badgeColor: isProfileComplete
        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
        : "bg-amber-50 text-amber-800 border-amber-200",
    },
    {
      title: "Attendance & QR",
      href: "/attendance",
      icon: <FiCamera />,
      badge: `${attendancePct.toFixed(0)}% Logged`,
      badgeColor: "bg-cyan-50 text-cyan-800 border-cyan-200",
    },
    {
      title: "Fee Payments",
      href: "/payment",
      icon: <FiCreditCard />,
      badge: isPaymentSuccess ? "Paid ✓" : isCbpRegistered ? "Pending Fee" : "Required",
      badgeColor: isPaymentSuccess
        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
        : "bg-amber-50 text-amber-800 border-amber-200",
    },
    {
      title: "Certificates",
      href: "/certificate",
      icon: <FiAward />,
      badge: isCertificateIssued ? "Issued ✓" : attendancePct >= 75 && isPaymentSuccess ? "Eligible ✓" : "Locked",
      badgeColor: isCertificateIssued || (attendancePct >= 75 && isPaymentSuccess)
        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
        : "bg-slate-100 text-slate-600 border-slate-200",
    },
  ]

  if (loading) {
    return (
      <div className="py-12 flex justify-center items-center">
        <div className="h-8 w-8 border-3 border-cyan-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 1. Student Identity Header */}
      <StudentSummary name={name} studentId={studentId} profile={profile} />

      {/* 2. 4-Step Progress Roadmap & Next Action Card */}
      <ProgressTimeline
        isProfileComplete={isProfileComplete}
        isRegistered={isCbpRegistered}
        isPaymentSuccess={isPaymentSuccess}
        attendancePercentage={attendancePct}
        isCertificateIssued={isCertificateIssued}
      />

      {/* 3. Quick Portal Links */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
          Quick Navigation
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickNavPortals.map((portal) => (
            <Link
              key={portal.title}
              href={portal.href}
              className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:border-slate-300 hover:shadow-md transition flex flex-col justify-between gap-3 group"
            >
              <div className="flex items-center justify-between">
                <div className="h-9 w-9 rounded-xl bg-slate-50 border border-slate-200 text-cyan-700 flex items-center justify-center text-lg shrink-0 group-hover:bg-cyan-600 group-hover:text-white group-hover:border-transparent transition">
                  {portal.icon}
                </div>
                <FiArrowRight className="text-slate-300 group-hover:text-cyan-600 group-hover:translate-x-0.5 transition" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 truncate">{portal.title}</h3>
                <span
                  className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border mt-1.5 ${portal.badgeColor}`}
                >
                  {portal.badge}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
