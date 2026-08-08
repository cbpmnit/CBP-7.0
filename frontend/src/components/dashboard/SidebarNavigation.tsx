"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import {
  FiGrid,
  FiUser,
  FiCamera,
  FiCreditCard,
  FiAward,
  FiBell,
  FiMail,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi"

export interface NavItem {
  id: string
  label: string
  href: string
  icon: React.ReactNode
  permission?: string
}

export const STUDENT_NAV_ITEMS: NavItem[] = [
  { id: "overview", label: "Dashboard", href: "/dashboard", icon: <FiGrid />, permission: "DASHBOARD_VIEW" },
  { id: "profile", label: "Profile", href: "/profile", icon: <FiUser />, permission: "PROFILE_VIEW" },
  { id: "attendance", label: "Attendance", href: "/attendance", icon: <FiCamera />, permission: "ATTENDANCE_VIEW" },
  { id: "payments", label: "Payments", href: "/payment", icon: <FiCreditCard />, permission: "PAYMENTS_VIEW" },
  { id: "certificates", label: "Certificates", href: "/certificate", icon: <FiAward />, permission: "CERTIFICATES_VIEW" },
  { id: "notifications", label: "Notifications", href: "/notifications", icon: <FiBell />, permission: "NOTIFICATIONS_VIEW" },
]

export const ADMIN_NAV_ITEMS: NavItem[] = [
  { id: "email", label: "Email Tools", href: "/admin/notifications", icon: <FiMail />, permission: "EMAIL_TOOLS_VIEW" },
]

interface SidebarNavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
  collapsed?: boolean
  onToggleCollapse?: () => void
  allowedPermissions?: string[]
}

export default function SidebarNavigation({
  activeTab,
  onTabChange,
  collapsed: externalCollapsed,
  onToggleCollapse: externalOnToggle,
  allowedPermissions,
}: SidebarNavigationProps) {
  const [internalCollapsed, setInternalCollapsed] = useState(false)
  const [hideDock, setHideDock] = useState(false)

  const isCollapsed = externalCollapsed !== undefined ? externalCollapsed : internalCollapsed
  const toggleCollapse = externalOnToggle || (() => setInternalCollapsed(!internalCollapsed))

  // Footer IntersectionObserver to prevent dock and footer overlap
  useEffect(() => {
    const footerEl = document.querySelector("footer")
    if (!footerEl) return

    const observer = new IntersectionObserver(
      (entries) => {
        const isIntersecting = entries.some((entry) => entry.isIntersecting)
        setHideDock(isIntersecting)
      },
      { threshold: 0.1 }
    )

    observer.observe(footerEl)
    return () => observer.disconnect()
  }, [])

  // Filter items dynamically based on RBAC permissions
  const allPossibleItems = allowedPermissions
    ? [...STUDENT_NAV_ITEMS, ...ADMIN_NAV_ITEMS]
    : STUDENT_NAV_ITEMS

  const visibleNavItems = allowedPermissions
    ? allPossibleItems.filter((item) => !item.permission || allowedPermissions.includes(item.permission))
    : STUDENT_NAV_ITEMS

  return (
    <div>
      {/* Semicircular Floating Navigation Dock for Desktop */}
      <aside
        className={`hidden lg:flex flex-col bg-white/95 backdrop-blur-xl border border-slate-200/80 shadow-2xl rounded-r-[32px] rounded-l-2xl p-2 fixed left-3 top-1/2 -translate-y-1/2 z-40 overflow-hidden transition-all duration-300 ${
          isCollapsed ? "w-[70px]" : "w-[210px]"
        } ${
          hideDock ? "opacity-0 pointer-events-none -translate-x-full" : "opacity-100 translate-x-0"
        }`}
      >
        {/* Dock Toggle Control */}
        <div className="flex items-center justify-end pb-1.5 mb-1 border-b border-slate-100 px-1">
          <button
            onClick={toggleCollapse}
            className="p-1 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition"
            title={isCollapsed ? "Expand Dock" : "Collapse Dock"}
          >
            {isCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
          </button>
        </div>

        {/* Dynamic Navigation Pills */}
        <nav className="space-y-1">
          {visibleNavItems.map((item) => {
            const isActive = activeTab === item.id
            return (
              <div key={item.id} className="relative group">
                <button
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center ${
                    isCollapsed ? "justify-center px-0" : "gap-3 px-3"
                  } py-2.5 rounded-2xl text-xs font-semibold transition-all duration-200 text-left ${
                    isActive
                      ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold shadow-md shadow-cyan-600/20 scale-[1.02]"
                      : "text-slate-700 hover:bg-cyan-50/70 hover:text-cyan-700"
                  }`}
                >
                  <span className="text-base shrink-0 transition-transform duration-200 group-hover:scale-110">
                    {item.icon}
                  </span>
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </button>

                {/* Hover Tooltip when Collapsed */}
                {isCollapsed && (
                  <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-slate-900 text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </div>
            )
          })}
        </nav>
      </aside>

      {/* Mobile Quick Action Buttons Grid */}
      <div className="block lg:hidden grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        <Link
          href="/attendance"
          className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-slate-300 transition text-left flex items-center gap-3"
        >
          <div className="h-8 w-8 shrink-0 flex items-center justify-center rounded-lg bg-cyan-50 text-cyan-700 text-base">
            <FiCamera />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-slate-900 truncate">Attendance</h4>
            <p className="text-[10px] text-slate-500 truncate">Session QR</p>
          </div>
        </Link>

        <Link
          href="/certificate"
          className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-slate-300 transition text-left flex items-center gap-3"
        >
          <div className="h-8 w-8 shrink-0 flex items-center justify-center rounded-lg bg-purple-50 text-purple-700 text-base">
            <FiAward />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-slate-900 truncate">Certificates</h4>
            <p className="text-[10px] text-slate-500 truncate">Download PDF</p>
          </div>
        </Link>

        <Link
          href="/payment"
          className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-slate-300 transition text-left flex items-center gap-3"
        >
          <div className="h-8 w-8 shrink-0 flex items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 text-base">
            <FiCreditCard />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-slate-900 truncate">Payments</h4>
            <p className="text-[10px] text-slate-500 truncate">Receipt &amp; status</p>
          </div>
        </Link>

        <Link
          href="/profile"
          className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-slate-300 transition text-left flex items-center gap-3"
        >
          <div className="h-8 w-8 shrink-0 flex items-center justify-center rounded-lg bg-blue-50 text-blue-700 text-base">
            <FiUser />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-slate-900 truncate">Profile</h4>
            <p className="text-[10px] text-slate-500 truncate">Personal details</p>
          </div>
        </Link>

        <Link
          href="/notifications"
          className="p-3.5 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-slate-300 transition text-left flex items-center gap-3"
        >
          <div className="h-8 w-8 shrink-0 flex items-center justify-center rounded-lg bg-amber-50 text-amber-700 text-base">
            <FiBell />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-slate-900 truncate">Notifications</h4>
            <p className="text-[10px] text-slate-500 truncate">Alerts &amp; updates</p>
          </div>
        </Link>
      </div>
    </div>
  )
}
