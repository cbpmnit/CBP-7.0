"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { api, ApiError } from "@/utils/api"
import Reveal from "@/components/animations/RevealOnScroll"
import PageTransition from "@/components/animations/PageTransition"
import {
  FiUser,
  FiMail,
  FiHash,
  FiPhone,
  FiCheckCircle,
  FiArrowRight,
  FiLock,
} from "react-icons/fi"

type Step = "form" | "success"

export default function RegistrationPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>("form")
  const [formData, setFormData] = useState({
    studentId: "",
    studentEmail: "",
    name: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [message, setMessage] = useState<string | null>(null)

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
      setStep("success")
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

  if (step === "success") {
    return (
      <PageTransition>
        <main className="min-h-screen bg-slate-50 text-slate-900 py-16 px-4 sm:px-6 lg:px-8">
          <section className="flex min-h-[65vh] items-center justify-center">
            <div className="mx-auto max-w-xl w-full text-center">
              <Reveal variant="scale">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-xl shadow-cyan-600/30">
                  <FiCheckCircle className="h-10 w-10" />
                </div>
              </Reveal>
              <Reveal delay={80}>
                <h1 className="mt-6 text-3xl font-extrabold text-slate-900 sm:text-4xl">
                  Registration <span className="gradient-text-cyan">Successful!</span>
                </h1>
              </Reveal>
              <Reveal delay={120}>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  Welcome, <strong className="text-cyan-700 font-semibold">{formData.name}</strong>!
                  Your registration for CBP 7.0 has been received. A confirmation
                  email will be sent to{" "}
                  <strong className="text-cyan-700 font-semibold">{formData.studentEmail}</strong> with
                  the program schedule, payment details, and further instructions.
                </p>
              </Reveal>
              <Reveal delay={160}>
                <div className="mt-8 bg-white rounded-3xl p-6 sm:p-8 text-left border border-slate-200 shadow-xl shadow-slate-200/50">
                  <p className="text-xs font-bold uppercase tracking-widest text-cyan-700 mb-4 flex items-center gap-2">
                    Registration Summary
                  </p>
                  <dl className="space-y-3.5 text-sm">
                    {[
                      ["Full Name", formData.name],
                      ["MNIT Email", formData.studentEmail],
                      ["Student ID", formData.studentId],
                      ["Phone Number", formData.phoneNumber || "Not provided"],
                    ].map(([label, value]) => (
                      <div key={label} className="flex justify-between items-center gap-4 border-b border-slate-100 pb-2.5">
                        <dt className="text-slate-500 text-xs font-medium uppercase tracking-wider">{label}</dt>
                        <dd className="font-semibold text-slate-900 text-right">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </Reveal>
              <Reveal delay={200}>
                <Link
                  href="/login"
                  className="mt-8 inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-8 py-4 text-sm font-semibold uppercase tracking-wider shadow-lg shadow-cyan-600/30 transition duration-300 transform hover:-translate-y-0.5"
                >
                  Proceed to Login
                </Link>
              </Reveal>
            </div>
          </section>
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
                Register for <span className="gradient-text-cyan">CBP 7.0</span>
              </h1>
            </Reveal>
            <Reveal delay={80}>
              <p className="mt-3.5 max-w-xl mx-auto text-sm sm:text-base text-slate-600 leading-relaxed">
                Fill in your official details below to secure your spot in the 5-day
                Capacity Building Program at MNIT Jaipur.
              </p>
            </Reveal>
          </div>
        </section>

        {/* Form Container Section */}
        <section className="py-12 sm:py-16">
          <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">
            <Reveal variant="up">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl shadow-slate-200/60 transition-all duration-300">
                  <div className="flex items-center gap-3.5 mb-8 pb-6 border-b border-slate-100">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-600 to-blue-600 text-white text-base font-bold shadow-md shadow-cyan-600/30">
                      1
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">
                        Student Information
                      </h2>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Please use your official MNIT credentials.
                      </p>
                    </div>
                  </div>

                  {message && (
                    <div className="mb-5 p-4 rounded-xl border border-red-200 bg-red-50 text-xs font-semibold text-red-600 text-center">
                      {message}
                    </div>
                  )}

                  <div className="space-y-5">
                    {/* Full Name */}
                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-700">
                        <FiUser className="text-cyan-600" />
                        Full Name <span className="text-cyan-600">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="mt-2 block w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition duration-200 focus:bg-white focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                        placeholder="Enter your full name as per records"
                      />
                      {errors.name && (
                        <p className="mt-1 text-xs text-red-500">{errors.name}</p>
                      )}
                    </div>

                    {/* Email & Student ID Grid */}
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-700">
                          <FiMail className="text-cyan-600" />
                          MNIT Email <span className="text-cyan-600">*</span>
                        </label>
                        <input
                          type="email"
                          name="studentEmail"
                          required
                          value={formData.studentEmail}
                          onChange={handleChange}
                          className="mt-2 block w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition duration-200 focus:bg-white focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                          placeholder="you@mnit.ac.in"
                        />
                        {errors.studentEmail && (
                          <p className="mt-1 text-xs text-red-500">{errors.studentEmail}</p>
                        )}
                      </div>

                      <div>
                        <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-700">
                          <FiHash className="text-cyan-600" />
                          Student ID <span className="text-cyan-600">*</span>
                        </label>
                        <input
                          type="text"
                          name="studentId"
                          required
                          value={formData.studentId}
                          onChange={handleChange}
                          className="mt-2 block w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition duration-200 focus:bg-white focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                          placeholder="e.g. 2024UCPXXXX"
                        />
                        {errors.studentId && (
                          <p className="mt-1 text-xs text-red-500">{errors.studentId}</p>
                        )}
                      </div>
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-700">
                        <FiPhone className="text-cyan-600" />
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        className="mt-2 block w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition duration-200 focus:bg-white focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                        placeholder="e.g. 9876543210"
                      />
                      {errors.phoneNumber && (
                        <p className="mt-1 text-xs text-red-500">{errors.phoneNumber}</p>
                      )}
                    </div>

                    {/* Password & Confirm Password Grid */}
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div>
                        <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-700">
                          <FiLock className="text-cyan-600" />
                          Password <span className="text-cyan-600">*</span>
                        </label>
                        <input
                          type="password"
                          name="password"
                          required
                          value={formData.password}
                          onChange={handleChange}
                          className="mt-2 block w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition duration-200 focus:bg-white focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                          placeholder="••••••••"
                        />
                        {errors.password && (
                          <p className="mt-1 text-xs text-red-500">{errors.password}</p>
                        )}
                      </div>

                      <div>
                        <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-700">
                          <FiLock className="text-cyan-600" />
                          Confirm Password <span className="text-cyan-600">*</span>
                        </label>
                        <input
                          type="password"
                          name="confirmPassword"
                          required
                          value={formData.confirmPassword}
                          onChange={handleChange}
                          className="mt-2 block w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition duration-200 focus:bg-white focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                          placeholder="••••••••"
                        />
                        {errors.confirmPassword && (
                          <p className="mt-1 text-xs text-red-500">{errors.confirmPassword}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white py-4 text-sm font-bold uppercase tracking-wider shadow-lg shadow-cyan-600/30 transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50"
                >
                  <span>{loading ? "Registering..." : "Complete Registration"}</span>
                  <FiArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </button>

                <p className="text-center text-xs text-slate-500">
                  By registering, you agree to the official terms and conditions of the
                  CBP 7.0 program at MNIT Jaipur.
                </p>
              </form>
            </Reveal>
          </div>
        </section>
      </main>
    </PageTransition>
  )
}
