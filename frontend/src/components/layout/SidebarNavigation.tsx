"use client"

import React, { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { FiGrid, FiUser, FiCamera, FiCreditCard, FiAward } from "react-icons/fi"
import { getAccessibleModules, renderModuleIcon } from "@/config/adminModules"

export interface NavItem {
  id: string
  label: string
  href: string
  icon: React.ReactNode
  permission?: string
}

export const STUDENT_NAV_ITEMS: NavItem[] = [
  { id: "overview", label: "Dashboard", href: "/dashboard", icon: <FiGrid /> },
  { id: "profile", label: "Profile", href: "/profile", icon: <FiUser /> },
  { id: "attendance", label: "Attendance & QR", href: "/attendance", icon: <FiCamera /> },
  { id: "payments", label: "Payments", href: "/payment", icon: <FiCreditCard /> },
  { id: "certificates", label: "Certificates", href: "/certificate", icon: <FiAward /> },
]

interface SidebarNavigationProps {
  allowedPermissions?: string[]
}

function SidebarNavContent({ allowedPermissions }: SidebarNavigationProps) {
  const pathname = usePathname()
  const [hideDock, setHideDock] = useState(false)
  const [userRole, setUserRole] = useState<string>("")
  const [userPermissions, setUserPermissions] = useState<string[]>([])

  useEffect(() => {
    if (typeof window !== "undefined") {
      const r = (localStorage.getItem("cbp-role") || "").toUpperCase()
      setUserRole(r)
      try {
        const raw = localStorage.getItem("cbp-permissions")
        const perms = raw ? JSON.parse(raw) : []
        setUserPermissions(allowedPermissions || perms)
      } catch {
        setUserPermissions(allowedPermissions || [])
      }
    }
  }, [allowedPermissions])

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

  const isStudent = userRole === "ROLE_STUDENT" || userRole === "STUDENT"
  const isAdmin = userRole === "ROLE_ADMIN" || userRole === "ADMIN"
  const isVolunteer = userRole === "ROLE_VOLUNTEER" || userRole === "VOLUNTEER"

  let navItems: NavItem[] = []
  if (isStudent) {
    navItems = STUDENT_NAV_ITEMS
  } else if (isAdmin || isVolunteer) {
    const dashboardHref = isAdmin ? "/admin/dashboard" : "/volunteer/dashboard"
    const modules = getAccessibleModules(userRole, userPermissions)
    
    navItems = [
      { id: "dashboard", label: "Dashboard", href: dashboardHref, icon: <FiGrid /> },
      ...modules.map((m) => ({
        id: m.id,
        label: m.title,
        href: m.route,
        icon: renderModuleIcon(m.iconName),
        permission: m.requiredPermission,
      })),
    ]
  }

  if (navItems.length === 0) {
    return null
  }

  return (
    <aside
      className={`hidden md:flex fixed left-4 top-1/2 -translate-y-1/2 z-40 transition-all duration-300 ${
        hideDock ? "opacity-0 pointer-events-none translate-x-[-16px]" : "opacity-100 translate-x-0"
      }`}
      aria-label="Floating Vertical Sidebar Dock"
    >
      <nav className="flex flex-col gap-1.5 p-2 bg-white/95 backdrop-blur-md border border-slate-200 rounded-2xl shadow-lg">
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/admin/dashboard" && item.href !== "/volunteer/dashboard" && pathname.startsWith(item.href))

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`group relative flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-cyan-600 text-white font-bold shadow-xs scale-105"
                  : "text-slate-500 hover:text-slate-900 hover:bg-slate-100/80"
              }`}
            >
              <span className="text-base">{item.icon}</span>

              <span className="absolute left-12 px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-xl border border-slate-800 whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-opacity duration-200 z-50">
                {item.label}
              </span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}

export function SidebarNavigation({ allowedPermissions }: SidebarNavigationProps) {
  return (
    <Suspense fallback={null}>
      <SidebarNavContent allowedPermissions={allowedPermissions} />
    </Suspense>
  )
}

export default SidebarNavigation
