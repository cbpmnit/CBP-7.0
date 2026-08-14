"use client"

import React, { useState } from "react"
import { useAppDispatch, useAppSelector } from "@/store/hooks"
import { authApi } from "@/features/auth/services/authApi"
import { loginSuccess } from "@/store/slices/authSlice"
import PageTransition from "@/components/animations/PageTransition"
import Reveal from "@/components/animations/RevealOnScroll"
import { ApiError } from "@/utils/api"
import {
  FiShield,
  FiLock,
  FiCheckCircle,
  FiAlertCircle,
  FiArrowRight,
  FiKey,
  FiMail,
  FiUser,
  FiCheck,
  FiGlobe,
} from "react-icons/fi"

export default function AccountSettingsView() {
  const dispatch = useAppDispatch()
  const auth = useAppSelector((state) => state.auth)

  // Security Form States (Create Password vs Change Password)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Handle Password Setup (For Google users creating first password)
  const handleSetupPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)

    const p = newPassword.trim()
    const cp = confirmPassword.trim()

    if (!p) {
      setError("Please enter a new password.")
      return
    }
    if (p.length < 6) {
      setError("Password must be at least 6 characters long.")
      return
    }
    if (p !== cp) {
      setError("Passwords do not match.")
      return
    }

    setLoading(true)
    try {
      const response = await authApi.setupPassword({
        password: p,
        confirmPassword: cp,
      })

      if (response && response.token) {
        if (typeof window !== "undefined") {
          localStorage.setItem("cbp-token", response.token)
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

        setSuccessMessage("Password created successfully. You can now login using your Student ID.")
        setNewPassword("")
        setConfirmPassword("")
      }
    } catch (err: any) {
      if (err instanceof ApiError) {
        setError(err.message || "Failed to create password.")
      } else {
        setError(err?.message || "An unexpected error occurred.")
      }
    } finally {
      setLoading(false)
    }
  }

  // Handle Change Password (For users with existing password)
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)

    const curr = currentPassword.trim()
    const p = newPassword.trim()
    const cp = confirmPassword.trim()

    if (!curr) {
      setError("Current password is required.")
      return
    }
    if (!p) {
      setError("New password is required.")
      return
    }
    if (p.length < 6) {
      setError("New password must be at least 6 characters long.")
      return
    }
    if (p !== cp) {
      setError("Passwords do not match.")
      return
    }

    setLoading(true)
    try {
      const msg = await authApi.changePassword({
        currentPassword: curr,
        newPassword: p,
        confirmPassword: cp,
      })

      setSuccessMessage(typeof msg === "string" ? msg : "Password updated successfully.")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err: any) {
      if (err instanceof ApiError) {
        setError(err.message || "Current password is incorrect.")
      } else {
        setError(err?.message || "Failed to update password.")
      }
    } finally {
      setLoading(false)
    }
  }

  const hasPassword = auth.accountSetupCompleted === true

  return (
    <PageTransition>
      <main className="min-h-screen bg-slate-50 text-slate-900 pb-16 pt-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header Section */}
          <Reveal>
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs font-extrabold uppercase tracking-wider mb-3">
                <FiShield className="text-cyan-600" /> Settings &amp; Security
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
                Account Settings
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
                Manage your authentication, password, and account security preferences.
              </p>
            </div>
          </Reveal>

          {/* Card 1: Account Information & Connected Identity */}
          <Reveal delay={40}>
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-center gap-3.5 pb-5 border-b border-slate-100">
                <div className="p-3 rounded-2xl bg-slate-100 text-slate-700">
                  <FiShield className="text-lg" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Account Identity &amp; Security Status
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Your authenticated credentials and login connection details
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Registered Identifier */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-white text-cyan-600 shadow-xs mt-0.5">
                    <FiUser className="text-base" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Student ID
                    </span>
                    <p className="text-sm font-extrabold text-slate-900 font-mono mt-0.5">
                      {auth.studentId || "Not assigned"}
                    </p>
                  </div>
                </div>

                {/* Account Role */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-white text-cyan-600 shadow-xs mt-0.5">
                    <FiShield className="text-base" />
                  </div>
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Account Role
                    </span>
                    <p className="text-sm font-extrabold text-slate-900 uppercase mt-0.5">
                      {auth.role || "STUDENT"}
                    </p>
                  </div>
                </div>

                {/* Connected Login Methods */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-white text-blue-600 shadow-xs mt-0.5">
                    <FiGlobe className="text-base" />
                  </div>
                  <div className="flex-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Google OAuth Authentication
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-extrabold">
                        <FiCheck className="text-xs" /> Connected
                      </span>
                    </div>
                  </div>
                </div>

                {/* Password Credential Status */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-white text-emerald-600 shadow-xs mt-0.5">
                    <FiKey className="text-base" />
                  </div>
                  <div className="flex-1">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Student ID Credential Login
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      {hasPassword ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-extrabold">
                          <FiCheck className="text-xs" /> Password Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-extrabold">
                          Password Pending
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          {/* Card 2: Security & Password Management */}
          <Reveal delay={80}>
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex items-start gap-4 pb-4 border-b border-slate-100">
                <div className="p-3.5 rounded-2xl bg-cyan-50 border border-cyan-200 text-cyan-700 shrink-0">
                  <FiKey className="text-xl" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {hasPassword ? "Change Account Password" : "Create Student ID Login Password"}
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                    {hasPassword
                      ? "Update your password for Student ID credential authentication."
                      : "Create a password to enable Student ID login alongside Google authentication."}
                  </p>
                </div>
              </div>

              {error && (
                <div className="rounded-xl bg-rose-50 border border-rose-200 p-4 text-xs font-bold text-rose-700 flex items-start gap-2.5">
                  <FiAlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {successMessage && (
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-xs font-bold text-emerald-800 flex items-start gap-2.5">
                  <FiCheckCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* FORM 1: Change Password Form */}
              {hasPassword ? (
                <form onSubmit={handleChangePassword} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                      Current Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        required
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password"
                        disabled={loading}
                        className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-xs text-slate-900 focus:border-cyan-600 focus:bg-white focus:outline-none font-medium disabled:opacity-50 transition"
                      />
                      <FiLock className="absolute right-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                      New Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Minimum 6 characters"
                        disabled={loading}
                        className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-xs text-slate-900 focus:border-cyan-600 focus:bg-white focus:outline-none font-medium disabled:opacity-50 transition"
                      />
                      <FiLock className="absolute right-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                      Confirm New Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter new password"
                        disabled={loading}
                        className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-xs text-slate-900 focus:border-cyan-600 focus:bg-white focus:outline-none font-medium disabled:opacity-50 transition"
                      />
                      <FiLock className="absolute right-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-700 hover:bg-cyan-800 text-white px-6 py-3.5 text-xs font-extrabold uppercase tracking-widest shadow-xs transition disabled:opacity-50 mt-2"
                  >
                    {loading ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Updating Password...</span>
                      </>
                    ) : (
                      <>
                        <span>Update Password</span>
                        <FiArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* FORM 2: Create Password Form */
                <form onSubmit={handleSetupPassword} className="space-y-5">
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold leading-relaxed">
                    Setting a password allows you to log in using your <strong>Student ID</strong> in addition to <strong>Google OAuth</strong>. Both login methods will access the exact same account.
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                      New Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Minimum 6 characters"
                        disabled={loading}
                        className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-xs text-slate-900 focus:border-cyan-600 focus:bg-white focus:outline-none font-medium disabled:opacity-50 transition"
                      />
                      <FiLock className="absolute right-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                      Confirm Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        disabled={loading}
                        className="w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-xs text-slate-900 focus:border-cyan-600 focus:bg-white focus:outline-none font-medium disabled:opacity-50 transition"
                      />
                      <FiLock className="absolute right-3.5 top-3.5 h-4 w-4 text-slate-400" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white px-6 py-3.5 text-xs font-extrabold uppercase tracking-widest shadow-xs transition disabled:opacity-50 mt-2"
                  >
                    {loading ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Creating Password...</span>
                      </>
                    ) : (
                      <>
                        <span>Create Password</span>
                        <FiArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </Reveal>
        </div>
      </main>
    </PageTransition>
  )
}
