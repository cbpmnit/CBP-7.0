"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { api, ApiError } from "@/utils/api"
import Reveal from "@/components/animations/RevealOnScroll"
import PageTransition from "@/components/animations/PageTransition"
import { FiUser, FiMail, FiPhone, FiLock, FiArrowRight, FiShield, FiCheckCircle } from "react-icons/fi"

export default function RegisterPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    studentId: "",
    studentEmail: "",
    name: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [message, setMessage] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    if (errors[e.target.name]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[e.target.name]
        return next
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrors({})
    setMessage(null)

    if (formData.password !== formData.confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match" })
      setLoading(false)
      return
    }

    try {
      await api.post("/api/v1/auth/register", formData)
      setIsSuccess(true)
      setMessage("Account created successfully! Redirecting to login...")
      setTimeout(() => {
        router.push("/login")
      }, 1500)
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.errorData?.errors) {
          setErrors(err.errorData.errors)
        } else {
          setMessage(err.message || "Registration failed")
        }
      } else {
        setMessage("An unexpected error occurred. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleClick = () => {
    const backendUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:9900"
    window.location.href = `${backendUrl}/api/v1/auth/google`
  }

  if (isSuccess) {
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
                Registration <span className="gradient-text-cyan">Successful!</span>
              </h1>
            </Reveal>
            <Reveal delay={120}>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">
                Your CBP 7.0 student account has been created. Redirecting to login portal...
              </p>
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
        <section className="bg-gradient-to-b from-white to-slate-100/60 py-12 sm:py-16 border-b border-slate-200 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <Reveal variant="up">
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
                Create Your <span className="gradient-text-cyan">CBP 7.0</span> Account
              </h1>
            </Reveal>
            <Reveal delay={80}>
              <p className="mt-3 max-w-xl mx-auto text-sm sm:text-base text-slate-600 leading-relaxed">
                Register with your MNIT Student ID &amp; Email to access your student portal, workshop sessions, attendance, and official certificates.
              </p>
            </Reveal>
          </div>
        </section>

        {/* Registration Form Section */}
        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-xl px-4 sm:px-6">
            <Reveal variant="up">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl shadow-slate-200/60 transition-all duration-300">
                  <div className="flex items-center gap-3.5 mb-8 pb-6 border-b border-slate-100">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-600 to-blue-600 text-white text-base font-bold shadow-md shadow-cyan-600/30">
                      <FiShield className="h-6 w-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">
                        Student Account Creation
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        MNIT Jaipur CBP 7.0 Enrollment
                      </p>
                    </div>
                  </div>

                  {message && (
                    <div
                      className={`mb-5 p-4 rounded-xl border text-xs font-semibold text-center ${
                        message.includes("success")
                          ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                          : "bg-red-50 border-red-200 text-red-600"
                      }`}
                    >
                      {message}
                    </div>
                  )}

                  <div className="space-y-5">
                    {/* Student ID */}
                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        <FiUser className="text-cyan-600" />
                        Student ID <span className="text-cyan-600">*</span>
                      </label>
                      <input
                        type="text"
                        name="studentId"
                        required
                        value={formData.studentId}
                        onChange={handleChange}
                        className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition duration-200 focus:bg-white focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 font-mono"
                        placeholder="e.g. 2024UCH1190"
                      />
                      {errors.studentId && (
                        <p className="mt-1 text-xs text-red-600 font-medium">{errors.studentId}</p>
                      )}
                    </div>

                    {/* MNIT Email */}
                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        <FiMail className="text-cyan-600" />
                        MNIT Email Address <span className="text-cyan-600">*</span>
                      </label>
                      <input
                        type="email"
                        name="studentEmail"
                        required
                        value={formData.studentEmail}
                        onChange={handleChange}
                        className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition duration-200 focus:bg-white focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                        placeholder="e.g. student@mnit.ac.in"
                      />
                      {errors.email && (
                        <p className="mt-1 text-xs text-red-600 font-medium">{errors.email}</p>
                      )}
                      {errors.studentEmail && (
                        <p className="mt-1 text-xs text-red-600 font-medium">{errors.studentEmail}</p>
                      )}
                    </div>

                    {/* Full Name */}
                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        <FiUser className="text-cyan-600" />
                        Full Name <span className="text-cyan-600">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition duration-200 focus:bg-white focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                        placeholder="Enter your full name"
                      />
                      {errors.name && (
                        <p className="mt-1 text-xs text-red-600 font-medium">{errors.name}</p>
                      )}
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                        <FiPhone className="text-cyan-600" />
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition duration-200 focus:bg-white focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                        placeholder="e.g. 9876543210"
                      />
                      {errors.phoneNumber && (
                        <p className="mt-1 text-xs text-red-600 font-medium">{errors.phoneNumber}</p>
                      )}
                    </div>

                    {/* Password & Confirm Password Row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                          <FiLock className="text-cyan-600" />
                          Password <span className="text-cyan-600">*</span>
                        </label>
                        <input
                          type="password"
                          name="password"
                          required
                          value={formData.password}
                          onChange={handleChange}
                          className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition duration-200 focus:bg-white focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                          placeholder="••••••••"
                        />
                        {errors.password && (
                          <p className="mt-1 text-xs text-red-600 font-medium">{errors.password}</p>
                        )}
                      </div>

                      <div>
                        <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                          <FiLock className="text-cyan-600" />
                          Confirm Password <span className="text-cyan-600">*</span>
                        </label>
                        <input
                          type="password"
                          name="confirmPassword"
                          required
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition duration-200 focus:bg-white focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                          placeholder="••••••••"
                        />
                        {errors.confirmPassword && (
                          <p className="mt-1 text-xs text-red-600 font-medium">{errors.confirmPassword}</p>
                        )}
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full mt-2 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white py-4 text-xs font-bold uppercase tracking-wider shadow-lg shadow-cyan-600/30 transition duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        <>
                          <span>Create Account</span>
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

                    {/* Google OAuth Register/Login Button */}
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

            {/* Login Link */}
            <Reveal delay={120}>
              <div className="mt-6 text-center text-xs text-slate-600">
                Already have an account?{" "}
                <Link href="/login" className="font-bold text-cyan-700 hover:underline">
                  Login to portal
                </Link>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
    </PageTransition>
  )
}
