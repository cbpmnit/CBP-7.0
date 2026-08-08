"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { certificateService } from "@/services/certificateService"
import { cbpService } from "@/services/cbpService"
import { paymentService } from "@/services/paymentService"
import { attendanceService } from "@/services/attendanceService"
import { CertificateResponse } from "@/types/certificate"
import PageTransition from "@/components/animations/PageTransition"
import CertificateCard from "@/components/cards/CertificateCard"
import { FiAward, FiArrowLeft, FiCheckCircle, FiClock, FiLock, FiInfo } from "react-icons/fi"

export default function CertificatePage() {
  const [loading, setLoading] = useState(true)
  const [certificate, setCertificate] = useState<CertificateResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [isRegistered, setIsRegistered] = useState(false)
  const [isPaid, setIsPaid] = useState(false)
  const [attendancePct, setAttendancePct] = useState(0)

  useEffect(() => {
    fetchCertificateAndRequirements()
  }, [])

  const fetchCertificateAndRequirements = async () => {
    setLoading(true)
    setError(null)
    try {
      const [certRes, cbpRes, payRes, attRes] = await Promise.allSettled([
        certificateService.getMyCertificate(),
        cbpService.getMyRegistration(),
        paymentService.getMyPayment(),
        attendanceService.getMyAttendance(),
      ])

      if (certRes.status === "fulfilled") setCertificate(certRes.value)
      else if (certRes.status === "rejected" && (certRes.reason as any)?.status === 404) {
        setError("Certificate will be generated after completing eligibility requirements.")
      }

      if (cbpRes.status === "fulfilled") setIsRegistered(true)
      if (payRes.status === "fulfilled" && payRes.value.paymentStatus === "SUCCESS") setIsPaid(true)
      if (attRes.status === "fulfilled") setAttendancePct(attRes.value.attendancePercentage || 0)
    } catch (err: any) {
      setError("Failed to load certificate information.")
    } finally {
      setLoading(false)
    }
  }

  const isEligible = isRegistered && isPaid && attendancePct >= 75

  const journeySteps = [
    { label: "Registration", completed: isRegistered },
    { label: "Fee Payment", completed: isPaid },
    { label: "Attendance (75%)", completed: attendancePct >= 75, detail: `${attendancePct.toFixed(0)}%` },
    { label: "Certificate Unlocked", completed: !!certificate },
  ]

  return (
    <PageTransition>
      <main className="min-h-[calc(100vh-80px)] bg-cbp-grid text-slate-900 py-8 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          {/* Header Bar */}
          <div className="flex items-center justify-between mb-6">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 px-4 py-2 text-xs font-bold uppercase tracking-wider shadow-sm transition"
            >
              <FiArrowLeft /> Dashboard
            </Link>
            <span className="inline-flex items-center gap-2 rounded-full bg-cyan-50 border border-cyan-200 px-4 py-1 text-xs font-bold text-cyan-800 uppercase tracking-wider">
              Official Certification
            </span>
          </div>

          <div className="border-b border-slate-200 pb-4 mb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
              <span className="text-purple-700"><FiAward /></span>
              <span>CBP 7.0 Credentials</span>
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-600">
              Official completion certificate for the Capacity Building Program soft skills workshop.
            </p>
          </div>

          {/* Certificate Unlock Journey */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm mb-6 cbp-card-interactive">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Certificate Eligibility Requirement Journey
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {journeySteps.map((step) => (
                <div
                  key={step.label}
                  className={`p-3 rounded-xl border ${
                    step.completed
                      ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                      : "bg-slate-50 border-slate-200 text-slate-600"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold">{step.label}</span>
                    {step.completed ? (
                      <FiCheckCircle className="text-emerald-600 shrink-0" />
                    ) : (
                      <FiLock className="text-slate-400 shrink-0 text-xs" />
                    )}
                  </div>
                  <p className="text-[11px] font-semibold">
                    {step.completed ? "Verified \u2713" : step.detail || "Pending"}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Certificate Download Card */}
          <div className="max-w-xl mx-auto mb-6">
            <CertificateCard certificate={certificate} loading={loading} error={error} />
          </div>

          {/* Explanation Info */}
          <div className="p-4 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-900 text-xs flex items-start gap-2.5 max-w-xl mx-auto">
            <FiInfo className="text-base shrink-0 mt-0.5 text-cyan-700" />
            <p className="leading-relaxed">
              <strong>Certificate Criteria:</strong> Certificates are automatically generated by the CBP system once you complete registration, clear fee payment, and achieve at least 75% attendance during the 5-day workshop.
            </p>
          </div>
        </div>
      </main>
    </PageTransition>
  )
}
