"use client"

import React, { useState, useEffect, Suspense } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useAppDispatch } from "@/store/hooks"
import { loginSuccess } from "@/store/slices/authSlice"
import { api, ApiError } from "@/utils/api"
import { profileService } from "@/services/profileService"
import { LoginRequest, LoginResponse } from "../types"
import Reveal from "@/components/animations/RevealOnScroll"
import PageTransition from "@/components/animations/PageTransition"
import { FiUser, FiLock, FiArrowRight, FiShield, FiCheckCircle, FiAlertCircle } from "react-icons/fi"

function LoginFormContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const dispatch = useAppDispatch()
  
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
    rememberMe: false,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedIdentifier =
        localStorage.getItem("cbp-saved-identifier") ||
        localStorage.getItem("cbp-studentId") ||
        ""
      if (savedIdentifier) {
        setFormData((prev) => ({
          ...prev,
          identifier: savedIdentifier,
          rememberMe: true,
        }))
      }
    }
  }, [])

  useEffect(() => {
    const errorParam = searchParams.get("error")
    if (errorParam) {
      switch (errorParam) {
        case "google_cancelled":
        case "oauth_cancelled":
          setError("Google sign-in was cancelled.")
          break
        case "oauth_provider_error":
        case "google_failed":
        case "oauth_failed":
          setError("Google authentication is temporarily unavailable.")
          break
        case "oauth_database_error":
          setError("Unable to complete sign-in. Please try again.")
          break
        case "oauth_account_creation_failed":
        case "account_creation_failed":
          setError("Unable to create your account.")
          break
        case "oauth_token_generation_failed":
        case "session_failed":
        case "session_error":
          setError("Login completed but session creation failed.")
          break
        case "missing_token":
          setError("Authentication response did not contain a valid session token.")
          break
        case "oauth_email_missing":
        case "email_missing":
          setError("Google account did not provide an email address.")
          break
        case "oauth_unknown_error":
        case "oauth_processing_failed":
          setError("Something went wrong. Please try again.")
          break
        default:
          setError("Google login failed. Please try again.")
          break
      }
    }
  }, [searchParams])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
    if (error) {
      setError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const cleanIdentifier = formData.identifier.trim()
    if (!cleanIdentifier) {
      setError("Student ID or Email Address is required")
      setLoading(false)
      return
    }
    if (!formData.password) {
      setError("Password is required")
      setLoading(false)
      return
    }

    try {
      const loginPayload: LoginRequest = {
        identifier: cleanIdentifier,
        studentId: cleanIdentifier,
        password: formData.password,
      }

      const response = await api.post<LoginResponse>("/api/v1/auth/login", loginPayload)

      if (typeof window !== "undefined") {
        if (formData.rememberMe) {
          localStorage.setItem("cbp-saved-identifier", cleanIdentifier)
        } else {
          localStorage.removeItem("cbp-saved-identifier")
        }
      }

      dispatch(
        loginSuccess({
          token: response.token,
          studentId: response.studentId,
          name: response.name,
          role: response.role,
          permissions: response.permissions || [],
        })
      )

      let redirectPath = "/dashboard"
      const userRole = (response.role || "").toUpperCase()

      if (userRole === "ROLE_ADMIN" || userRole === "ADMIN") {
        redirectPath = "/admin/dashboard"
      } else if (userRole === "ROLE_VOLUNTEER" || userRole === "VOLUNTEER") {
        redirectPath = "/volunteer/dashboard"
      } else {
        try {
          const completion: any = await profileService.getCompletion()
          if (completion && completion.completed && completion.completionPercentage === 100) {
            redirectPath = "/dashboard"
          } else {
            redirectPath = "/profile"
          }
        } catch {
          redirectPath = "/profile"
        }
      }

      setIsSubmitted(true)

      setTimeout(() => {
        router.push(redirectPath)
      }, 1200)
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 400 && err.errorData?.errors) {
          const firstErrKey = Object.keys(err.errorData.errors)[0]
          setError(err.errorData.errors[firstErrKey] || "Invalid credentials. Please check your Student ID/email and password.")
        } else if (err.status === 401) {
          setError("Invalid credentials. Please check your Student ID/email and password.")
        } else if (err.status === 403) {
          setError("Access denied. Your account is disabled or unauthorized.")
        } else {
          setError(err.message || "Invalid credentials. Please check your Student ID/email and password.")
        }
      } else {
        setError("Invalid credentials. Please check your Student ID/email and password.")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleClick = () => {
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:9900"
    window.location.href = `${backendUrl}/api/v1/auth/google`
  }

  if (isSubmitted) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-900 py-16 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="mx-auto max-w-md w-full text-center">
          <Reveal variant="scale">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-xl shadow-cyan-600/30">
              <FiCheckCircle className="h-10 w-10" />
            </div>
          </Reveal>
          <Reveal delay={80}>
            <h1 className="mt-6 text-3xl font-extrabold text-slate-900">
              Login <span className="gradient-text-cyan">Successful!</span>
            </h1>
          </Reveal>
          <Reveal delay={120}>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Welcome back! You have successfully logged into the CBP 7.0 Portal.
            </p>
          </Reveal>
          <Reveal delay={160}>
            <div className="mt-8 bg-white rounded-3xl p-6 text-left border border-slate-200 shadow-xl shadow-slate-200/50">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700">
                  <FiShield className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Logged in as</p>
                  <p className="text-sm font-bold text-slate-900">{formData.identifier || "User"}</p>
                </div>
              </div>
            </div>
          </Reveal>
          <Reveal delay={200}>
            <Link
              href="/dashboard"
              className="mt-8 inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-8 py-4 text-sm font-bold uppercase tracking-wider shadow-lg shadow-cyan-600/30 transition duration-300 transform hover:-translate-y-0.5"
            >
              Go to Dashboard
            </Link>
          </Reveal>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 bg-grid-cyber">
      {/* Header Hero Section */}
      <section className="bg-gradient-to-b from-white to-slate-100/60 py-16 sm:py-20 border-b border-slate-200 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <Reveal variant="up">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Login to <span className="gradient-text-cyan">CBP 7.0</span>
            </h1>
          </Reveal>
          <Reveal delay={80}>
            <p className="mt-3.5 max-w-xl mx-auto text-sm sm:text-base text-slate-600 leading-relaxed">
              Enter your Student ID or Email Address and Password to access your portal, attendance records, and certificates.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Login Form Section */}
      <section className="py-12 sm:py-16">
        <div className="mx-auto max-w-md px-4 sm:px-6">
          <Reveal variant="up">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl shadow-slate-200/60 transition-all duration-300">
                <div className="flex items-center gap-3.5 mb-8 pb-6 border-b border-slate-100">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-600 to-blue-600 text-white text-base font-bold shadow-md shadow-cyan-600/30">
                    <FiShield className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">
                      Account Portal
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      MNIT Jaipur Single Sign-On
                    </p>
                  </div>
                </div>

                {error && (
                  <div className="mb-5 p-4 rounded-xl border border-red-200 bg-red-50 text-xs font-semibold text-red-600 text-center flex items-center justify-center gap-2">
                    <FiAlertCircle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="space-y-5">
                  {/* Student ID / Email */}
                  <div>
                    <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
                      <FiUser className="text-cyan-600" />
                      STUDENT ID / EMAIL <span className="text-cyan-600">*</span>
                    </label>
                    <input
                      type="text"
                      name="identifier"
                      required
                      value={formData.identifier}
                      onChange={handleChange}
                      className="mt-2 block w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition duration-200 focus:bg-white focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                      placeholder="Enter Student ID or Email Address"
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
                        <FiLock className="text-cyan-600" />
                        PASSWORD <span className="text-cyan-600">*</span>
                      </label>
                      <Link
                        href="/forgot-password"
                        className="text-[11px] font-semibold text-cyan-700 hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <input
                      type="password"
                      name="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="mt-2 block w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition duration-200 focus:bg-white focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                      placeholder="••••••••"
                    />
                  </div>

                  {/* Remember me */}
                  <div className="flex items-center justify-between text-xs pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                      <input
                        type="checkbox"
                        name="rememberMe"
                        checked={formData.rememberMe}
                        onChange={handleChange}
                        className="h-4 w-4 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                      />
                      <span>Remember my Student ID / Email</span>
                    </label>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white py-4 text-xs font-bold uppercase tracking-wider shadow-lg shadow-cyan-600/30 transition duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <>
                        <span>Login to Portal</span>
                        <FiArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>

                  {/* Divider */}
                  <div className="relative my-4 text-center">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200" />
                    </div>
                    <span className="relative bg-white px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Or continue with
                    </span>
                  </div>

                  {/* Google OAuth Login Button */}
                  <button
                    type="button"
                    onClick={handleGoogleClick}
                    className="w-full rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-800 py-3.5 px-4 text-xs font-bold transition duration-200 flex items-center justify-center gap-3 shadow-sm hover:shadow"
                  >
                    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Continue with Google</span>
                  </button>
                </div>
              </div>
            </form>
          </Reveal>

          {/* Registration Hint */}
          <Reveal delay={120}>
            <div className="mt-6 text-center text-xs text-slate-600">
              Don&apos;t have an account yet?{" "}
              <Link href="/register" className="font-bold text-cyan-700 hover:underline">
                Register here
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  )
}

export default function LoginForm() {
  return (
    <PageTransition>
      <Suspense
        fallback={
          <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 text-xs font-semibold">
            Loading portal login...
          </div>
        }
      >
        <LoginFormContent />
      </Suspense>
    </PageTransition>
  )
}
