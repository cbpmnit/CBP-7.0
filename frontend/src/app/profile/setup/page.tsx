"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { api, ApiError } from "@/utils/api"
import { useAppDispatch } from "@/store/hooks"
import { loginSuccess } from "@/store/slices/authSlice"
import { UserResponse } from "@/types/auth"
import Reveal from "@/components/animations/RevealOnScroll"
import PageTransition from "@/components/animations/PageTransition"
import { FiUser, FiMail, FiHash, FiPhone, FiArrowRight, FiShield, FiAlertCircle } from "react-icons/fi"

export default function ProfileSetupPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()

  const [currentUser, setCurrentUser] = useState<UserResponse | null>(null)
  const [studentId, setStudentId] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setFetching(true)
      const user = await api.get<UserResponse>("/api/v1/auth/me")
      setCurrentUser(user)

      if (user.studentId) {
        setStudentId(user.studentId)
      }
      if (user.phoneNumber) {
        setPhoneNumber(user.phoneNumber)
      }
    } catch (err: any) {
      console.error("Failed to load user profile:", err)
      setError("Please log in to complete your profile setup.")
      setTimeout(() => {
        router.replace("/login")
      }, 2000)
    } finally {
      setFetching(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!studentId.trim()) {
      setError("Student ID is required.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const updatedUser = await api.put<UserResponse>("/api/v1/auth/profile", {
        studentId: studentId.trim(),
        phoneNumber: phoneNumber.trim() || undefined,
      })

      const token = typeof window !== "undefined" ? localStorage.getItem("cbp-token") : null

      dispatch(
        loginSuccess({
          token: token || "",
          studentId: updatedUser.studentId,
          name: updatedUser.name,
          role: updatedUser.role,
        })
      )

      router.replace("/student/dashboard")
    } catch (err: any) {
      console.error("Profile update error:", err)
      if (err instanceof ApiError) {
        setError(err.message || "Failed to update profile. Student ID might already be registered.")
      } else {
        setError("An unexpected error occurred. Please try again.")
      }
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <PageTransition>
        <main className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center">
          <div className="text-center">
            <div className="h-8 w-8 border-3 border-cyan-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-xs font-semibold text-slate-600">Loading your Google profile details...</p>
          </div>
        </main>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <main className="min-h-screen bg-slate-50 text-slate-900 bg-grid-cyber py-12 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        <div className="mx-auto max-w-xl w-full">
          <Reveal variant="scale">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-xl shadow-cyan-600/30">
              <FiShield className="h-8 w-8" />
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div className="text-center mb-8">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                Complete Your <span className="gradient-text-cyan">Profile</span>
              </h1>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
                You signed in with Google. Please enter your official MNIT Student ID to activate your CBP account.
              </p>
            </div>
          </Reveal>

          <Reveal delay={120}>
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl shadow-slate-200/60">
              {error && (
                <div className="mb-6 p-4 rounded-xl border border-red-200 bg-red-50 text-xs font-semibold text-red-600 flex items-center gap-2">
                  <FiAlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Account Details Readonly Card */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1.5 font-medium">
                      <FiUser className="text-cyan-600" /> Name
                    </span>
                    <span className="font-bold text-slate-900">{currentUser?.name || "Google User"}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span className="flex items-center gap-1.5 font-medium">
                      <FiMail className="text-cyan-600" /> Email
                    </span>
                    <span className="font-bold text-slate-900">{currentUser?.email}</span>
                  </div>
                </div>

                {/* Student ID (Required) */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-700">
                    <FiHash className="text-cyan-600" />
                    MNIT Student ID <span className="text-cyan-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="e.g. 2024UCP1234"
                    className="mt-2 block w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition duration-200 focus:bg-white focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                  />
                  <p className="mt-1 text-[11px] text-slate-400">
                    Your official student registration ID (required for attendance and certificates).
                  </p>
                </div>

                {/* Phone Number (Optional) */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-700">
                    <FiPhone className="text-cyan-600" />
                    Phone Number <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="e.g. 9876543210"
                    className="mt-2 block w-full rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 transition duration-200 focus:bg-white focus:border-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-4 rounded-2xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white py-4 text-xs font-bold uppercase tracking-wider shadow-lg shadow-cyan-600/30 transition duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <>
                      <span>Save & Continue to Dashboard</span>
                      <FiArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </Reveal>
        </div>
      </main>
    </PageTransition>
  )
}
