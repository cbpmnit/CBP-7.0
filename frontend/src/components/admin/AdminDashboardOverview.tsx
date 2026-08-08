"use client"

import { useState, useEffect } from "react"
import { adminService, AdminDashboardSummaryDto } from "@/services/adminService"
import {
  FiUsers,
  FiUserCheck,
  FiCreditCard,
  FiCheckSquare,
  FiAward,
  FiRefreshCw,
  FiAlertCircle,
  FiCalendar,
  FiCamera,
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

  const statCards = [
    {
      title: "Total Students",
      value: summary?.totalStudents ?? 0,
      subtext: "Portal Enrollments",
      icon: <FiUsers className="text-blue-600" />,
      bgIcon: "bg-blue-50 border-blue-200",
      accent: "text-blue-700",
      tab: "students",
    },
    {
      title: "Registered Students",
      value: summary?.registeredStudents ?? 0,
      subtext: "CBP Verified Entries",
      icon: <FiUserCheck className="text-indigo-600" />,
      bgIcon: "bg-indigo-50 border-indigo-200",
      accent: "text-indigo-700",
      tab: "students",
    },
    {
      title: "Payment Completed",
      value: summary?.paidStudents ?? 0,
      subtext: "PhonePe Fee Verified",
      icon: <FiCreditCard className="text-emerald-600" />,
      bgIcon: "bg-emerald-50 border-emerald-200",
      accent: "text-emerald-700",
      tab: "payments",
    },
    {
      title: "Today's Attendance",
      value: summary?.todayAttendance ?? 0,
      subtext: "Scanned Session Logs",
      icon: <FiCheckSquare className="text-cyan-600" />,
      bgIcon: "bg-cyan-50 border-cyan-200",
      accent: "text-cyan-700",
      tab: "attendance",
    },
    {
      title: "Certificates Issued",
      value: summary?.certificatesIssued ?? 0,
      subtext: "75%+ Attendance Credentials",
      icon: <FiAward className="text-purple-600" />,
      bgIcon: "bg-purple-50 border-purple-200",
      accent: "text-purple-700",
      tab: "certificates",
    },
  ]

  return (
    <div className="space-y-6">
      {/* 1. Metric Overview Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {statCards.map((card) => (
          <div
            key={card.title}
            onClick={() => onNavigateTab && onNavigateTab(card.tab)}
            className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition cursor-pointer flex flex-col justify-between"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{card.title}</p>
                <h3 className={`text-2xl font-extrabold mt-1 ${card.accent}`}>{card.value}</h3>
              </div>
              <div className={`h-10 w-10 rounded-xl border flex items-center justify-center text-xl shrink-0 ${card.bgIcon}`}>
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-9 w-9 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-700 flex items-center justify-center text-lg">
              <FiCalendar />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-slate-900">Session Operations</h4>
              <p className="text-[11px] text-slate-500">Create & publish workshop days</p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab && onNavigateTab("sessions")}
            className="w-full mt-2 py-2 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition"
          >
            Manage Sessions →
          </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-9 w-9 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center text-lg">
              <FiCamera />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-slate-900">Gate Session QR</h4>
              <p className="text-[11px] text-slate-500">Generate auditorium scanner QR</p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab && onNavigateTab("sessions")}
            className="w-full mt-2 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition"
          >
            Generate Session QR →
          </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-9 w-9 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center text-lg">
              <FiAward />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-slate-900">Batch Certificates</h4>
              <p className="text-[11px] text-slate-500">Issue credentials for 75%+ attendance</p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab && onNavigateTab("certificates")}
            className="w-full mt-2 py-2 px-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition"
          >
            Process Certificates →
          </button>
        </div>
      </div>
    </div>
  )
}
