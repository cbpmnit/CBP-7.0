"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { adminService, AdminDashboardSummaryDto } from "@/services/adminService"
import {
  FiUsers,
  FiUserCheck,
  FiCreditCard,
  FiClock,
  FiCheckSquare,
  FiAward,
  FiRefreshCw,
  FiAlertCircle,
  FiCalendar,
  FiCamera,
  FiMail,
  FiArrowRight,
  FiUserPlus,
} from "react-icons/fi"

interface AdminDashboardOverviewProps {
  onNavigateTab?: (tab: string) => void
}

export default function AdminDashboardOverview({ onNavigateTab }: AdminDashboardOverviewProps) {
  const [summary, setSummary] = useState<AdminDashboardSummaryDto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSummaryData()
  }, [])

  const fetchSummaryData = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await adminService.getDashboardSummary()
      setSummary(data)
    } catch (err: any) {
      if (err?.status === 403) {
        setError("You do not have permission to access administrative overview.")
      } else {
        setError("Failed to load admin summary statistics. Please retry.")
      }
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-100 rounded-2xl border border-slate-200" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FiAlertCircle className="text-xl text-amber-700 shrink-0" />
          <span className="text-xs font-semibold">{error}</span>
        </div>
        <button
          onClick={fetchSummaryData}
          className="inline-flex items-center gap-1 text-xs font-bold underline hover:text-amber-900"
        >
          <FiRefreshCw /> Retry
        </button>
      </div>
    )
  }

  const registeredCount = summary?.registeredStudents || summary?.totalStudents || 0
  const paidCount = summary?.paidStudents || 0
  const pendingPaymentCount = Math.max(0, registeredCount - paidCount)

  const statCards = [
    {
      title: "Total Registered Students",
      value: registeredCount,
      subtext: "Verified Academic Dossiers",
      icon: <FiUserCheck className="text-blue-700" />,
      bgIcon: "bg-blue-50 border-blue-200",
      accent: "text-blue-700",
      tab: "students",
    },
    {
      title: "Payment Completed",
      value: paidCount,
      subtext: "Fee Verified Accounts",
      icon: <FiCreditCard className="text-emerald-700" />,
      bgIcon: "bg-emerald-50 border-emerald-200",
      accent: "text-emerald-700",
      tab: "payments",
    },
    {
      title: "Payment Pending",
      value: pendingPaymentCount,
      subtext: "Action Required Accounts",
      icon: <FiClock className="text-amber-700" />,
      bgIcon: "bg-amber-50 border-amber-200",
      accent: "text-amber-700",
      tab: "payments",
    },
    {
      title: "Today's Attendance",
      value: summary?.todayAttendance ?? 0,
      subtext: "Auditorium Gate Check-ins",
      icon: <FiCheckSquare className="text-cyan-700" />,
      bgIcon: "bg-cyan-50 border-cyan-200",
      accent: "text-cyan-700",
      tab: "attendance",
    },
    {
      title: "Certificates Issued",
      value: summary?.certificatesIssued ?? 0,
      subtext: "75%+ Attendance Credentials",
      icon: <FiAward className="text-purple-700" />,
      bgIcon: "bg-purple-50 border-purple-200",
      accent: "text-purple-700",
      tab: "certificates",
    },
  ]

  const actionCards = [
    {
      title: "Student Management",
      description: "Search, filter, view profiles, and manage student registration dossiers.",
      icon: <FiUsers className="text-blue-700 text-lg" />,
      iconBg: "bg-blue-50 border-blue-200",
      ctaText: "Open Student Directory",
      isPrimary: true,
      onClick: () => onNavigateTab && onNavigateTab("students"),
    },
    {
      title: "Volunteer Management",
      description: "Send 24-hour invitation links to student volunteers and assign scanner access.",
      icon: <FiUserPlus className="text-cyan-700 text-lg" />,
      iconBg: "bg-cyan-50 border-cyan-200",
      ctaText: "Manage Volunteers",
      isPrimary: false,
      href: "/admin/volunteers",
    },
    {
      title: "Session Management",
      description: "Schedule workshop days, configure session venues, and set start/end timings.",
      icon: <FiCalendar className="text-cyan-700 text-lg" />,
      iconBg: "bg-cyan-50 border-cyan-200",
      ctaText: "Manage Sessions",
      isPrimary: false,
      onClick: () => onNavigateTab && onNavigateTab("sessions"),
    },
    {
      title: "Attendance Management",
      description: "Generate unique student passcodes and monitor live auditorium gate scanner logs.",
      icon: <FiCamera className="text-blue-700 text-lg" />,
      iconBg: "bg-blue-50 border-blue-200",
      ctaText: "Session Passes & Gate",
      isPrimary: false,
      onClick: () => onNavigateTab && onNavigateTab("attendance"),
    },
    {
      title: "Payment Management",
      description: "Inspect PhonePe transaction IDs, fee reconciliation, and payment status logs.",
      icon: <FiCreditCard className="text-emerald-700 text-lg" />,
      iconBg: "bg-emerald-50 border-emerald-200",
      ctaText: "Review Payments",
      isPrimary: false,
      onClick: () => onNavigateTab && onNavigateTab("payments"),
    },
    {
      title: "Certificates",
      description: "Issue cryptographic completion credentials to students meeting 75% attendance.",
      icon: <FiAward className="text-purple-700 text-lg" />,
      iconBg: "bg-purple-50 border-purple-200",
      ctaText: "Process Certificates",
      isPrimary: false,
      onClick: () => onNavigateTab && onNavigateTab("certificates"),
    },
  ]

  return (
    <div className="space-y-6">
      {/* 1. Metric Overview Summary Cards (Exact 5 Requested Live KPI Metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card) => (
          <div
            key={card.title}
            onClick={() => onNavigateTab && onNavigateTab(card.tab)}
            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-cyan-300 hover:shadow-md transition cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{card.title}</p>
                <h3 className={`text-2xl font-extrabold mt-1 ${card.accent}`}>{card.value}</h3>
              </div>
              <div className={`h-10 w-10 rounded-xl border flex items-center justify-center text-lg shrink-0 ${card.bgIcon}`}>
                {card.icon}
              </div>
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-3 border-t border-slate-100 pt-2">
              {card.subtext}
            </p>
          </div>
        ))}
      </div>

      {/* 2. Operations Quick Launch Panel */}
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Administrative Operations & Modules
          </h2>
          <span className="text-[11px] text-slate-400 font-medium">CBP 7.0 Management Suite</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {actionCards.map((action, idx) => (
            <div
              key={idx}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-slate-300 transition flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`h-9 w-9 rounded-xl border flex items-center justify-center shrink-0 ${action.iconBg}`}>
                    {action.icon}
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900">{action.title}</h3>
                    <span className="text-[10px] font-medium text-cyan-800 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
                      Module
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mt-1">{action.description}</p>
              </div>

              {action.href ? (
                <Link
                  href={action.href}
                  className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition inline-flex items-center justify-center gap-1.5 shadow-sm ${
                    action.isPrimary
                      ? "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-cyan-600/20"
                      : "bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200"
                  }`}
                >
                  <span>{action.ctaText}</span>
                  <FiArrowRight />
                </Link>
              ) : (
                <button
                  onClick={action.onClick}
                  className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition inline-flex items-center justify-center gap-1.5 shadow-sm ${
                    action.isPrimary
                      ? "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white shadow-cyan-600/20"
                      : "bg-cyan-50 hover:bg-cyan-100 text-cyan-800 border border-cyan-200"
                  }`}
                >
                  <span>{action.ctaText}</span>
                  <FiArrowRight />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
