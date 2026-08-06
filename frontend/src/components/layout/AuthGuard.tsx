"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAppSelector } from "@/store/hooks"

const PUBLIC_ROUTES = ["/", "/login", "/register", "/registration"]
const PROTECTED_ROUTES = ["/dashboard", "/profile", "/payment", "/cbp", "/payment-status"]

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { isAuthenticated, token } = useAppSelector((state) => state.auth)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Wait for client-side hydration to prevent mismatch
    const storedToken = localStorage.getItem("cbp-token")
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
  }, [isAuthenticated, token, pathname, router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent shadow-[0_0_15px_#00f0ff]" />
          <span className="font-mono text-xs uppercase tracking-widest text-cyan-400">
            Initializing System...
          </span>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
