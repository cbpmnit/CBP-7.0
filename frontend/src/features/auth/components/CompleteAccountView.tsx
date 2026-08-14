"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { useAppDispatch } from "@/store/hooks"
import { loginSuccess } from "@/store/slices/authSlice"
import { api, ApiError } from "@/utils/api"
import { LoginResponse } from "../types"
import Reveal from "@/components/animations/RevealOnScroll"
import PageTransition from "@/components/animations/PageTransition"
import { FiUserCheck, FiLock, FiCheckCircle, FiAlertCircle, FiArrowRight, FiShield, FiUser } from "react-icons/fi"

export default function CompleteAccountView() {
  const router = useRouter()
  const dispatch = useAppDispatch()

  const [studentId, setStudentId] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const trimmedStudentId = studentId.trim()
    const trimmedPassword = password.trim()
    const trimmedConfirm = confirmPassword.trim()

    if (!trimmedStudentId) {
      setError("Please enter your official Student ID.")
      return
    }

    if (!trimmedPassword) {
      setError("Please create a password for credential login.")
      return
    }

    if (trimmedPassword.length < 6) {
      setError("Password must be at least 6 characters long.")
      return
    }

    if (trimmedPassword !== trimmedConfirm) {
      setError("Passwords do not match. Please verify your password entry.")
      return
    }

    setLoading(true)

    try {
      const response = await api.post<LoginResponse>("/api/v1/auth/complete-account", {
        studentId: trimmedStudentId,
        password: trimmedPassword,
        confirmPassword: trimmedConfirm,
      })

      if (response && response.token) {
        if (typeof window !== "undefined") {
          localStorage.setItem("cbp-token", response.token)
          if (response.studentId) localStorage.setItem("cbp-studentId", response.studentId)
          if (response.name) localStorage.setItem("cbp-name", response.name)
          if (response.role) localStorage.setItem("cbp-role", response.role)
          if (response.userId) localStorage.setItem("cbp-userId", response.userId)
        }

        dispatch(
          loginSuccess({
            token: response.token,
            userId: response.userId,
            studentId: response.studentId,
            name: response.name,
            role: response.role,
            permissions: Array.from(response.permissions || []),
          })
        )

        setSuccess(true)
        setTimeout(() => {
          if (response.profileCompleted) {
            router.replace("/dashboard")
          } else {
            router.replace("/profile")
          }
        }, 1200)
      } else {
        setError("Account setup failed. Please try again.")
      }
    } catch (err: any) {
      if (err instanceof ApiError) {
        setError(err.message || "Failed to complete account setup.")
      } else {
        setError("An unexpected error occurred. Please check your credentials and try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <PageTransition>
      <main className="min-h-screen bg-slate-50 text-slate-900 bg-grid-cyber py-12 sm:py-16 flex items-center justify-center p-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-md w-full">
          <Reveal variant="up">
            <div className="text-center mb-8">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-600/30 mb-4">
                <FiUserCheck className="h-7 w-7" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Complete Your <span className="gradient-text-cyan">Account Setup</span>
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 font-medium leading-relaxed max-w-sm mx-auto">
                Add your Student ID and password to link your Google login with credential authentication.
              </p>
            </div>
          </Reveal>

          <Reveal variant="up" delay={60}>
            <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl shadow-slate-200/60 space-y-6">
              <div className="flex items-center gap-3.5 pb-6 border-b border-slate-100">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-700">
                  <FiShield className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Student Credential Setup
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    MNIT Single Identity Linkage
                  </p>
                </div>
              </div>

              {error && (
                <div className="p-4 rounded-xl border border-red-200 bg-red-50 text-xs font-semibold text-red-600 text-center flex items-center justify-center gap-2">
                  <FiAlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-xs font-semibold text-emerald-700 text-center flex items-center justify-center gap-2">
                  <FiCheckCircle className="h-4 w-4 shrink-0" />
                  <span>Account setup complete! Redirecting...</span>
                </div>
              )}

              <div className="space-y-5">
                {/* Student ID */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
                    <FiUser className="text-cyan-600" />
                    STUDENT ID <span className="text-cyan-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="e.g. 2024UCH2200"
                    disabled={loading || success}
                    className="mt-2 block w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 font-mono uppercase tracking-wider transition duration-200 focus:bg-white focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 disabled:opacity-50"
                  />
                  <p className="mt-1.5 text-[11px] text-slate-500 font-medium">
                    Enter your official MNIT Student ID number.
                  </p>
                </div>

                {/* Create Password */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
                    <FiLock className="text-cyan-600" />
                    CREATE PASSWORD <span className="text-cyan-600">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    disabled={loading || success}
                    className="mt-2 block w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition duration-200 focus:bg-white focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 disabled:opacity-50"
                  />
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
                    <FiLock className="text-cyan-600" />
                    CONFIRM PASSWORD <span className="text-cyan-600">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your password"
                    disabled={loading || success}
                    className="mt-2 block w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition duration-200 focus:bg-white focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 disabled:opacity-50"
                  />
                </div>

                {/* Complete Setup Button */}
                <button
                  type="submit"
                  disabled={loading || success}
                  className="w-full rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white py-4 text-xs font-bold uppercase tracking-wider shadow-lg shadow-cyan-600/30 transition duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 flex items-center justify-center gap-2 pt-4"
                >
                  {loading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      <span>Complete Setup</span>
                      <FiArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </Reveal>
        </div>
      </main>
    </PageTransition>
  )
}
