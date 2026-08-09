"use client"

import { useState, useEffect, ReactNode } from "react"
import Link from "next/link"
import { FiShield, FiArrowLeft } from "react-icons/fi"

interface PermissionGuardProps {
  requiredPermission: string
  children: ReactNode
}

export default function PermissionGuard({ requiredPermission, children }: PermissionGuardProps) {
  const [authorized, setAuthorized] = useState<boolean | null>(null)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const role = (localStorage.getItem("cbp-role") || "").toUpperCase()
      if (role === "ROLE_ADMIN" || role === "ADMIN") {
        setAuthorized(true)
        return
      }

      try {
        const raw = localStorage.getItem("cbp-permissions")
        const permissions: string[] = raw ? JSON.parse(raw) : []
        setAuthorized(permissions.includes(requiredPermission))
      } catch {
        setAuthorized(false)
      }
    }
  }, [requiredPermission])

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
        <div className="h-16 w-16 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center text-3xl mx-auto mb-4">
          <FiShield />
        </div>
        <h2 className="text-lg font-extrabold text-slate-900 mb-1">Access Restricted</h2>
        <p className="text-xs text-slate-600 mb-6">
          You don&apos;t have permission to access this module. Your account requires the <code className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-cyan-800 font-bold">{requiredPermission}</code> scope.
        </p>
        <Link
          href="/admin/dashboard"
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 text-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition"
        >
          <FiArrowLeft /> Return to Dashboard
        </Link>
      </div>
    )
  }

  return <>{children}</>
}
