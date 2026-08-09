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
      desc: "Personal, academic, and hostel verification details.",
      href: "/profile",
      icon: <FiUser />,
      badge: isProfileComplete ? "Verified ✓" : "Pending",
      badgeColor: isProfileComplete
        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
        : "bg-amber-50 text-amber-800 border-amber-200",
    },
    {
      title: "Attendance & QR",
      desc: "Daily session attendance tracking and gate scanner.",
      href: "/attendance",
      icon: <FiCamera />,
      badge: `${attendancePct.toFixed(0)}% Logged`,
      badgeColor: "bg-cyan-50 text-cyan-800 border-cyan-200",
    },
    {
      title: "Fee Payments",
      desc: "PhonePe transaction status and fee receipts.",
      href: "/payment",
      icon: <FiCreditCard />,
      badge: isPaymentSuccess ? "Paid ✓" : isCbpRegistered ? "Pending Fee" : "Registration First",
      badgeColor: isPaymentSuccess
        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
        : "bg-amber-50 text-amber-800 border-amber-200",
    },
    {
      title: "Certificates",
      desc: "Eligibility checklist and official PDF credential download.",
      href: "/certificate",
      icon: <FiAward />,
      badge: isCertificateIssued ? "Issued ✓" : "Module Portal",
      badgeColor: isCertificateIssued
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
    <main className="py-6 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* 1. Student Identity Header Card */}
        <StudentSummary name={name} studentId={studentId} profile={profile} />

        {/* 2. 4-Step Progress Roadmap & Next Action Card */}
        <ProgressTimeline
          isProfileComplete={isProfileComplete}
          isRegistered={isCbpRegistered}
          isPaymentSuccess={isPaymentSuccess}
          attendancePercentage={attendancePct}
          isCertificateIssued={isCertificateIssued}
        />

        {/* 3. 4 Student Portal Modules Cards */}
        <div>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
            CBP Student Portal Modules
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {quickNavPortals.map((portal) => (
              <Link
                key={portal.title}
                href={portal.href}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm cbp-card-interactive flex items-start justify-between gap-4 group"
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-200 text-cyan-700 flex items-center justify-center text-xl shrink-0 group-hover:bg-cyan-600 group-hover:text-white group-hover:border-transparent transition-all">
                    {portal.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-bold text-slate-900 truncate">{portal.title}</h4>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${portal.badgeColor} shrink-0`}
                      >
                        {portal.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-snug">{portal.desc}</p>
                  </div>
                </div>
                <FiArrowRight className="text-slate-400 group-hover:text-cyan-600 group-hover:translate-x-0.5 transition shrink-0 mt-1" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
