"use client"

import React from "react"
import { ModuleCard } from "@/components/ui/ModuleCard"
import {
  FiUsers,
  FiUserPlus,
  FiCalendar,
  FiCamera,
  FiCreditCard,
  FiAward,
  FiMail,
} from "react-icons/fi"

export function ModuleGrid() {
  const modules = [
    {
      title: "Student Management",
      description: "Search, filter, view academic profiles, and manage student registration dossiers.",
      icon: <FiUsers className="text-base" />,
      iconColor: "blue" as const,
      href: "/admin/students",
      ctaText: "Manage Students",
    },
    {
      title: "Volunteer Management",
      description: "Invite student volunteers, assign permission scopes, and manage active scanner passes.",
      icon: <FiUserPlus className="text-base" />,
      iconColor: "cyan" as const,
      href: "/admin/volunteers",
      ctaText: "Manage Volunteers",
    },
    {
      title: "Session Management",
      description: "Schedule workshop days, configure session venues, and manage day attendance windows.",
      icon: <FiCalendar className="text-base" />,
      iconColor: "cyan" as const,
      href: "/admin/sessions",
      ctaText: "Manage Sessions",
    },
    {
      title: "Attendance Management",
      description: "Monitor live auditorium gate check-in logs, generate student passes, and track stats.",
      icon: <FiCamera className="text-base" />,
      iconColor: "blue" as const,
      href: "/admin/attendance",
      ctaText: "Manage Attendance",
    },
    {
      title: "Payment Management",
      description: "Inspect PhonePe transaction IDs, fee reconciliation status, and payment logs.",
      icon: <FiCreditCard className="text-base" />,
      iconColor: "emerald" as const,
      href: "/admin/payments",
      ctaText: "Manage Payments",
    },
    {
      title: "Certificate Management",
      description: "Issue tamper-proof certificates for students satisfying the 75%+ attendance threshold.",
      icon: <FiAward className="text-base" />,
      iconColor: "purple" as const,
      href: "/admin/certificates",
      ctaText: "Manage Certificates",
    },
    {
      title: "Email Management",
      description: "Configure automated email templates for QR passes, payment receipts, and certificates.",
      icon: <FiMail className="text-base" />,
      iconColor: "cyan" as const,
      href: "/admin/emails",
      ctaText: "Manage Emails",
    },
  ]

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-800">
          Administrative Operations &amp; Modules
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Access all administrative capabilities and platform operations
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {modules.map((mod) => (
          <ModuleCard
            key={mod.title}
            title={mod.title}
            description={mod.description}
            icon={mod.icon}
            iconColor={mod.iconColor}
            href={mod.href}
            ctaText={mod.ctaText}
          />
        ))}
      </div>
    </div>
  )
}

export default ModuleGrid
