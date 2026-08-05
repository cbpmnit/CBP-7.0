"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { api, ApiError } from "@/utils/api"
import Reveal from "@/components/animations/RevealOnScroll"
import PageTransition from "@/components/animations/PageTransition"

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

    // Basic front-end check before sending
    if (formData.password !== formData.confirmPassword) {
      setErrors({ confirmPassword: "Passwords do not match" })
      setLoading(false)
      return
    }

    try {
      await api.post("/api/v1/auth/register", formData)
      setMessage("Account created successfully! Redirecting to login...")
      setTimeout(() => {
        router.push("/login")
      }, 2000)
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

  return (
    <PageTransition>
      <main className="min-h-screen bg-black text-gray-100 bg-grid-cyber flex items-center justify-center py-20 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="w-full max-w-xl px-5 relative z-10">
          <Reveal>
            <div className="text-center mb-8">
              <span className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 px-4 py-1.5 text-xs font-bold text-cyan-300 uppercase tracking-widest backdrop-blur-md">
                CBP 7.0 Account creation
              </span>
              <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Create your <span className="gradient-text-cyan">Account</span>
              </h1>
              <p className="mt-2 text-sm text-gray-400">
                Register to start your soft skills journey at MNIT Jaipur.
              </p>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="glass-card rounded-3xl p-8 border-cyan-500/30">
                <div className="space-y-6">
                  {message && (
                    <div
                      className={`p-4 rounded-xl border text-sm font-semibold text-center ${
                        message.includes("success")
                          ? "bg-cyan-500/10 border-cyan-500/40 text-cyan-300 shadow-[0_0_15px_rgba(0,240,255,0.15)]"
                          : "bg-red-500/10 border-red-500/40 text-red-400"
                      }`}
                    >
                      {message}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-cyan-300">
                      Student ID (Roll Number) <span className="text-cyan-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="studentId"
                      required
                      value={formData.studentId}
                      onChange={handleChange}
                      className="mt-2 block w-full rounded-xl bg-black/60 border border-white/10 px-4 py-3 text-sm text-white transition duration-200 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                      placeholder="e.g. 2023UCP1234"
                    />
                    {errors.studentId && (
                      <p className="mt-1 text-xs text-red-400">{errors.studentId}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-cyan-300">
                      MNIT Email Address <span className="text-cyan-400">*</span>
                    </label>
                    <input
                      type="email"
                      name="studentEmail"
                      required
                      value={formData.studentEmail}
                      onChange={handleChange}
                      className="mt-2 block w-full rounded-xl bg-black/60 border border-white/10 px-4 py-3 text-sm text-white transition duration-200 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                      placeholder="e.g. student@mnit.ac.in"
                    />
                    {errors.email && (
                      <p className="mt-1 text-xs text-red-400">{errors.email}</p>
                    )}
                    {errors.studentEmail && (
                      <p className="mt-1 text-xs text-red-400">{errors.studentEmail}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-cyan-300">
                      Full Name <span className="text-cyan-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="mt-2 block w-full rounded-xl bg-black/60 border border-white/10 px-4 py-3 text-sm text-white transition duration-200 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                      placeholder="Enter your full name"
                    />
                    {errors.name && (
                      <p className="mt-1 text-xs text-red-400">{errors.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-cyan-300">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      className="mt-2 block w-full rounded-xl bg-black/60 border border-white/10 px-4 py-3 text-sm text-white transition duration-200 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                      placeholder="e.g. 9876543210"
                    />
                    {errors.phoneNumber && (
                      <p className="mt-1 text-xs text-red-400">{errors.phoneNumber}</p>
                    )}
                  </div>

                  <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-cyan-300">
                        Password <span className="text-cyan-400">*</span>
                      </label>
                      <input
                        type="password"
                        name="password"
                        required
                        value={formData.password}
                        onChange={handleChange}
                        className="mt-2 block w-full rounded-xl bg-black/60 border border-white/10 px-4 py-3 text-sm text-white transition duration-200 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                        placeholder="••••••••"
                      />
                      {errors.password && (
                        <p className="mt-1 text-xs text-red-400">{errors.password}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-cyan-300">
                        Confirm Password <span className="text-cyan-400">*</span>
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        required
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="mt-2 block w-full rounded-xl bg-black/60 border border-white/10 px-4 py-3 text-sm text-white transition duration-200 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                        placeholder="••••••••"
                      />
                      {errors.confirmPassword && (
                        <p className="mt-1 text-xs text-red-400">{errors.confirmPassword}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl neon-button-cyan py-4 text-sm font-extrabold uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Registering..." : "Create Account"}
              </button>

              <p className="text-center text-sm text-gray-400">
                Already have an account?{" "}
                <Link href="/login" className="text-cyan-400 hover:text-cyan-300 transition underline">
                  Login here
                </Link>
              </p>
            </form>
          </Reveal>
        </div>
      </main>
    </PageTransition>
  )
}
