"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
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
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Capacity Building <span className="gradient-text-cyan">Program</span>
            </h1>
            <p className="mt-2 text-sm text-slate-600 max-w-md mx-auto">
              Official soft skills development workshop program at MNIT Jaipur.
            </p>
          </div>

          {message && (
            <div className="mb-6 p-4 rounded-2xl border bg-cyan-50 border-cyan-200 text-cyan-800 text-xs font-semibold text-center">
              {message}
            </div>
          )}

          <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
            {loading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-6 w-48 bg-slate-100 rounded" />
                <div className="h-12 w-32 bg-slate-100 rounded" />
                <div className="h-20 bg-slate-50 rounded" />
              </div>
            ) : isRegistered && cbpRegistration ? (
              <div>
                <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-200 pb-6 mb-6">
                  <div>
                    <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block mb-1">
                      Registration Status
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold uppercase bg-emerald-50 border border-emerald-200 text-emerald-800">
                        <FiCheckCircle /> Registered
                      </span>
                      <span className="text-xs font-mono text-cyan-800 font-bold">
                        ID: {cbpRegistration.registrationId}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 md:mt-0 text-left md:text-right">
                    <span className="text-xs text-slate-500 block uppercase tracking-wider">Payment Status</span>
                    <span className="text-sm font-bold text-slate-900 font-mono uppercase">
                      {cbpRegistration.registrationStatus}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-3 text-xs">
                  <h4 className="text-sm font-bold text-slate-900 mb-2">Registered Participant Details</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div><span className="text-slate-500 font-medium">Name:</span> <span className="text-slate-900 font-bold">{cbpRegistration.firstName} {cbpRegistration.lastName}</span></div>
                    <div><span className="text-slate-500 font-medium">Student ID:</span> <span className="text-cyan-800 font-mono font-bold">{cbpRegistration.studentId}</span></div>
                    <div><span className="text-slate-500 font-medium">Course & Branch:</span> <span className="text-slate-900 font-bold">{cbpRegistration.course} - {cbpRegistration.branch}</span></div>
                    <div><span className="text-slate-500 font-medium">Institute:</span> <span className="text-slate-900 font-bold">{cbpRegistration.institute}</span></div>
                  </div>
                </div>

                <div className="mt-8">
                  <Link
                    href="/payment"
                    className="inline-flex items-center justify-center w-full rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white py-3.5 text-xs font-bold uppercase tracking-wider shadow-sm transition"
                  >
                    <span>Proceed to Payments Portal</span>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-6">
                <FiUserCheck className="mx-auto text-4xl text-cyan-700 mb-3" />
                <h3 className="text-lg font-bold text-slate-900 mb-2">Register for CBP 7.0</h3>
                <p className="text-xs text-slate-600 mb-6 max-w-sm mx-auto">
                  Confirm your registration for the Capacity Building Program soft skills workshops.
                </p>
                <button
                  onClick={handleRegisterCbp}
                  disabled={registering}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-8 py-3.5 text-xs font-bold uppercase tracking-wider shadow-sm transition disabled:opacity-50"
                >
                  <span>{registering ? "Registering..." : "Confirm CBP Registration"}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </PageTransition>
  )
}
