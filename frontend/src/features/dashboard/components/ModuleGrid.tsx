"use client"

import React from "react"
import Link from "next/link"
import {
  FiUsers,
  FiUserPlus,
  FiCalendar,
  FiCamera,
  FiCreditCard,
  FiAward,
  FiMail,
  FiArrowRight,
} from "react-icons/fi"

export function ModuleGrid() {
  const quickActions = [
    {
      title: "Students",
      desc: "Directory & dossiers",
      icon: <FiUsers />,
      href: "/admin/students",
      color: "text-blue-700 bg-blue-50 border-blue-200",
    },
    {
      title: "Volunteers",
      desc: "Roster & scopes",
      icon: <FiUserPlus />,
      href: "/admin/volunteers",
      color: "text-cyan-700 bg-cyan-50 border-cyan-200",
    },
    {
      title: "Sessions",
      desc: "Schedules & QRs",
      icon: <FiCalendar />,
      href: "/admin/sessions",
      color: "text-cyan-700 bg-cyan-50 border-cyan-200",
    },
    {
      title: "Attendance",
      desc: "Live gate logs",
      icon: <FiCamera />,
      href: "/admin/attendance",
      color: "text-blue-700 bg-blue-50 border-blue-200",
    },
    {
      title: "Payments",
      desc: "Reconciliation",
      icon: <FiCreditCard />,
      href: "/admin/payments",
      color: "text-emerald-700 bg-emerald-50 border-emerald-200",
    },
    {
      title: "Certificates",
      desc: "Batch issuance",
      icon: <FiAward />,
      href: "/admin/certificates",
      color: "text-purple-700 bg-purple-50 border-purple-200",
    },
    {
      title: "Email Templates",
      desc: "System notifications",
      icon: <FiMail />,
      href: "/admin/emails",
      color: "text-cyan-700 bg-cyan-50 border-cyan-200",
    },
  ]

  return (
    <div className="space-y-3">
      <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
        Quick Management
      </h2>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {quickActions.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:border-slate-300 hover:shadow-md transition flex items-center justify-between gap-3 group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`h-9 w-9 rounded-xl border flex items-center justify-center text-lg shrink-0 ${item.color}`}
              >
                {item.icon}
              </div>
              <div className="min-w-0">
                <h3 className="text-xs font-bold text-slate-900 truncate">{item.title}</h3>
                <p className="text-[11px] text-slate-500 truncate">{item.desc}</p>
              </div>
            </div>
            <FiArrowRight className="text-slate-300 group-hover:text-cyan-600 group-hover:translate-x-0.5 transition shrink-0" />
          </Link>
        ))}
      </div>
    </div>
  )
}

export default ModuleGrid
