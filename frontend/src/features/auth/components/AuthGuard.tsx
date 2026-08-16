"use client"

import React, { useEffect, useState, useRef } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { restoreAuth } from "@/store/slices/authSlice"
import { validateAndSyncSession } from "../services/authSync"

/**
 * Determines whether a given pathname is completely public and requires no authentication.
 */
export const isPublicRoute = (pathname: string): boolean => {
  if (!pathname) return true
  const path = pathname.toLowerCase().split("?")[0].replace(/\/+$/, "") || "/"

  // Public home & single page routes
  if (
    path === "/" ||
    path === "/login" ||
    path === "/forgot-password" ||
    path === "/unauthorized" ||
    path === "/auth/callback" ||
    path === "/complete-account"
  ) {
    return true
  }

  // Public section prefixes
  if (
    path.startsWith("/about") ||
    path.startsWith("/schedule") ||
    path.startsWith("/speakers") ||
    path.startsWith("/team") ||
    path.startsWith("/faq") ||
    path.startsWith("/contact") ||
    path.startsWith("/register") ||
    path.startsWith("/registration") ||
    path.startsWith("/check-registration") ||
    path.startsWith("/payment") ||
    path.startsWith("/payment-status") ||
    path.startsWith("/payment-failure") ||
    path.startsWith("/volunteer/setup-password")
  ) {
    return true
  }

  return false
}

const ROLE_HOME_ROUTES: Record<string, string> = {
  ADMIN: "/admin/dashboard",
  VOLUNTEER: "/volunteer/dashboard",
  STUDENT: "/dashboard",
}

const getHomeRoute = (role: string): string => {
  const norm = (role || "").toUpperCase().replace("ROLE_", "")
  if (norm === "ADMIN") return ROLE_HOME_ROUTES.ADMIN
  if (norm === "VOLUNTEER") return ROLE_HOME_ROUTES.VOLUNTEER
  return ROLE_HOME_ROUTES.STUDENT
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
      const path = pathname.toLowerCase().split("?")[0].replace(/\/+$/, "") || "/"
      const isPublic = isPublicRoute(pathname)

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

      // 1. Initial fast restore from localStorage to prevent UI flicker
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

      // 2. If on ANY public route without a token, allow access immediately
      if (isPublic && !storedToken) {
        setLoading(false)
        return
      }

      // 3. For sessions with a token, synchronize live permissions in the background
      if (storedToken && !hasSynced.current) {
        hasSynced.current = true
        await validateAndSyncSession()
      }

      const currentToken = typeof window !== "undefined" ? localStorage.getItem("cbp-token") : null
      const currentRole = (
        role ||
        (typeof window !== "undefined" ? localStorage.getItem("cbp-role") : "") ||
        ""
      ).toUpperCase()

      // 4. If on public route:
      if (isPublic) {
        // Only redirect already-authenticated users if they land specifically on /login
        if (currentToken && path === "/login") {
          const targetHome = getHomeRoute(currentRole)
          router.replace(targetHome)
          return
        }
        // All other public routes (/register, /about, /schedule, /speakers, /team, etc.) remain open
        setLoading(false)
        return
      }

      // 5. Unauthenticated user attempting to access a PROTECTED route -> redirect to /login
      if (!currentToken) {
        router.replace("/login")
        return
      }

      const homeRoute = getHomeRoute(currentRole)

      // 6. Admin Routes: /admin/* (Permit ADMIN only)
      if (path.startsWith("/admin")) {
        const isAdmin = currentRole === "ROLE_ADMIN" || currentRole === "ADMIN"
        if (!isAdmin) {
          router.replace(homeRoute)
          return
        }
      }

      // 7. Volunteer Routes: /volunteer/* (Permit VOLUNTEER only)
      if (path.startsWith("/volunteer") && !path.startsWith("/volunteer/setup-password")) {
        const isVolunteer = currentRole === "ROLE_VOLUNTEER" || currentRole === "VOLUNTEER"
        if (!isVolunteer) {
          router.replace(homeRoute)
          return
        }
      }

      // 8. Student & Account Routes (Permit STUDENT / All Authenticated Users)
      const isStudentRoute =
        path === "/dashboard" ||
        path.startsWith("/account") ||
        path.startsWith("/profile") ||
        path.startsWith("/attendance") ||
        path.startsWith("/certificate") ||
        path.startsWith("/cbp")

      if (isStudentRoute) {
        const isStudent =
          currentRole !== "ROLE_ADMIN" &&
          currentRole !== "ADMIN" &&
          currentRole !== "ROLE_VOLUNTEER" &&
          currentRole !== "VOLUNTEER"

        if (!isStudent && !path.startsWith("/account")) {
          router.replace(homeRoute)
          return
        }

        const isSetupCompleted =
          accountSetupCompleted === true ||
          (typeof window !== "undefined" && localStorage.getItem("cbp-accountSetupCompleted") === "true")

        const isSetupPage = path === "/profile/setup" || path === "/complete-account" || path.startsWith("/account")

        if (!isSetupCompleted && !isSetupPage) {
          router.replace("/profile/setup")
          return
        }

        if (isSetupCompleted && (path === "/profile/setup" || path === "/complete-account")) {
          router.replace("/profile")
          return
        }
      }

      setLoading(false)
    }

    initAuth()
  }, [pathname, isAuthenticated, role, router, dispatch, accountSetupCompleted])

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
