"use client"

import { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  FiGrid,
  FiUser,
  FiUsers,
  FiUserCheck,
  FiCalendar,
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
]

export const ADMIN_NAV_ITEMS: NavItem[] = [
  { id: "admin-dashboard", label: "Dashboard", href: "/admin/dashboard", icon: <FiGrid /> },
  { id: "admin-students", label: "Student Management", href: "/admin/students", icon: <FiUsers /> },
  { id: "admin-volunteers", label: "Volunteer Management", href: "/admin/volunteers", icon: <FiUserCheck /> },
  { id: "admin-sessions", label: "Session Management", href: "/admin/sessions", icon: <FiCalendar /> },
  { id: "admin-attendance", label: "Attendance Management", href: "/admin/attendance", icon: <FiCamera /> },
  { id: "admin-payments", label: "Payment Management", href: "/admin/payments", icon: <FiCreditCard /> },
  { id: "admin-certificates", label: "Certificate Management", href: "/admin/certificates", icon: <FiAward /> },
  { id: "admin-emails", label: "Email Management", href: "/admin/emails", icon: <FiMail /> },
]

export const VOLUNTEER_NAV_ITEMS: NavItem[] = [
  { id: "volunteer-scanner", label: "Attendance Scanner", href: "/volunteer/scanner", icon: <FiCamera />, permission: "ATTENDANCE_SCAN" },
  { id: "volunteer-students", label: "Student Directory", href: "/admin/students", icon: <FiUsers />, permission: "STUDENT_VIEW" },
  { id: "volunteer-profile", label: "Volunteer Profile", href: "/volunteer/profile", icon: <FiUser /> },
]

interface SidebarNavigationProps {
  allowedPermissions?: string[]
}

function SidebarNavContent({ allowedPermissions }: SidebarNavigationProps) {
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
  const isVolunteerPath = pathname.startsWith("/volunteer")

  const baseItems = isAdminPath
    ? ADMIN_NAV_ITEMS
    : isVolunteerPath
    ? VOLUNTEER_NAV_ITEMS
    : STUDENT_NAV_ITEMS

  const visibleNavItems = baseItems.filter((item) => {
    return !allowedPermissions || !item.permission || allowedPermissions.includes(item.permission)
  })

  return (
    <aside
      className={`hidden xl:flex flex-col bg-white/95 backdrop-blur-xl border border-slate-200 shadow-xl rounded-2xl p-2 fixed left-4 top-1/2 -translate-y-1/2 z-40 w-[64px] transition-all duration-300 ease-in-out ${
        hideDock ? "opacity-0 pointer-events-none -translate-x-full" : "opacity-100 translate-x-0"
      }`}
      aria-label="Floating Navigation Dock"
    >
      <nav className="space-y-2 py-1">
        {visibleNavItems.map((item) => {
          const isActive = (() => {
            if (item.href === "/admin/dashboard") {
              return pathname === "/admin" || pathname === "/admin/dashboard"
            }
            if (item.href === "/dashboard") {
              return pathname === "/dashboard" || pathname === "/"
            }
            return pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/admin")
          })()

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

export default function SidebarNavigation(props: SidebarNavigationProps) {
  return (
    <Suspense fallback={null}>
      <SidebarNavContent {...props} />
    </Suspense>
  )
}
