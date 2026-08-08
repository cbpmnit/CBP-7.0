"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { restoreAuth } from "@/store/slices/authSlice"

const PUBLIC_EXACT_ROUTES = [
  "/",
  "/login",
  "/register",
  "/registration",
  "/about",
  "/contact",
  "/speakers",
  "/gallery",
  "/faq",
  "/schedule",
]

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const dispatch = useAppDispatch()
  const { isAuthenticated, role } = useAppSelector((state) => state.auth)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedToken = typeof window !== "undefined" ? localStorage.getItem("cbp-token") : null
    const storedStudentId = typeof window !== "undefined" ? localStorage.getItem("cbp-studentId") || "" : ""
    const storedRole = typeof window !== "undefined" ? localStorage.getItem("cbp-role") || "" : ""
    const storedName = typeof window !== "undefined" ? localStorage.getItem("cbp-name") || "" : ""

    if (!isAuthenticated && storedToken) {
      dispatch(
        restoreAuth({
          token: storedToken,
          studentId: storedStudentId,
          role: storedRole,
          name: storedName,
        })
      )
    }

    const effectiveRole = (role || storedRole || "").toUpperCase()
    const isAuth = isAuthenticated || !!storedToken

    // 1. Allow public setup-password and marketing pages
    if (pathname.startsWith("/volunteer/setup-password") || PUBLIC_EXACT_ROUTES.includes(pathname)) {
      if (isAuth && ["/login", "/register", "/registration"].includes(pathname)) {
        // Logged in user hitting login page -> redirect to their role home
        if (effectiveRole === "ROLE_ADMIN" || effectiveRole === "ADMIN") {
          router.replace("/admin/dashboard")
        } else if (effectiveRole === "ROLE_VOLUNTEER" || effectiveRole === "VOLUNTEER") {
          router.replace("/volunteer/scanner")
        } else {
          router.replace("/dashboard")
        }
        return
      }
      setLoading(false)
      return
    }

    // 2. Unauthenticated check for protected routes
    if (!isAuth) {
      router.replace("/login")
      return
    }

    // 3. Admin Routes: /admin/*
    if (pathname.startsWith("/admin")) {
      if (effectiveRole !== "ROLE_ADMIN" && effectiveRole !== "ADMIN") {
        router.replace("/unauthorized")
        return
      }
    }

    // 4. Volunteer Routes: /volunteer/*
    if (pathname.startsWith("/volunteer") && !pathname.startsWith("/volunteer/setup-password")) {
      if (
        effectiveRole !== "ROLE_VOLUNTEER" &&
        effectiveRole !== "VOLUNTEER" &&
        effectiveRole !== "ROLE_ADMIN" &&
        effectiveRole !== "ADMIN"
      ) {
        router.replace("/unauthorized")
        return
      }
    }

    // 5. Volunteer trying to access student pages
    if (
      (effectiveRole === "ROLE_VOLUNTEER" || effectiveRole === "VOLUNTEER") &&
      ["/dashboard", "/profile", "/payment"].some((p) => pathname.startsWith(p))
    ) {
      router.replace("/volunteer/scanner")
      return
    }

    setLoading(false)
  }, [isAuthenticated, role, pathname, router, dispatch])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-900">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-3 border-cyan-600 border-t-transparent shadow-sm" />
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-600">
            Validating Session Access...
          </span>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
