"use client"

import React, { useState, useEffect, ReactNode } from "react"
import Link from "next/link"
import { useAppSelector } from "@/store/hooks"
import { validateAndSyncSession } from "../services/authSync"
import { FiShield, FiArrowLeft, FiRefreshCw, FiCheckCircle } from "react-icons/fi"

interface PermissionGuardProps {
  requiredPermission: string
  children: ReactNode
}

export default function PermissionGuard({ requiredPermission, children }: PermissionGuardProps) {
  const { role, roles, permissions, isValidatingSession } = useAppSelector((state) => state.auth)
  const [reChecking, setReChecking] = useState(false)
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null)

  // 1. Check if user is Admin
  const effectiveRole = (
    role ||
    (typeof window !== "undefined" ? localStorage.getItem("cbp-role") : "") ||
    ""
  ).toUpperCase()

  const isAdmin =
    effectiveRole === "ROLE_ADMIN" ||
    effectiveRole === "ADMIN" ||
    (roles && roles.some((r) => r.toUpperCase() === "ROLE_ADMIN" || r.toUpperCase() === "ADMIN"))

  // 2. Check if required permission is in permissions list (from Redux or localStorage)
  let effectivePermissions = permissions || []
  if (effectivePermissions.length === 0 && typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem("cbp-permissions")
      if (raw) effectivePermissions = JSON.parse(raw)
    } catch {
      effectivePermissions = []
    }
  }

  const isAuthorized = isAdmin || effectivePermissions.includes(requiredPermission)

  // Manual re-check trigger if user was granted permission in another tab/device
  const handleRecheckPermissions = async () => {
    setReChecking(true)
    setSyncFeedback(null)
    try {
      const res = await validateAndSyncSession()
      if (res?.permissions && res.permissions.includes(requiredPermission)) {
        setSyncFeedback("Permission verified! Unlocking access...")
      } else {
        setSyncFeedback("Access rights checked. Scope still not assigned by admin.")
      }
    } catch {
      setSyncFeedback("Unable to reach authentication server.")
    } finally {
      setReChecking(false)
      setTimeout(() => setSyncFeedback(null), 4000)
    }
  }

  // 3. While session is validating, show loading indicator
  if (isValidatingSession && !isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[350px] gap-3 text-slate-900">
        <div className="h-8 w-8 border-3 border-cyan-600 border-t-transparent rounded-full animate-spin shadow-sm" />
        <span className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-500">
          Verifying Authorization Scope...
        </span>
      </div>
    )
  }

  // 4. Access Restricted view if user does not have the scope
  if (!isAuthorized) {
    return (
      <div className="max-w-md mx-auto my-12 bg-white border border-slate-200 rounded-3xl p-7 text-center shadow-sm animate-in fade-in">
        <div className="h-14 w-14 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center text-2xl mx-auto mb-3.5">
          <FiShield />
        </div>
        <h2 className="text-base font-extrabold uppercase tracking-wide text-slate-900 mb-1">
          Access Restricted
        </h2>
        <p className="text-xs text-slate-600 mb-4 leading-relaxed">
          Your account does not have permission to access this module. Requires the{" "}
          <code className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-cyan-800 font-bold">
            {requiredPermission}
          </code>{" "}
          scope.
        </p>

        {syncFeedback && (
          <div className="mb-4 p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 text-[11px] font-semibold flex items-center justify-center gap-1.5">
            <FiCheckCircle className="text-cyan-700 shrink-0" />
            <span>{syncFeedback}</span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
          <button
            type="button"
            onClick={handleRecheckPermissions}
            disabled={reChecking}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 px-4 py-2 text-xs font-bold uppercase tracking-wider transition cursor-pointer"
          >
            <FiRefreshCw className={reChecking ? "animate-spin text-xs" : "text-xs"} />
            <span>{reChecking ? "Checking..." : "Re-sync Access"}</span>
          </button>

          <Link
            href="/dashboard"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 text-xs font-bold uppercase tracking-wider transition shadow-2xs"
          >
            <FiArrowLeft className="text-xs" />
            <span>Dashboard</span>
          </Link>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
