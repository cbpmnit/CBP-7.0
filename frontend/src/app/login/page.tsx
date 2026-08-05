"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAppDispatch } from "@/store/hooks"
import { loginSuccess, setAuthError } from "@/store/slices/authSlice"
import { api, ApiError } from "@/utils/api"
import Reveal from "@/components/animations/RevealOnScroll"
import PageTransition from "@/components/animations/PageTransition"

export default function LoginPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    studentId: "",
    password: "",
  })
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setErrorMsg(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)

    // Normalize studentId to lowercase
    const loginPayload = {
      studentId: formData.studentId.trim().toLowerCase(),
      password: formData.password,
    }

    try {
      // 1. Call login endpoint
      const data: any = await api.post("/api/v1/auth/login", loginPayload)
      
      // 2. Dispatch loginSuccess to Redux store (which also persists to localStorage)
      dispatch(
        loginSuccess({
          token: data.token,
          studentId: data.studentId,
          role: data.role,
          name: data.name,
        })
      )

      // 3. Immediately check if user profile exists
      try {
        await api.get("/api/v1/profile/me")
        // Profile exists, redirect to dashboard
        router.push("/dashboard")
      } catch (profileErr) {
        if (profileErr instanceof ApiError && profileErr.status === 404) {
          // Profile is missing, redirect to profile setup
          router.push("/profile")
        } else {
          // Fallback redirect to dashboard
          router.push("/dashboard")
        }
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMsg(err.message || "Invalid student ID or password")
        dispatch(setAuthError(err.message))
      } else {
        setErrorMsg("Connection to server failed. Please try again.")
        dispatch(setAuthError("Connection failed"))
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageTransition>
      <main className="min-h-screen bg-black text-gray-100 bg-grid-cyber flex items-center justify-center py-20 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="w-full max-w-md px-5 relative z-10">
          <Reveal>
            <div className="text-center mb-8">
              <span className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 px-4 py-1.5 text-xs font-bold text-cyan-300 uppercase tracking-widest backdrop-blur-md">
                CBP 7.0 Portal Login
              </span>
              <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Welcome <span className="gradient-text-cyan">Back</span>
              </h1>
              <p className="mt-2 text-sm text-gray-400">
                Log in to manage your registration and soft skills portal.
              </p>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="glass-card rounded-3xl p-8 border-cyan-500/30">
                <div className="space-y-6">
                  {errorMsg && (
                    <div className="p-4 rounded-xl border border-red-500/40 bg-red-500/10 text-red-400 text-sm font-semibold text-center">
                      {errorMsg}
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
                  </div>

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
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl neon-button-cyan py-4 text-sm font-extrabold uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Logging in..." : "Log In"}
              </button>

              <p className="text-center text-sm text-gray-400">
                Don't have an account?{" "}
                <Link href="/register" className="text-cyan-400 hover:text-cyan-300 transition underline">
                  Register here
                </Link>
              </p>
            </form>
          </Reveal>
        </div>
      </main>
    </PageTransition>
  )
}
