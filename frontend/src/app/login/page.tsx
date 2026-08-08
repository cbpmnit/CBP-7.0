"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAppDispatch } from "@/store/hooks"
import { loginSuccess } from "@/store/slices/authSlice"
import { api, ApiError } from "@/utils/api"
import { profileService } from "@/services/profileService"
import { LoginRequest, LoginResponse } from "@/types/auth"
import Reveal from "@/components/animations/RevealOnScroll"
import PageTransition from "@/components/animations/PageTransition"
import { FiUser, FiLock, FiArrowRight, FiShield, FiCheckCircle } from "react-icons/fi"

export default function LoginPage() {
  const router = useRouter()
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
      // 1. Call Backend Login API with dual identifier support
      const loginPayload: LoginRequest = {
        identifier: cleanIdentifier,
        studentId: cleanIdentifier,
        password: formData.password,
      }

      const response = await api.post<LoginResponse>("/api/v1/auth/login", loginPayload)

      // Handle Remember Me preference
      if (typeof window !== "undefined") {
        if (formData.rememberMe) {
          localStorage.setItem("cbp-saved-identifier", cleanIdentifier)
        } else {
          localStorage.removeItem("cbp-saved-identifier")
        }
      }

      // 2. Dispatch success state to Redux (saves to localStorage automatically)
      dispatch(
        loginSuccess({
          token: response.token,
          studentId: response.studentId,
          name: response.name,
          role: response.role,
        })
      )

      // 3. Determine redirect path based on authenticated user role
      let redirectPath = "/dashboard"
      const userRole = (response.role || "").toUpperCase()

      if (userRole === "ROLE_ADMIN" || userRole === "ADMIN") {
        redirectPath = "/admin/dashboard"
      } else if (userRole === "ROLE_VOLUNTEER" || userRole === "VOLUNTEER") {
        redirectPath = "/volunteer/scanner"
      } else {
        // ROLE_STUDENT: check profile completion
        try {
          const completion: any = await profileService.getCompletion()
          if (completion && completion.completed && completion.completionPercentage === 100) {
            redirectPath = "/dashboard"
          } else {
            redirectPath = "/profile"
          }
        } catch (err) {
          redirectPath = "/profile"
        }
      }

      setIsSubmitted(true)

      // 4. Redirect after brief delay to show successful transition card
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

  if (isSubmitted) {
    return (
      <PageTransition>
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
      </PageTransition>
    )
  }

  return (
    <PageTransition>
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
                    <div className="mb-5 p-4 rounded-xl border border-red-200 bg-red-50 text-xs font-semibold text-red-600 text-center">
                      {error}
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
    </PageTransition>
  )
}
