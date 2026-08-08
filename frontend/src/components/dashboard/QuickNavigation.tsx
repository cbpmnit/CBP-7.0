"use client"

import Link from "next/link"
import {
  FiGrid,
  FiUser,
  FiCamera,
  FiCreditCard,
  FiAward,
  FiBell,
  FiMail,
} from "react-icons/fi"

export const NAV_ITEMS = [
  { id: "overview", label: "Dashboard", href: "/dashboard", icon: <FiGrid /> },
  { id: "profile", label: "Profile", href: "/profile", icon: <FiUser /> },
  { id: "attendance", label: "Attendance & QR", href: "/attendance", icon: <FiCamera /> },
  { id: "payments", label: "Payments", href: "/payment", icon: <FiCreditCard /> },
  { id: "certificates", label: "Certificates", href: "/certificate", icon: <FiAward /> },
  { id: "notifications", label: "Notifications", href: "/notifications", icon: <FiBell /> },
  { id: "email", label: "Email Tools", href: "/admin/notifications", icon: <FiMail /> },
]

interface QuickNavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export default function QuickNavigation({ activeTab, onTabChange }: QuickNavigationProps) {
  return (
    <div>
      {/* Desktop Left Sidebar */}
      <aside className="hidden lg:block bg-white border border-slate-200 rounded-2xl p-3 shadow-sm sticky top-24">
        <div className="px-3 py-2 border-b border-slate-100 mb-2">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">CBP Portal Navigation</p>
        </div>

        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition text-left ${
                  isActive
                    ? "bg-slate-900 text-white font-bold shadow-sm"
                    : "text-slate-700 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <span className="text-sm">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            )
          })}
        </nav>
      </aside>

      {/* Mobile Action Cards */}
      <div className="block lg:hidden grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
        <Link
          href="/attendance"
          className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-slate-300 transition text-left flex flex-col justify-between"
        >
          <div className="h-9 w-9 flex items-center justify-center rounded-xl bg-cyan-50 text-cyan-700 text-lg mb-2">
            <FiCamera />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Attendance &amp; QR</h4>
            <p className="text-[11px] text-slate-500 line-clamp-1">View &amp; generate QR code</p>
          </div>
        </Link>

        <Link
          href="/certificate"
          className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-slate-300 transition text-left flex flex-col justify-between"
        >
          <div className="h-9 w-9 flex items-center justify-center rounded-xl bg-purple-50 text-purple-700 text-lg mb-2">
            <FiAward />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Certificates</h4>
            <p className="text-[11px] text-slate-500 line-clamp-1">Download official PDF</p>
          </div>
        </Link>

        <Link
          href="/payment"
          className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-slate-300 transition text-left flex flex-col justify-between"
        >
          <div className="h-9 w-9 flex items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 text-lg mb-2">
            <FiCreditCard />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Payments</h4>
            <p className="text-[11px] text-slate-500 line-clamp-1">Fee receipt &amp; status</p>
          </div>
        </Link>

        <Link
          href="/profile"
          className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-slate-300 transition text-left flex flex-col justify-between"
        >
          <div className="h-9 w-9 flex items-center justify-center rounded-xl bg-blue-50 text-blue-700 text-lg mb-2">
            <FiUser />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Profile</h4>
            <p className="text-[11px] text-slate-500 line-clamp-1">Personal &amp; hostel info</p>
          </div>
        </Link>

        <Link
          href="/notifications"
          className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm hover:border-slate-300 transition text-left flex flex-col justify-between"
        >
          <div className="h-9 w-9 flex items-center justify-center rounded-xl bg-amber-50 text-amber-700 text-lg mb-2">
            <FiBell />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Notifications</h4>
            <p className="text-[11px] text-slate-500 line-clamp-1">Recent updates &amp; alerts</p>
          </div>
        </Link>
      </div>
    </div>
  )
}
