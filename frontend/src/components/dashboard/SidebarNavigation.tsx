"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  FiGrid,
  FiUser,
  FiUsers,
  FiCamera,
  FiCreditCard,
  FiAward,
  FiMail,
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
  { id: "attendance", label: "Attendance & QR", href: "/attendance", icon: <FiCamera />, permission: "ATTENDANCE_VIEW" },
  { id: "payments", label: "Payments", href: "/payment", icon: <FiCreditCard />, permission: "PAYMENTS_VIEW" },
  { id: "certificates", label: "Certificates", href: "/certificate", icon: <FiAward />, permission: "CERTIFICATES_VIEW" },
  { id: "email-tools", label: "Email Tools", href: "/admin/notifications", icon: <FiMail />, permission: "EMAIL_TOOLS_VIEW" },
]

export const ADMIN_NAV_ITEMS: NavItem[] = [
  { id: "admin-dashboard", label: "Admin Dashboard", href: "/admin/dashboard", icon: <FiGrid /> },
  { id: "admin-students", label: "Student Directory", href: "/admin/students", icon: <FiUsers /> },
  { id: "admin-attendance", label: "Attendance & QR", href: "/attendance", icon: <FiCamera /> },
  { id: "admin-notifications", label: "Email Templates", href: "/admin/notifications", icon: <FiMail /> },
  { id: "admin-certificates", label: "Certificates", href: "/certificate", icon: <FiAward /> },
]

interface SidebarNavigationProps {
  allowedPermissions?: string[]
}

export default function SidebarNavigation({
  allowedPermissions,
}: SidebarNavigationProps) {
  const pathname = usePathname()
  const [hideDock, setHideDock] = useState(false)

  useEffect(() => {
    let lastScrollY = window.scrollY

    const handleScroll = () => {
      const currentScrollY = window.scrollY
      if (currentScrollY > lastScrollY && currentScrollY > 120) {
        setHideDock(true)
      } else {
        setHideDock(false)
      }
      lastScrollY = currentScrollY
    }

    const footerEl = document.querySelector("footer")
    let observer: IntersectionObserver | null = null

    if (footerEl) {
      observer = new IntersectionObserver(
        (entries) => {
          const isIntersecting = entries.some((entry) => entry.isIntersecting)
          if (isIntersecting) setHideDock(true)
        },
        { threshold: 0.1 }
      )
      observer.observe(footerEl)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", handleScroll)
      if (observer) observer.disconnect()
    }
  }, [])

  const isAdminPath = pathname.startsWith("/admin")
  const baseItems = isAdminPath ? ADMIN_NAV_ITEMS : STUDENT_NAV_ITEMS

  const visibleNavItems = baseItems.filter((item) => {
    if (item.id === "email-tools") {
      return allowedPermissions ? allowedPermissions.includes("EMAIL_TOOLS_VIEW") || allowedPermissions.includes("ADMIN_VIEW") : false
    }
    return !allowedPermissions || !item.permission || allowedPermissions.includes(item.permission)
  })

  return (
    <aside
      className={`hidden xl:flex flex-col bg-white/95 backdrop-blur-xl border border-slate-200 shadow-xl rounded-2xl p-2 fixed left-4 top-1/2 -translate-y-1/2 z-40 w-[64px] transition-all duration-300 ease-in-out ${
        hideDock ? "opacity-0 pointer-events-none -translate-x-full" : "opacity-100 translate-x-0"
      }`}
      aria-label="Student Floating Navigation Dock"
    >
      {/* Navigation Icons Dock */}
      <nav className="space-y-2 py-1">
        {visibleNavItems.map((item) => {
          const isActive = pathname === item.href || (pathname === "/" && item.href === "/dashboard")
          return (
            <div key={item.id} className="relative group flex justify-center">
              <Link
                href={item.href}
                className={`h-11 w-11 flex items-center justify-center rounded-xl text-base transition-all duration-200 hover:scale-105 ${
                  isActive
                    ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold shadow-md shadow-cyan-600/30"
                    : "text-slate-700 hover:bg-cyan-50 hover:text-cyan-700"
                }`}
                aria-label={item.label}
              >
                <span className="shrink-0 text-lg">{item.icon}</span>
              </Link>

              {/* Hover Tooltip */}
              <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 bg-slate-900 text-white text-[11px] font-semibold px-3 py-1.5 rounded-xl shadow-xl opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 whitespace-nowrap z-50">
                {item.label}
              </div>
            </div>
          )
        })}
      </nav>
    </aside>
  )
}
