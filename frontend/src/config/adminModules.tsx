import React from "react"
import {
  FiUsers,
  FiUserCheck,
  FiCalendar,
  FiCamera,
  FiCreditCard,
  FiAward,
  FiMail,
  FiSliders,
  FiActivity,
  FiMaximize,
} from "react-icons/fi"
import { AdminDashboardSummaryDto } from "@/features/dashboard/services/dashboardApi"

export interface AdminModuleConfig {
  id: string
  title: string
  description: string
  iconName:
    | "FiUsers"
    | "FiUserCheck"
    | "FiCalendar"
    | "FiCamera"
    | "FiCreditCard"
    | "FiAward"
    | "FiMail"
    | "FiSliders"
    | "FiActivity"
    | "FiMaximize"
  route: string
  requiredPermission?: string
  adminOnly?: boolean
  badgeKey?: keyof AdminDashboardSummaryDto
  defaultStatusText: string
  color: string
}

export const ADMIN_MODULES: AdminModuleConfig[] = [
  {
    id: "students",
    title: "Students",
    description: "Directory & dossiers",
    iconName: "FiUsers",
    route: "/admin/students",
    requiredPermission: "STUDENT_VIEW",
    badgeKey: "registeredStudents",
    defaultStatusText: "Registered Students",
    color: "text-blue-700 bg-blue-50 border-blue-200",
  },
  {
    id: "volunteers",
    title: "Volunteers",
    description: "Roster & scopes",
    iconName: "FiUserCheck",
    route: "/admin/volunteers",
    requiredPermission: "VOLUNTEER_MANAGE",
    adminOnly: true,
    defaultStatusText: "Management",
    color: "text-cyan-700 bg-cyan-50 border-cyan-200",
  },
  {
    id: "sessions",
    title: "Sessions",
    description: "Schedules & QRs",
    iconName: "FiCalendar",
    route: "/admin/sessions",
    requiredPermission: "SESSION_VIEW",
    defaultStatusText: "Sessions Configured",
    color: "text-indigo-700 bg-indigo-50 border-indigo-200",
  },
  {
    id: "attendance",
    title: "Attendance",
    description: "Live gate logs",
    iconName: "FiCamera",
    route: "/admin/attendance",
    requiredPermission: "ATTENDANCE_VIEW",
    badgeKey: "todayAttendance",
    defaultStatusText: "Check-ins Today",
    color: "text-teal-700 bg-teal-50 border-teal-200",
  },
  {
    id: "scanner",
    title: "QR Scanner",
    description: "Gate scanner app",
    iconName: "FiMaximize",
    route: "/volunteer/scanner",
    requiredPermission: "ATTENDANCE_SCAN",
    defaultStatusText: "Live Scanner",
    color: "text-emerald-700 bg-emerald-50 border-emerald-200",
  },
  {
    id: "payments",
    title: "Payments",
    description: "Reconciliation",
    iconName: "FiCreditCard",
    route: "/admin/payments",
    requiredPermission: "PAYMENT_VIEW",
    badgeKey: "paidStudents",
    defaultStatusText: "Successful Payments",
    color: "text-emerald-700 bg-emerald-50 border-emerald-200",
  },
  {
    id: "certificates",
    title: "Certificates",
    description: "Batch issuance",
    iconName: "FiAward",
    route: "/admin/certificates",
    requiredPermission: "CERTIFICATE_VIEW",
    badgeKey: "certificatesIssued",
    defaultStatusText: "Issued",
    color: "text-purple-700 bg-purple-50 border-purple-200",
  },
  {
    id: "emails",
    title: "Email Operations",
    description: "Templates & delivery",
    iconName: "FiMail",
    route: "/admin/emails",
    requiredPermission: "EMAIL_SEND",
    defaultStatusText: "Templates & Broadcasts",
    color: "text-cyan-700 bg-cyan-50 border-cyan-200",
  },
  {
    id: "operations",
    title: "System Operations",
    description: "QR pass generation",
    iconName: "FiSliders",
    route: "/admin/operations",
    requiredPermission: "ADMIN_ONLY",
    adminOnly: true,
    defaultStatusText: "Action Center",
    color: "text-amber-700 bg-amber-50 border-amber-200",
  },
  {
    id: "monitoring",
    title: "System Health",
    description: "Diagnostics & metrics",
    iconName: "FiActivity",
    route: "/admin/monitoring",
    requiredPermission: "ADMIN_ONLY",
    adminOnly: true,
    defaultStatusText: "Platform Health",
    color: "text-slate-700 bg-slate-100 border-slate-200",
  },
]

export function renderModuleIcon(iconName: AdminModuleConfig["iconName"]): React.ReactNode {
  switch (iconName) {
    case "FiUsers":
      return <FiUsers />
    case "FiUserCheck":
      return <FiUserCheck />
    case "FiCalendar":
      return <FiCalendar />
    case "FiCamera":
      return <FiCamera />
    case "FiMaximize":
      return <FiMaximize />
    case "FiCreditCard":
      return <FiCreditCard />
    case "FiAward":
      return <FiAward />
    case "FiMail":
      return <FiMail />
    case "FiSliders":
      return <FiSliders />
    case "FiActivity":
      return <FiActivity />
    default:
      return <FiSliders />
  }
}

export function getAccessibleModules(
  role: string,
  userPermissions: string[] = []
): AdminModuleConfig[] {
  const normalizedRole = (role || "").toUpperCase()
  const isAdmin = normalizedRole === "ROLE_ADMIN" || normalizedRole === "ADMIN"
  const isVolunteer = normalizedRole === "ROLE_VOLUNTEER" || normalizedRole === "VOLUNTEER"

  if (isAdmin) {
    return ADMIN_MODULES
  }

  if (isVolunteer) {
    return ADMIN_MODULES.filter((module) => {
      if (module.adminOnly) return false
      if (!module.requiredPermission) return true
      return userPermissions.includes(module.requiredPermission)
    })
  }

  return []
}
