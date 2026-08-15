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
  "/registration/success",
  "/registration/payment-failed",
  "/payment/success",
  "/payment/failure",
  "/payment-success",
  "/payment-failure",
  "/forgot-password",
  "/unauthorized",
  "/about",
  "/contact",
  "/speakers",
  "/gallery",
  "/faq",
  "/schedule",
  "/auth/callback",
  "/complete-account",
]

const ROLE_HOME_ROUTES: Record<string, string> = {
  ADMIN: "/admin/dashboard",
  VOLUNTEER: "/volunteer/dashboard",
  STUDENT: "/dashboard",
}

const getHomeRoute = (role: string): string => {
  const norm = (role || "").toUpperCase().replace("ROLE_", "");
  if (norm === "ADMIN") return ROLE_HOME_ROUTES.ADMIN;
  if (norm === "VOLUNTEER") return ROLE_HOME_ROUTES.VOLUNTEER;
  return ROLE_HOME_ROUTES.STUDENT;
}

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const dispatch = useAppDispatch()
  const { isAuthenticated, role, accountSetupCompleted } = useAppSelector((state) => state.auth)
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
      const storedAccountSetupCompleted = typeof window !== "undefined" ? localStorage.getItem("cbp-accountSetupCompleted") === "true" : false

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
            accountSetupCompleted: storedAccountSetupCompleted,
          })
        )
      }

      const isPublicRoute =
        pathname.startsWith("/volunteer/setup-password") ||
        pathname.startsWith("/registration") ||
        pathname.startsWith("/payment/success") ||
        pathname.startsWith("/payment/failure") ||
        PUBLIC_EXACT_ROUTES.includes(pathname)

      // 2. If on a public route without token, allow immediately without session validation or login redirects
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
        if (currentToken && ["/login", "/register"].includes(pathname)) {
          if (currentRole === "ROLE_ADMIN" || currentRole === "ADMIN") {
            router.replace("/admin/dashboard")
          } else if (currentRole === "ROLE_VOLUNTEER" || currentRole === "VOLUNTEER") {
            router.replace("/volunteer/dashboard")
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

      const homeRoute = getHomeRoute(currentRole)

      // 6. Admin Routes: /admin/* (Permit ADMIN only)
      if (pathname.startsWith("/admin")) {
        const isAdmin =
          currentRole === "ROLE_ADMIN" ||
          currentRole === "ADMIN"

        if (!isAdmin) {
          router.replace(homeRoute)
          return
        }
      }

      // 7. Volunteer Routes: /volunteer/* (Permit VOLUNTEER only)
      if (pathname.startsWith("/volunteer") && !pathname.startsWith("/volunteer/setup-password")) {
        const isVolunteer =
          currentRole === "ROLE_VOLUNTEER" ||
          currentRole === "VOLUNTEER"
        if (!isVolunteer) {
          router.replace(homeRoute)
          return
        }
      }

      // 8. Student & Account Routes (Permit STUDENT / All Authenticated Users)
      const isStudentRoute =
        pathname === "/dashboard" ||
        pathname.startsWith("/account") ||
        pathname.startsWith("/profile") ||
        pathname.startsWith("/attendance") ||
        pathname.startsWith("/certificate") ||
        pathname.startsWith("/cbp")

      if (isStudentRoute) {
        const isStudent =
          currentRole !== "ROLE_ADMIN" &&
          currentRole !== "ADMIN" &&
          currentRole !== "ROLE_VOLUNTEER" &&
          currentRole !== "VOLUNTEER"

        if (!isStudent && !pathname.startsWith("/account")) {
          router.replace(homeRoute)
          return
        }

        const isSetupCompleted =
          accountSetupCompleted === true ||
          (typeof window !== "undefined" && localStorage.getItem("cbp-accountSetupCompleted") === "true")

        const isSetupPage = pathname === "/profile/setup" || pathname === "/complete-account" || pathname.startsWith("/account")

        if (!isSetupCompleted && !isSetupPage) {
          router.replace("/profile/setup")
          return
        }

        if (isSetupCompleted && (pathname === "/profile/setup" || pathname === "/complete-account")) {
          router.replace("/profile")
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
