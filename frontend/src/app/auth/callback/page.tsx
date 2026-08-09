"use client"

import { useEffect, useState, useRef, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAppDispatch } from "@/store/hooks"
import { loginSuccess } from "@/store/slices/authSlice"
import { api } from "@/utils/api"
import { profileService } from "@/services/profileService"
import { UserResponse } from "@/types/auth"
import Reveal from "@/components/animations/RevealOnScroll"
import PageTransition from "@/components/animations/PageTransition"
import { FiShield, FiAlertCircle } from "react-icons/fi"

function OAuthCallbackContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const dispatch = useAppDispatch()

  const [statusText, setStatusText] = useState("Authenticating with Google...")
  const [error, setError] = useState<string | null>(null)
  
  // React 18 Strict Mode idempotency guard
  const hasProcessed = useRef(false)

  useEffect(() => {
    if (hasProcessed.current) return

    const token = searchParams.get("token")
    const authError = searchParams.get("error")

    if (authError) {
      hasProcessed.current = true
      console.error("Authentication failure:", authError)
      setError("Google authentication failed or was cancelled.")
      setTimeout(() => {
        router.replace(`/login?error=${authError}`)
      }, 2000)
      return
    }

    if (!token) {
      if (!hasProcessed.current) {
        hasProcessed.current = true
        console.error("Authentication failure: missing token")
        setError("No authentication token was returned from Google login.")
        setTimeout(() => {
          router.replace("/login?error=missing_token")
        }, 2000)
      }
      return
    }

    hasProcessed.current = true
    processCallbackToken(token)
  }, [searchParams, router])

  const processCallbackToken = async (jwtToken: string) => {
    try {
      setStatusText("Verifying user identity & permissions...")

      // Store token using standard CBP localStorage key before API request
      if (typeof window !== "undefined") {
        localStorage.setItem("cbp-token", jwtToken)
      }

      // Fetch user profile from GET /api/v1/auth/me
      const userRes = await api.get<UserResponse>("/api/v1/auth/me")
      const userRole = (userRes.role || "").toUpperCase()

      console.info("User authenticated:", userRes.email || userRes.studentId)

      // Synchronize Redux authentication state (identical to normal login)
      dispatch(
        loginSuccess({
          token: jwtToken,
          studentId: userRes.studentId,
          name: userRes.name,
          role: userRes.role,
        })
      )

      console.info("OAuth login successful")

      setStatusText("Checking account profile status...")

      let redirectPath = "/student/dashboard"

      if (!userRes.studentId || userRes.studentId.trim() === "") {
        console.info("Profile setup required: studentId is missing")
        redirectPath = "/profile/setup?reason=incomplete_profile"
      } else if (userRole === "ROLE_ADMIN" || userRole === "ADMIN") {
        redirectPath = "/admin/dashboard"
      } else if (userRole === "ROLE_VOLUNTEER" || userRole === "VOLUNTEER") {
        redirectPath = "/volunteer/scanner"
      } else {
        // ROLE_STUDENT with existing studentId
        redirectPath = "/student/dashboard"
      }

      console.info("Redirecting user to:", redirectPath)
      setStatusText("Authentication complete! Redirecting...")

      // Cleanly replace URL state to navigate to role dashboard without leaving callback query params in history
      router.replace(redirectPath)
    } catch (err: any) {
      console.error("API authorization failure:", err?.message || err)
      setError("Failed to verify user session after Google login.")
      setTimeout(() => {
        router.replace("/login?error=session_error")
      }, 2000)
    }
  }

  if (error) {
    return (
      <div className="mx-auto max-w-md w-full text-center">
        <Reveal variant="scale">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-rose-50 border border-rose-200 text-rose-600 shadow-xl shadow-rose-600/10">
            <FiAlertCircle className="h-10 w-10" />
          </div>
        </Reveal>
        <Reveal delay={80}>
          <h1 className="mt-6 text-2xl font-extrabold text-slate-900">Authentication Error</h1>
        </Reveal>
        <Reveal delay={120}>
          <p className="mt-3 text-xs leading-relaxed text-rose-600 font-semibold">{error}</p>
        </Reveal>
        <p className="mt-4 text-[11px] text-slate-400">Redirecting to login page...</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md w-full text-center">
      <Reveal variant="scale">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-xl shadow-cyan-600/30">
          <FiShield className="h-10 w-10 animate-pulse" />
        </div>
      </Reveal>
      <Reveal delay={80}>
        <h1 className="mt-6 text-2xl font-extrabold text-slate-900">
          Google Sign-In <span className="gradient-text-cyan">Success</span>
        </h1>
      </Reveal>
      <Reveal delay={120}>
        <p className="mt-3 text-xs leading-relaxed text-slate-600 font-medium">{statusText}</p>
      </Reveal>
      <div className="mt-6 flex justify-center">
        <div className="h-6 w-6 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  )
}

export default function OAuthCallbackPage() {
  return (
    <PageTransition>
      <main className="min-h-screen bg-slate-50 text-slate-900 py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <Suspense
          fallback={
            <div className="text-center text-slate-500 text-xs font-semibold">
              Processing Google authentication callback...
            </div>
          }
        >
          <OAuthCallbackContent />
        </Suspense>
      </main>
    </PageTransition>
  )
}
