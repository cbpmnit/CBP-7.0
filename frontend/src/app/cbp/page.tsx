"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { cbpService } from "@/services/cbpService"
import { CbpRegistrationDetailResponse } from "@/types/cbp"
import PageTransition from "@/components/animations/PageTransition"
import {
  FiFileText,
  FiCheckCircle,
  FiArrowLeft,
  FiUserCheck,
} from "react-icons/fi"

export default function CbpPage() {
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState(false)
  const [cbpRegistration, setCbpRegistration] = useState<CbpRegistrationDetailResponse | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    fetchCbpStatus()
  }, [])

  const fetchCbpStatus = async () => {
    setLoading(true)
    setMessage(null)
    try {
      const data = await cbpService.getMyRegistration()
      setCbpRegistration(data)
    } catch (err: any) {
      if (err?.status !== 404) {
        setMessage(err?.message || "Failed to load CBP registration status.")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleRegisterCbp = async () => {
    setRegistering(true)
    setMessage(null)
    try {
      await cbpService.register()
      setMessage("CBP Registration completed successfully!")
      fetchCbpStatus()
    } catch (err: any) {
      setMessage(err?.message || "Failed to complete CBP registration. Ensure your student profile is complete first.")
    } finally {
      setRegistering(false)
    }
  }

  const isRegistered = !!cbpRegistration

  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [registration, setRegistration] = useState<CbpRegistrationDetail | null>(null)

  const fetchRegistrationDetails = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.get<CbpRegistrationDetail>("/api/v1/cbp/me")
      setRegistration(data)
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setRegistration(null)
      } else {
        setError("Failed to retrieve registration status.")
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRegistrationDetails()
  }, [])

  const handleRegister = async () => {
    try {
      setActionLoading(true)
      setError(null)
      await api.post("/api/v1/cbp/register")
      await fetchRegistrationDetails()
    } catch (err: any) {
      if (err instanceof ApiError) {
        setError(err.message || "Failed to submit registration.")
      } else {
        setError("An unexpected error occurred.")
      }
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent shadow-[0_0_15px_#00f0ff]" />
          <span className="font-mono text-xs uppercase tracking-widest text-cyan-400">
            Checking Registration...
          </span>
        </div>
      </div>
    )
  }

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
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-cyan-50 border border-cyan-200 text-cyan-700 shadow-sm mb-6">
              <FiFileText className="text-3xl" />
            </div>
          </Reveal>

          {/* Action error alerts */}
          {error && (
            <Reveal>
              <div className="mb-8 p-4 rounded-2xl bg-red-500/10 border border-red-500/40 text-red-400 text-sm font-semibold flex items-center gap-3">
                <FiAlertCircle className="h-5 w-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            </Reveal>
          )}

          {/* Case 1: NOT Registered yet */}
          {!registration ? (
            <div className="space-y-8">
              {/* Event details card */}
              <Reveal delay={80}>
                <div className="glass-card rounded-3xl p-8 border-cyan-500/30">
                  <h3 className="text-xl font-extrabold text-white mb-6 border-b border-white/5 pb-3 flex items-center gap-2">
                    <FiFileText className="text-cyan-400" />
                    Program details & curriculum
                  </h3>
                  <p className="text-sm text-gray-300 leading-relaxed mb-6">
                    The Capacity Building Program (CBP 7.0) is designed to enhance student soft skills, professional communication, placement readiness, and corporate etiquette. Undergoing this training is highly recommended for securing placement credentials.
                  </p>

                  <div className="grid gap-6 sm:grid-cols-3 mb-6">
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                      <FiClock className="h-6 w-6 text-cyan-400 mx-auto mb-2" />
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Duration</h4>
                      <p className="text-sm font-extrabold text-white mt-1">5 Days Training</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                      <FiBookmark className="h-6 w-6 text-cyan-400 mx-auto mb-2" />
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Course Type</h4>
                      <p className="text-sm font-extrabold text-white mt-1">Soft Skills & HR</p>
                    </div>
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
                      <FiAward className="h-6 w-6 text-cyan-400 mx-auto mb-2" />
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Certification</h4>
                      <p className="text-sm font-extrabold text-white mt-1">MNIT Authorized</p>
                    </div>
                  </div>
                </div>
              </Reveal>

              {/* Confirm profile snapshot registration button */}
              <Reveal delay={120}>
                <div className="glass-card rounded-3xl p-8 border-cyan-500/30 text-center">
                  <p className="text-sm text-gray-400 mb-6">
                    By clicking Register, your profile details will be submitted to the program coordinator for registration slot reservation.
                  </p>

                  <button
                    onClick={handleRegister}
                    disabled={actionLoading}
                    className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 text-black px-8 py-4 text-xs font-extrabold uppercase tracking-widest hover:bg-cyan-400 transition shadow-[0_0_20px_rgba(0,240,255,0.4)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {actionLoading ? "Registering User..." : "Confirm & Register Now"}
                    {!actionLoading && <FiArrowRight className="h-4 w-4" />}
                  </button>
                </div>
              </Reveal>
            </div>
          ) : (
            /* Case 2: Registered successfully */
            <Reveal delay={80}>
              <div className="glass-card rounded-3xl p-8 border-cyan-500/30">
                <div className="flex flex-col items-center text-center mb-8 pb-6 border-b border-white/5">
                  <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-3xl shadow-[0_0_25px_rgba(0,240,255,0.2)] mb-4">
                    {registration.registrationStatus === "REGISTERED" ? "🎉" : "📝"}
                  </div>
                  
                  <h3 className="text-2xl font-extrabold text-white">
                    Registration {registration.registrationStatus === "REGISTERED" ? "Confirmed" : "Created"}
                  </h3>
                  
                  <p className="text-sm text-gray-400 mt-1 font-mono">
                    ID: {registration.registrationId}
                  </p>

                  <span className={`mt-4 inline-flex items-center gap-1.5 rounded-full border px-4 py-1 text-xs font-bold uppercase tracking-wider ${
                    registration.registrationStatus === "REGISTERED"
                      ? "bg-green-500/10 border-green-500/40 text-green-300"
                      : "bg-yellow-500/10 border-yellow-500/40 text-yellow-300"
                  }`}>
                    {registration.registrationStatus === "REGISTERED" ? (
                      <>
                        <FiCheckCircle className="text-green-400" />
                        Confirmed / Paid
                      </>
                    ) : (
                      <>
                        <FiAlertCircle className="text-yellow-400 animate-pulse" />
                        Payment Pending
                      </>
                    )}
                  </span>
                </div>

                {/* Summary list */}
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
                  Registration Details Summary
                </h4>
                
                <dl className="grid gap-4 sm:grid-cols-2 text-sm mb-8">
                  {[
                    ["Student Name", `${registration.profile.firstName} ${registration.profile.lastName}`],
                    ["Roll Number", registration.profile.studentId],
                    ["Branch & Course", `${registration.profile.course} - ${registration.profile.branch}`],
                    ["Official Email", registration.profile.email],
                  ].map(([label, value]) => (
                    <div key={label} className="p-3.5 rounded-xl bg-white/5 border border-white/5">
                      <dt className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">{label}</dt>
                      <dd className="font-extrabold text-white">{value}</dd>
                    </div>
                  ))}
                </dl>

                {/* Button actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center justify-center rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white px-6 py-3 text-xs font-extrabold uppercase tracking-widest transition cursor-pointer"
                  >
                    Back to Dashboard
                  </Link>

                  {registration.registrationStatus !== "REGISTERED" && (
                    <Link
                      href="/payment"
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 text-black px-6 py-3 text-xs font-extrabold uppercase tracking-widest hover:bg-cyan-400 transition shadow-[0_0_15px_rgba(0,240,255,0.3)] cursor-pointer"
                    >
                      Proceed to Payment
                      <FiArrowRight className="h-4 w-4" />
                    </Link>
                  )}
                </div>
              </div>
            </Reveal>
          )}

        </div>
      </main>
    </PageTransition>
  )
}
