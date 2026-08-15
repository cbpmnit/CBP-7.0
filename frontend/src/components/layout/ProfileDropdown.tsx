"use client"

import React, { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ProfileAvatar } from "@/components/ui/ProfileAvatar"
import { FiUser, FiShield, FiSettings, FiLogOut, FiSliders } from "react-icons/fi"
import { getAccessibleModules, renderModuleIcon } from "@/config/adminModules"

interface ProfileDropdownProps {
  name: string | null
  studentId: string | null
  role: string | null
  onLogout: () => void
}

export function ProfileDropdown({
  name,
  studentId,
  role,
  onLogout,
}: ProfileDropdownProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const dropdownRef = useRef<HTMLDivElement>(null)

  const displayName = name && name.trim() !== "" ? name : "User"

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false)
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [])

  const normalizedRole = (role || "").toUpperCase()
  const isAdmin = normalizedRole === "ROLE_ADMIN" || normalizedRole === "ADMIN"
  const isVolunteer = normalizedRole === "ROLE_VOLUNTEER" || normalizedRole === "VOLUNTEER"

  let userPermissions: string[] = []
  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("cbp-permissions")
      userPermissions = raw ? JSON.parse(raw) : []
    } catch {
      userPermissions = []
    }
  }

  let menuItems: Array<{ label: string; href: string; icon: React.ReactNode }> = []

  if (isAdmin) {
    menuItems = [
      { label: "Dashboard", href: "/admin/dashboard", icon: <FiSettings /> },
      { label: "Account Settings", href: "/account/settings", icon: <FiShield /> },
      { label: "Student Directory", href: "/admin/students", icon: <FiUser /> },
      { label: "Volunteers", href: "/admin/volunteers", icon: <FiUser /> },
      { label: "Operations", href: "/admin/operations", icon: <FiSliders /> },
    ]
  } else if (isVolunteer) {
    const accessible = getAccessibleModules("VOLUNTEER", userPermissions)
    menuItems = [
      { label: "Dashboard", href: "/volunteer/dashboard", icon: <FiSettings /> },
      ...accessible.map((m) => ({
        label: m.title,
        href: m.route,
        icon: renderModuleIcon(m.iconName),
      })),
      { label: "Account Settings", href: "/account/settings", icon: <FiShield /> },
    ]
  } else {
    menuItems = [
      { label: "Dashboard", href: "/dashboard", icon: <FiSettings /> },
      { label: "My Profile", href: "/profile", icon: <FiUser /> },
      { label: "Account Settings", href: "/account/settings", icon: <FiShield /> },
    ]
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="rounded-full p-0.5 transition duration-200 hover:ring-2 hover:ring-cyan-600/40 focus:outline-none shrink-0"
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="Profile menu options"
      >
        <ProfileAvatar name={displayName} size="md" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2.5 w-60 rounded-2xl bg-white border border-slate-200 shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <ProfileAvatar name={displayName} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 truncate">{displayName}</p>
                <p className="text-[11px] font-mono text-cyan-800 font-semibold truncate">
                  {studentId ? `ID: ${studentId}` : role ? role.replace("ROLE_", "") : "CBP 7.0"}
                </p>
              </div>
            </div>
          </div>

          <div className="py-1 max-h-64 overflow-y-auto">
            {menuItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-2.5 px-4 py-2 text-xs font-semibold transition ${
                    isActive
                      ? "bg-cyan-50 text-cyan-800 font-bold border-l-2 border-cyan-600"
                      : "text-slate-700 hover:bg-slate-50 hover:text-cyan-700"
                  }`}
                >
                  <span className="text-slate-400 text-sm">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>

          <div className="border-t border-slate-100 my-1" />

          <button
            onClick={() => {
              setOpen(false)
              onLogout()
            }}
            className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition text-left"
          >
            <FiLogOut className="text-sm" />
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  )
}

export default ProfileDropdown
