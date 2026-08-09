"use client"

import React from "react"
import { MetricCard } from "@/components/ui/MetricCard"
import { AdminDashboardSummaryDto } from "@/features/dashboard/services/dashboardApi"
import {
  FiUsers,
  FiCreditCard,
  FiClock,
  FiCheckSquare,
  FiAward,
} from "react-icons/fi"

export interface DashboardMetricsProps {
  summary: AdminDashboardSummaryDto | null
  loading?: boolean
}

export function DashboardMetrics({ summary, loading = false }: DashboardMetricsProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-28 bg-slate-100/70 animate-pulse rounded-2xl border border-slate-200"
          />
        ))}
      </div>
    )
  }

  const registeredCount = summary?.registeredStudents || summary?.totalStudents || 0
  const paidCount = summary?.paidStudents || 0
  const pendingPaymentCount = Math.max(0, registeredCount - paidCount)

  const metrics = [
    {
      title: "Total Students",
      value: registeredCount,
      description: "Verified Student Registrations",
      icon: <FiUsers className="text-sm" />,
      iconColor: "blue" as const,
      href: "/admin/students",
    },
    {
      title: "Payment Completed",
      value: paidCount,
      description: "Fee Verified Accounts",
      icon: <FiCreditCard className="text-sm" />,
      iconColor: "emerald" as const,
      href: "/admin/payments",
    },
    {
      title: "Payment Pending",
      value: pendingPaymentCount,
      description: "Action Required Accounts",
      icon: <FiClock className="text-sm" />,
      iconColor: "amber" as const,
      href: "/admin/payments",
    },
    {
      title: "Attendance",
      value: summary?.todayAttendance ?? 0,
      description: "Auditorium Gate Check-ins",
      icon: <FiCheckSquare className="text-sm" />,
      iconColor: "cyan" as const,
      href: "/admin/attendance",
    },
    {
      title: "Certificates",
      value: summary?.certificatesIssued ?? 0,
      description: "75%+ Attendance Issued",
      icon: <FiAward className="text-sm" />,
      iconColor: "purple" as const,
      href: "/admin/certificates",
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {metrics.map((metric) => (
        <MetricCard
          key={metric.title}
          title={metric.title}
          value={metric.value}
          description={metric.description}
          icon={metric.icon}
          iconColor={metric.iconColor}
          href={metric.href}
        />
      ))}
    </div>
  )
}

export default DashboardMetrics
