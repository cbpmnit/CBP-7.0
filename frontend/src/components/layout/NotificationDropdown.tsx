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

export function NotificationDropdown() {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const { role } = useAppSelector((state) => state.auth)
  const normalizedRole = (role || "").toUpperCase().replace("ROLE_", "") || "STUDENT"

  const [notifications, setNotifications] = useState<NotificationItem[]>([
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
      desc: "Student registration confirmed for CBP 7.0.",
      time: "1d ago",
      read: true,
      type: "registration",
      roles: ["STUDENT"],
    },
    {
      id: "admin-1",
      title: "New Student Registrations",
      desc: "15 new students completed CBP enrollment today.",
      time: "1h ago",
      read: false,
      type: "registration",
      roles: ["ADMIN", "VOLUNTEER"],
    },
  ])

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

  const filtered = notifications.filter((n) => n.roles.includes(normalizedRole as any))
  const unreadCount = filtered.filter((n) => !n.read).length

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  const markSingleRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
        aria-label="View notifications"
      >
        <FiBell className="text-lg" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2.5 w-80 rounded-2xl bg-white border border-slate-200 shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold uppercase text-slate-900">Notifications</h4>
              {unreadCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-cyan-100 text-cyan-800">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="text-[11px] font-semibold text-cyan-700 hover:text-cyan-800 cursor-pointer"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
            {filtered.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-500">No notifications</div>
            ) : (
              filtered.map((item) => (
                <div
                  key={item.id}
                  onClick={() => markSingleRead(item.id)}
                  className={`p-3 text-xs transition cursor-pointer hover:bg-slate-50 ${
                    !item.read ? "bg-cyan-50/30 font-medium" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-bold text-slate-900 truncate">{item.title}</p>
                    <span className="text-[10px] text-slate-400 shrink-0">{item.time}</span>
                  </div>
                  <p className="text-slate-600 text-[11px] mt-0.5 leading-snug">{item.desc}</p>
                </div>
              ))
            )}
          </div>

          <div className="border-t border-slate-100 pt-2 px-4 text-center">
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="text-xs font-bold text-cyan-700 hover:text-cyan-800"
            >
              View All Notifications &rarr;
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

export default NotificationDropdown
