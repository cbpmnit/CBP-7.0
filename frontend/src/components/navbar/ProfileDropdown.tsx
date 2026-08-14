"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import ProfileAvatar from "@/components/navbar/ProfileAvatar"
import {
  FiUser,
  FiShield,
  FiSettings,
  FiLogOut,
} from "react-icons/fi"

interface ProfileDropdownProps {
  name: string | null
  studentId: string | null
  role: string | null
  onLogout: () => void
}

export default function ProfileDropdown({
  name,
  studentId,
  role,
  onLogout,
}: ProfileDropdownProps) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const dropdownRef = useRef<HTMLDivElement>(null)

  const displayName = name && name.trim() !== "" ? name : "Student"

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

  let menuItems = [
    { label: "Profile", href: "/profile", icon: <FiUser /> },
    { label: "Account Settings", href: "/account/settings", icon: <FiShield /> },
    { label: "Dashboard", href: "/dashboard", icon: <FiSettings /> },
  ]

  if (normalizedRole === "ROLE_ADMIN" || normalizedRole === "ADMIN") {
    menuItems = [
      { label: "Admin Dashboard", href: "/admin/dashboard", icon: <FiSettings /> },
      { label: "Account Settings", href: "/account/settings", icon: <FiShield /> },
      { label: "Student Directory", href: "/admin/students", icon: <FiUser /> },
      { label: "Volunteers", href: "/admin/volunteers", icon: <FiUser /> },
    ]
  } else if (normalizedRole === "ROLE_VOLUNTEER" || normalizedRole === "VOLUNTEER") {
    menuItems = [
      { label: "Volunteer Dashboard", href: "/volunteer/dashboard", icon: <FiSettings /> },
      { label: "Account Settings", href: "/account/settings", icon: <FiShield /> },
      { label: "My Profile", href: "/volunteer/profile", icon: <FiUser /> },
      { label: "Attendance Scanner", href: "/volunteer/scanner", icon: <FiSettings /> },
    ]
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Clean Circular Avatar Only Button (NO Border Box Wrapper) */}
      <button
        onClick={() => setOpen(!open)}
        className="rounded-full p-0.5 transition duration-200 hover:ring-2 hover:ring-cyan-600/40 focus:outline-none shrink-0"
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="Student profile options"
      >
        <ProfileAvatar name={displayName} size="md" />
      </button>

      {/* Floating Profile Dropdown Menu */}
      {open && (
        <div className="absolute right-0 mt-2.5 w-56 rounded-2xl bg-white border border-slate-200 shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <ProfileAvatar name={displayName} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 truncate">{displayName}</p>
                <p className="text-[11px] font-mono text-cyan-800 font-semibold truncate">
                  Student ID: {studentId || "CBP 7.0"}
                </p>
              </div>
            </div>
          </div>

          {/* Direct Menu Links */}
          <div className="py-1">
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

          {/* Divider */}
          <div className="border-t border-slate-100 my-1" />

          {/* Logout Action */}
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
