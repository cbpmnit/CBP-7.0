"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { restoreAuth } from "@/store/slices/authSlice"

const PUBLIC_ROUTES = ["/", "/login", "/register", "/registration"]
const PROTECTED_ROUTES = [
  "/dashboard",
  "/profile",
  "/payment",
  "/cbp",
  "/attendance",
  "/certificate",
  "/notifications",
  "/admin",
]

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const dispatch = useAppDispatch()
  const { isAuthenticated, token } = useAppSelector((state) => state.auth)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Restore authentication state from localStorage into Redux on mount / page refresh
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

    const isAuth = isAuthenticated || !!storedToken

    const isProtectedRoute = PROTECTED_ROUTES.some((route) =>
      pathname.startsWith(route)
    )
    const isPublicAuthRoute = ["/login", "/register", "/registration"].includes(pathname)

    if (isProtectedRoute && !isAuth) {
      router.replace("/login")
    } else if (isPublicAuthRoute && isAuth) {
      router.replace("/dashboard")
    } else {
      setLoading(false)
    }
  }, [isAuthenticated, token, pathname, router, dispatch])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-900">
        <div className="flex flex-col items-center gap-3">
          <div className="h-9 w-9 animate-spin rounded-full border-3 border-cyan-600 border-t-transparent shadow-sm" />
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-slate-600">
            Loading System Session...
          </span>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
