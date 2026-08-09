"use client"

import Link from "next/link"
import { useAppSelector } from "@/store/hooks"
import PageTransition from "@/components/animations/PageTransition"
import Reveal from "@/components/animations/RevealOnScroll"
import { FiShieldOff, FiArrowRight, FiLock } from "react-icons/fi"

export default function UnauthorizedPage() {
  const { isAuthenticated, role } = useAppSelector((state) => state.auth)
  const normalizedRole = (role || "").toUpperCase()

  let redirectPath = "/dashboard"
  let redirectLabel = "Go to Student Dashboard"

  if (normalizedRole === "ROLE_ADMIN" || normalizedRole === "ADMIN") {
    redirectPath = "/admin/dashboard"
    redirectLabel = "Go to Admin Dashboard"
  } else if (normalizedRole === "ROLE_VOLUNTEER" || normalizedRole === "VOLUNTEER") {
    redirectPath = "/volunteer/dashboard"
    redirectLabel = "Go to Volunteer Dashboard"
  } else if (!isAuthenticated) {
    redirectPath = "/login"
    redirectLabel = "Go to Login"
  }

  return (
    <PageTransition>
      <main className="min-h-[80vh] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-cbp-grid">
        <div className="max-w-md w-full text-center">
          <Reveal variant="scale">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-rose-50 text-rose-600 border border-rose-200 shadow-lg shadow-rose-600/10 mb-6">
              <FiShieldOff className="h-10 w-10" />
            </div>
          </Reveal>

          <Reveal delay={80}>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-50 text-rose-800 border border-rose-200 mb-3">
              <FiLock /> Access Restricted
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Unauthorized <span className="text-rose-600">Access</span>
            </h1>
          </Reveal>

          <Reveal delay={140}>
            <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm mx-auto">
              You do not have permission to view this route. Your current role does not have authorization for this module.
            </p>
          </Reveal>

          <Reveal delay={200}>
            <div className="mt-8 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm text-left space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Current Session Role:</span>
                <span className="font-mono font-bold text-slate-900 uppercase">
                  {normalizedRole || "UNAUTHENTICATED"}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">Status:</span>
                <span className="text-rose-700 font-bold">Forbidden (403)</span>
              </div>
            </div>
          </Reveal>

          <Reveal delay={260}>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href={redirectPath}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-6 py-3.5 text-xs font-bold uppercase tracking-wider shadow-sm transition shadow-cyan-600/20"
              >
                <span>{redirectLabel}</span>
                <FiArrowRight />
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-6 py-3.5 text-xs font-bold uppercase tracking-wider shadow-sm transition"
              >
                Switch Account
              </Link>
            </div>
          </Reveal>
        </div>
      </main>
    </PageTransition>
  )
}
