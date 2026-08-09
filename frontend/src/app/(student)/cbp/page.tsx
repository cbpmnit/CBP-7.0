"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { cbpService } from "@/services/cbpService"
import { profileService } from "@/services/profileService"
import { CbpRegistrationDetailResponse } from "@/types/cbp"
import PageTransition from "@/components/animations/PageTransition"
import {
  FiFileText,
  FiCheckCircle,
  FiArrowLeft,
  FiClock,
  FiBookmark,
  FiAward,
  FiArrowRight,
  FiAlertCircle,
  FiUserCheck,
} from "react-icons/fi"

export default function CbpPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [registration, setRegistration] = useState<CbpRegistrationDetailResponse | null>(null)

  useEffect(() => {
    fetchRegistrationDetails()
  }, [])

  const fetchRegistrationDetails = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await cbpService.getMyRegistration()
      setRegistration(data)
    } catch (err: any) {
      if (err?.status !== 404 && err?.message?.indexOf("No CBP registration") === -1) {
        setError(err?.message || "Failed to retrieve registration status.")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async () => {
    setActionLoading(true)
    setError(null)

    try {
      // 1. Verify profile completion before triggering backend registration
      const comp = await profileService.getCompletion().catch(() => null)
      if (comp && (!comp.completed || comp.completionPercentage < 100)) {
        setError("Your profile information is incomplete. Redirecting to complete your profile...")
        setTimeout(() => {
          router.push("/profile")
        }, 1500)
        return
      }

      // 2. Submit CBP registration
      const response = await cbpService.register()
      if (response) {
        // Immediately load detail view from returned response or backend query
        await fetchRegistrationDetails()
      }
    } catch (err: any) {
      const msg = err?.message || ""
      if (msg.toLowerCase().includes("profile") || err?.status === 400 || err?.status === 422) {
        setError("Profile information incomplete. Please complete your profile before registering.")
        setTimeout(() => {
          router.push("/profile")
        }, 1500)
      } else {
        setError(msg || "Failed to submit CBP registration. Please verify your profile.")
      }
    } finally {
      setActionLoading(false)
    }
  }

  // Defensive Helper field extraction
  const getFieldValue = (field: "studentId" | "firstName" | "lastName" | "email" | "course" | "branch") => {
    if (!registration) return null
    const directVal = registration[field]
    const profileVal = registration.profile?.[field]
    return directVal || profileVal || null
  }

  const studentId = getFieldValue("studentId") || "Profile information incomplete"
  const firstName = getFieldValue("firstName") || ""
  const lastName = getFieldValue("lastName") || ""
  const fullName = [firstName, lastName].filter(Boolean).join(" ") || "Profile information incomplete"
  const course = getFieldValue("course")
  const branch = getFieldValue("branch")
  const courseBranch = course && branch ? `${course} - ${branch}` : course || branch || "Profile information incomplete"
  const email = getFieldValue("email") || "Profile information incomplete"

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent shadow-[0_0_15px_#00f0ff]" />
          <span className="font-mono text-xs uppercase tracking-widest text-cyan-400">
            Checking Registration Status...
          </span>
        </div>
      </div>
    )
  }

  const isConfirmed = registration?.registrationStatus === "REGISTERED" || registration?.paymentCompleted

  return (
    <PageTransition>
      <main className="min-h-screen bg-slate-50 text-slate-900 py-10 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center justify-between mb-8">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 px-4 py-2 text-xs font-semibold uppercase tracking-wider transition shadow-sm"
            >
              <FiArrowLeft /> Dashboard
            </Link>
            <span className="inline-flex items-center gap-2 rounded-full bg-cyan-50 border border-cyan-200 px-4 py-1 text-xs font-bold text-cyan-800 uppercase tracking-wider">
              Program Registration
            </span>
          </div>

          <div className="text-center mb-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-50 border border-cyan-200 text-cyan-700 shadow-sm mb-4">
              <FiFileText className="text-3xl" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Capacity Building Program Registration
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Verify your student identity snapshot and enroll for upcoming workshop sessions.
            </p>
          </div>

          {/* Action error alerts */}
          {error && (
            <div className="mb-8 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm font-semibold flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <FiAlertCircle className="h-5 w-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
              <button
                onClick={() => router.push("/profile")}
                className="px-3 py-1 bg-white border border-rose-300 hover:bg-rose-100 text-rose-900 text-xs font-bold rounded-lg shrink-0"
              >
                Complete Profile
              </button>
            </div>
          )}

          {/* Case 1: NOT Registered yet */}
          {!registration ? (
            <div className="space-y-8">
              {/* Event details card */}
              <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
                <h3 className="text-lg font-extrabold text-slate-900 mb-4 border-b border-slate-100 pb-3 flex items-center gap-2">
                  <FiFileText className="text-cyan-700" />
                  <span>Program Details &amp; Curriculum</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-6">
                  The Capacity Building Program (CBP 7.0) is designed to enhance student soft skills, professional communication, placement readiness, and corporate etiquette. Undergoing this training is highly recommended for securing placement credentials.
                </p>

                <div className="grid gap-4 sm:grid-cols-3 mb-2">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                    <FiClock className="h-6 w-6 text-cyan-700 mx-auto mb-2" />
                    <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Duration</h4>
                    <p className="text-xs font-extrabold text-slate-900 mt-1">5 Days Training</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                    <FiBookmark className="h-6 w-6 text-cyan-700 mx-auto mb-2" />
                    <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Course Type</h4>
                    <p className="text-xs font-extrabold text-slate-900 mt-1">Soft Skills &amp; HR</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                    <FiAward className="h-6 w-6 text-cyan-700 mx-auto mb-2" />
                    <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Certification</h4>
                    <p className="text-xs font-extrabold text-slate-900 mt-1">MNIT Authorized</p>
                  </div>
                </div>
              </div>

              {/* Confirm profile snapshot registration button */}
              <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm text-center">
                <p className="text-xs text-slate-600 mb-6">
                  By clicking Register, your verified student profile snapshot will be reserved for CBP 7.0 session enrollment.
                </p>

                <button
                  onClick={handleRegister}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-8 py-3.5 text-xs font-bold uppercase tracking-wider shadow-md transition disabled:opacity-50"
                >
                  {actionLoading ? "Registering Student..." : "Confirm & Register Now"}
                  {!actionLoading && <FiArrowRight className="h-4 w-4" />}
                </button>
              </div>
            </div>
          ) : (
            /* Case 2: Registered successfully */
            <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
              <div className="flex flex-col items-center text-center mb-8 pb-6 border-b border-slate-100">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-3xl mb-4">
                  {isConfirmed ? "🎉" : "📝"}
                </div>

                <h3 className="text-2xl font-extrabold text-slate-900">
                  Registration {isConfirmed ? "Confirmed" : "Created"}
                </h3>

                <p className="text-xs text-slate-500 mt-1 font-mono">
                  Registration ID: {registration.registrationId}
                </p>

                <span
                  className={`mt-4 inline-flex items-center gap-1.5 rounded-full border px-4 py-1 text-xs font-bold uppercase tracking-wider ${
                    isConfirmed
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                      : "bg-amber-50 border-amber-200 text-amber-800"
                  }`}
                >
                  {isConfirmed ? (
                    <>
                      <FiCheckCircle className="text-emerald-600" />
                      Confirmed / Paid
                    </>
                  ) : (
                    <>
                      <FiAlertCircle className="text-amber-600" />
                      Payment Pending
                    </>
                  )}
                </span>
              </div>

              {/* Verified Snapshot details list */}
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                <FiUserCheck className="text-cyan-700" /> Verified Student Profile Snapshot
              </h4>

              <dl className="grid gap-4 sm:grid-cols-2 text-xs mb-8">
                {[
                  ["Student Name", fullName],
                  ["Student ID", studentId],
                  ["Branch & Course", courseBranch],
                  ["Official Email", email],
                ].map(([label, value]) => (
                  <div key={label} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <dt className="text-[11px] text-slate-500 font-medium uppercase tracking-wider mb-1">{label}</dt>
                    <dd className="font-extrabold text-slate-900">{value}</dd>
                  </div>
                ))}
              </dl>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-3 text-xs font-bold uppercase tracking-wider transition"
                >
                  Back to Dashboard
                </Link>

                {!isConfirmed && (
                  <Link
                    href="/payment"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-6 py-3 text-xs font-bold uppercase tracking-wider shadow-md transition"
                  >
                    Proceed to Payment
                    <FiArrowRight className="h-4 w-4" />
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
    </PageTransition>
  )
}
