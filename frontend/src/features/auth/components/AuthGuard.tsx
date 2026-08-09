"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { restoreAuth } from "@/store/slices/authSlice"
import { validateAndSyncSession } from "../services/authSync"

const PUBLIC_EXACT_ROUTES = [
  "/",
  "/login",
  "/register",
  "/registration",
  "/forgot-password",
  "/unauthorized",
  "/about",
  "/contact",
  "/speakers",
  "/gallery",
  "/faq",
  "/schedule",
  "/auth/callback",
]

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const dispatch = useAppDispatch()
  const { isAuthenticated, role, isValidatingSession } = useAppSelector((state) => state.auth)
  const [loading, setLoading] = useState(true)
  const hasSynced = useRef(false)

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = typeof window !== "undefined" ? localStorage.getItem("cbp-token") : null
      const storedStudentId = typeof window !== "undefined" ? localStorage.getItem("cbp-studentId") || "" : ""
      const storedRole = typeof window !== "undefined" ? localStorage.getItem("cbp-role") || "" : ""
      const storedName = typeof window !== "undefined" ? localStorage.getItem("cbp-name") || "" : ""
      const storedPermissionsRaw = typeof window !== "undefined" ? localStorage.getItem("cbp-permissions") : null
      const storedUserId = typeof window !== "undefined" ? localStorage.getItem("cbp-userId") || "" : ""

      let storedPermissions: string[] = []
      if (storedPermissionsRaw) {
        try {
          storedPermissions = JSON.parse(storedPermissionsRaw)
        } catch {
          storedPermissions = []
        }
      }

      // 1. Initial fast restore from localStorage to prevent blank flicker
      if (storedToken && !isAuthenticated) {
        dispatch(
          restoreAuth({
            token: storedToken,
            userId: storedUserId,
            studentId: storedStudentId,
            role: storedRole,
            name: storedName,
            permissions: storedPermissions,
          })
        )
      }

      const isPublicRoute =
        pathname.startsWith("/volunteer/setup-password") || PUBLIC_EXACT_ROUTES.includes(pathname)

      // 2. If on a public route without token, allow immediately
      if (isPublicRoute && !storedToken) {
        setLoading(false)
        return
      }

      // 3. For any session with a token (or protected route), synchronize live permissions from DB
      if (storedToken && !hasSynced.current) {
        hasSynced.current = true
        await validateAndSyncSession()
      }

      // Check current credentials after sync
      const currentToken = typeof window !== "undefined" ? localStorage.getItem("cbp-token") : null
      const currentRole = (
        role ||
        (typeof window !== "undefined" ? localStorage.getItem("cbp-role") : "") ||
        ""
      ).toUpperCase()

      // 4. If on public auth page (e.g. /login) and already authenticated, redirect to home
      if (isPublicRoute) {
        if (currentToken && ["/login", "/register", "/registration"].includes(pathname)) {
          if (currentRole === "ROLE_ADMIN" || currentRole === "ADMIN") {
            router.replace("/admin/dashboard")
          } else if (currentRole === "ROLE_VOLUNTEER" || currentRole === "VOLUNTEER") {
            router.replace("/volunteer/scanner")
          } else {
            router.replace("/dashboard")
          }
          return
        }
        setLoading(false)
        return
      }

      // 5. Unauthenticated user on protected route -> redirect to login
      if (!currentToken) {
        router.replace("/login")
        return
      }

      // 6. Admin Routes: /admin/* (Permit ADMIN and VOLUNTEER with assigned scopes)
      if (pathname.startsWith("/admin")) {
        const isPrivileged =
          currentRole === "ROLE_ADMIN" ||
          currentRole === "ADMIN" ||
          currentRole === "ROLE_VOLUNTEER" ||
          currentRole === "VOLUNTEER"

        if (!isPrivileged) {
          router.replace("/unauthorized")
          return
        }
      }

      // 7. Volunteer Routes: /volunteer/* (Permit VOLUNTEER and ADMIN)
      if (pathname.startsWith("/volunteer") && !pathname.startsWith("/volunteer/setup-password")) {
        const isVolunteerOrAdmin =
          currentRole === "ROLE_VOLUNTEER" ||
          currentRole === "VOLUNTEER" ||
          currentRole === "ROLE_ADMIN" ||
          currentRole === "ADMIN"

        if (!isVolunteerOrAdmin) {
          router.replace("/unauthorized")
          return
        }
      }

      setLoading(false)
    }

    initAuth()
  }, [pathname, isAuthenticated, role, router, dispatch])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-900">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-3 border-cyan-600 border-t-transparent shadow-sm" />
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-600">
            Validating Session &amp; Access Rights...
          </span>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
