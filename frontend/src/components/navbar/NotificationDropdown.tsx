"use client"

import { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
import Link from "next/link"
import { FiBell, FiCheckCircle, FiCreditCard, FiAward, FiCheck, FiX } from "react-icons/fi"
import { useAppSelector } from "@/store/hooks"

interface NotificationItem {
  id: string
  title: string
  desc: string
  time: string
  read: boolean
  type: "payment" | "registration" | "attendance" | "certificate"
  roles: ("ADMIN" | "VOLUNTEER" | "STUDENT")[]
}

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const { role } = useAppSelector((state) => state.auth)
  const normalizedRole = (role || "").toUpperCase().replace("ROLE_", "") || "STUDENT"

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    // Student Notifications
    {
      id: "stud-1",
      title: "Payment Confirmed",
      desc: "Registration fee payment verified successfully.",
      time: "2h ago",
      read: false,
      type: "payment",
      roles: ["STUDENT"],
    },
    {
      id: "stud-2",
      title: "Registration Successful",
      desc: "Enrolled in soft skills training workshops at MNIT Jaipur.",
      time: "1d ago",
      read: false,
      type: "registration",
      roles: ["STUDENT"],
    },
    {
      id: "stud-3",
      title: "Session Attendance Active",
      desc: "Daily session QR is available for entry gate scanning.",
      time: "3d ago",
      read: true,
      type: "attendance",
      roles: ["STUDENT"],
    },
    // Volunteer Notifications
    {
      id: "vol-1",
      title: "Scanner Access Active",
      desc: "Attendance QR scanner is ready for Day 1 entry gates.",
      time: "1h ago",
      read: false,
      type: "attendance",
      roles: ["VOLUNTEER"],
    },
    {
      id: "vol-2",
      title: "Session Assigned",
      desc: "You have been assigned to Day 1 Orientation session at APJ Hall.",
      time: "5h ago",
      read: false,
      type: "registration",
      roles: ["VOLUNTEER"],
    },
    {
      id: "vol-3",
      title: "Roster Sheet Refreshed",
      desc: "Assigned student directory logs synchronized.",
      time: "1d ago",
      read: true,
      type: "certificate",
      roles: ["VOLUNTEER"],
    },
    // Admin Notifications
    {
      id: "adm-1",
      title: "New Student Registrations",
      desc: "50+ new enrollment profiles require checklist verification.",
      time: "10m ago",
      read: false,
      type: "registration",
      roles: ["ADMIN"],
    },
    {
      id: "adm-2",
      title: "Pending Payout Actions",
      desc: "Review fee payment receipts matching unresolved PhonePe hashes.",
      time: "2h ago",
      read: false,
      type: "payment",
      roles: ["ADMIN"],
    },
    {
      id: "adm-3",
      title: "System Backup Successful",
      desc: "Daily automated database backups persisted to cloud storage.",
      time: "1d ago",
      read: true,
      type: "certificate",
      roles: ["ADMIN"],
    },
  ])

  const userNotifications = notifications.filter((n) => n.roles.includes(normalizedRole as any))
  const unreadCount = userNotifications.filter((n) => !n.read).length

  useEffect(() => {
    setMounted(true)
  }, [])

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

  // Lock body scroll on mobile when open
  useEffect(() => {
    if (open && window.innerWidth < 768) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const toggleRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: !n.read } : n))
    )
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Navbar Notification Bell Icon Button */}
      <button
        onClick={() => setOpen(!open)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-cyan-700 transition duration-200 cursor-pointer"
        aria-label="View notifications"
        aria-expanded={open}
      >
        <FiBell className="text-base" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-cyan-600 text-[9px] font-bold text-white shadow-sm ring-2 ring-white">
            {unreadCount}
          </span>
        )}
      </button>

      {/* 1. Mobile Portal Rendering (fixed top: 84px, z-index: 60, document.body level) */}
      {open && mounted && createPortal(
        <>
          {/* Backdrop (z-55) */}
          <div
            onClick={() => setOpen(false)}
            className="block md:hidden fixed inset-0 bg-slate-900/15 backdrop-blur-[2px] z-[55] transition-opacity duration-200"
          />

          {/* Mobile Notification Panel (z-60) */}
          <div
            className="block md:hidden fixed left-3 right-3 top-[84px] max-h-[calc(100vh-110px)] w-[calc(100vw-24px)] rounded-2xl bg-white border border-slate-200 shadow-2xl z-[60] flex flex-col overflow-hidden animate-in fade-in slide-in-from-top-3 duration-200"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 shrink-0 bg-white">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="bg-cyan-50 text-cyan-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-cyan-200">
                    {unreadCount} New
                  </span>
                )}
              </div>
              <button
                onClick={() => setOpen(false)}
                className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer text-base"
                aria-label="Close notifications"
              >
                <FiX />
              </button>
            </div>

            {/* Scrollable Notifications List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {userNotifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => toggleRead(n.id)}
                  className={`p-3.5 flex items-start gap-3 transition cursor-pointer active:bg-slate-100 ${
                    !n.read ? "bg-cyan-50/40" : ""
                  }`}
                >
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center text-sm shrink-0 mt-0.5 ${
                      n.type === "payment"
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                        : n.type === "registration"
                        ? "bg-cyan-50 text-cyan-600 border border-cyan-200"
                        : "bg-purple-50 text-purple-600 border border-purple-200"
                    }`}
                  >
                    {n.type === "payment" ? (
                      <FiCreditCard className="text-base" />
                    ) : n.type === "registration" ? (
                      <FiCheckCircle className="text-base" />
                    ) : (
                      <FiAward className="text-base" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{n.title}</h4>
                      <span className="text-[10px] text-slate-400 shrink-0 font-mono">{n.time}</span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 line-clamp-2 leading-snug">{n.desc}</p>
                  </div>

                  {!n.read && <span className="h-2 w-2 rounded-full bg-cyan-600 shrink-0 mt-1.5" />}
                </div>
              ))}
            </div>

            {/* Sticky Footer Action Bar */}
            <div className="p-3 border-t border-slate-100 flex gap-2 bg-slate-50/80 shrink-0">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex-1 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-cyan-800 hover:bg-slate-50 transition cursor-pointer shadow-2xs"
                >
                  Mark all read
                </button>
              )}
              <Link
                href="/notifications"
                onClick={() => setOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition text-center inline-block shadow-2xs"
              >
                View All Notifications
              </Link>
            </div>
          </div>
        </>,
        document.body
      )}

      {/* 2. Desktop Dropdown Panel (Relative to bell on >= md) */}
      {open && (
        <div className="hidden md:block absolute right-0 mt-2.5 w-96 rounded-2xl bg-white border border-slate-200 shadow-2xl py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Panel Header */}
          <div className="flex items-center justify-between px-4 pb-2.5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-slate-900">Notifications</h3>
              {unreadCount > 0 && (
                <span className="bg-cyan-50 text-cyan-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-cyan-200">
                  {unreadCount} New
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[11px] font-semibold text-cyan-700 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <FiCheck className="text-xs" /> Mark all read
              </button>
            )}
          </div>

          {/* Notifications List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {userNotifications.map((n) => (
              <div
                key={n.id}
                onClick={() => toggleRead(n.id)}
                className={`p-3.5 flex items-start gap-3 transition cursor-pointer hover:bg-slate-50/80 ${
                  !n.read ? "bg-cyan-50/40" : ""
                }`}
              >
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center text-sm shrink-0 mt-0.5 ${
                    n.type === "payment"
                      ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                      : n.type === "registration"
                      ? "bg-cyan-50 text-cyan-600 border border-cyan-200"
                      : "bg-purple-50 text-purple-600 border border-purple-200"
                  }`}
                >
                  {n.type === "payment" ? (
                    <FiCreditCard />
                  ) : n.type === "registration" ? (
                    <FiCheckCircle />
                  ) : (
                    <FiAward />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="text-xs font-bold text-slate-900 truncate">{n.title}</h4>
                    <span className="text-[10px] text-slate-400 shrink-0 font-mono">{n.time}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5 line-clamp-2 leading-snug">{n.desc}</p>
                </div>

                {!n.read && <span className="h-2 w-2 rounded-full bg-cyan-600 shrink-0 mt-1.5" />}
              </div>
            ))}
          </div>

          {/* Footer Action */}
          <div className="px-4 pt-2.5 border-t border-slate-100 text-center">
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="text-xs font-bold text-cyan-700 hover:text-cyan-800 transition"
            >
              View All Notifications &rarr;
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
