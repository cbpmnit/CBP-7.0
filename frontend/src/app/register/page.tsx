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
