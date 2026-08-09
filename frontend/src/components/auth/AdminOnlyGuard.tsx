"use client"

import { useState, useEffect, ReactNode } from "react"
import Link from "next/link"
import { FiShield, FiArrowLeft } from "react-icons/fi"

interface AdminOnlyGuardProps {
  children: ReactNode
}

export default function AdminOnlyGuard({ children }: AdminOnlyGuardProps) {
  const [authorized, setAuthorized] = useState<boolean | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const role = (localStorage.getItem("cbp-role") || "").toUpperCase()
      const isAdmin = role === "ROLE_ADMIN" || role === "ADMIN"
      setAuthorized(isAdmin)
    }
  }, [])

  if (authorized === null) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-7 w-7 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!authorized) {
    return (
      <div className="max-w-md mx-auto my-16 bg-white border border-slate-200 rounded-3xl p-8 text-center shadow-sm">
        <div className="h-16 w-16 rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center text-3xl mx-auto mb-4">
          <FiShield />
        </div>
        <h2 className="text-lg font-extrabold text-slate-900 mb-1">Access Restricted</h2>
        <p className="text-xs text-slate-600 mb-6 font-medium">
          This section is strictly restricted to Administrators only.
        </p>
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 text-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition active-press"
        >
          <FiArrowLeft /> Return to Dashboard
        </Link>
      </div>
    )
  }

  return <>{children}</>
}
