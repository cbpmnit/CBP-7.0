"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import ProfileAvatar from "@/components/navbar/ProfileAvatar"
import {
  FiUser,
  FiGrid,
  FiCalendar,
  FiAward,
  FiCreditCard,
  FiBell,
  FiLogOut,
  FiChevronDown,
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
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const menuItems = [
    { label: "My Profile", href: "/profile", icon: <FiUser /> },
    { label: "Dashboard", href: "/dashboard", icon: <FiGrid /> },
    { label: "Attendance", href: "/attendance", icon: <FiCalendar /> },
    { label: "Certificates", href: "/certificate", icon: <FiAward /> },
    { label: "Payments", href: "/payment", icon: <FiCreditCard /> },
    { label: "Notifications", href: "/notifications", icon: <FiBell /> },
  ]

  return (
    <div className="relative" ref={dropdownRef}>
      {/* 40px Circular Avatar + Small Chevron Down Only */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 rounded-full p-0.5 hover:ring-2 hover:ring-cyan-600/30 transition duration-200"
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="User profile menu"
      >
        <ProfileAvatar name={displayName} size="md" />
        <FiChevronDown className={`text-slate-500 text-xs transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <ProfileAvatar name={displayName} size="sm" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 truncate">{displayName}</p>
                <p className="text-[11px] font-mono text-cyan-800 font-semibold truncate">{studentId || "CBP Student"}</p>
              </div>
            </div>
          </div>

          {/* Links */}
          <div className="py-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
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

          {/* Logout */}
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
