"use client"

import React, { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import Reveal from "@/components/animations/RevealOnScroll"
import PageTransition from "@/components/animations/PageTransition"
import { api } from "@/utils/api"
import { FiCheckCircle, FiAlertCircle, FiRefreshCw, FiSlash } from "react-icons/fi"

type StatusState = "VERIFYING" | "POLLING" | "SUCCESS" | "FAILED" | "PENDING_TIMEOUT"

export default function PaymentVerification() {
  const params = useParams()
  const transactionId = (params?.transactionId as string) || ""

  const [status, setStatus] = useState<StatusState>("VERIFYING")
  const [error, setError] = useState<string | null>(null)
  const [pollCount, setPollCount] = useState(0)

  const verifyTransaction = useCallback(async () => {
    if (!transactionId) {
      setError("No transaction ID provided in path.")
      setStatus("FAILED")
      return
    }

    try {
      setStatus("VERIFYING")
      setError(null)
      await api.get(`/api/v1/payment/status/${transactionId}`)
      setStatus("POLLING")
      setPollCount(0)
    } catch (err: any) {
      console.error("Initial verification trigger failed:", err)
      setStatus("POLLING")
      setPollCount(0)
    }
  }, [transactionId])

  useEffect(() => {
    verifyTransaction()
  }, [verifyTransaction])

  useEffect(() => {
    if (status !== "POLLING") return

    let intervalId: NodeJS.Timeout

    const pollPaymentStatus = async () => {
      try {
        const result = await api.get<any>(`/api/v1/payment/status/${transactionId}`)

        if (result) {
          if (result.paymentStatus === "SUCCESS") {
            setStatus("SUCCESS")
            return
          } else if (result.paymentStatus === "FAILED") {
            setStatus("FAILED")
            return
          }
        }

        setPollCount((prev) => {
          const nextCount = prev + 1
          if (nextCount >= 6) {
            setStatus("PENDING_TIMEOUT")
          }
          return nextCount
        })
      } catch (err) {
        console.error("Polling payment status failed:", err)
      }
    }

    pollPaymentStatus()
    intervalId = setInterval(pollPaymentStatus, 5000)

    return () => {
      if (intervalId) clearInterval(intervalId)
    }
  }, [status, transactionId])

  return (
    <PageTransition>
      <main className="min-h-screen bg-black text-gray-100 bg-grid-cyber py-24 relative overflow-hidden flex items-center justify-center">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[160px] pointer-events-none" />

        <div className="w-full max-w-md px-5 relative z-10">
          <Reveal>
            <div className="glass-card rounded-3xl p-8 border-cyan-500/30 text-center">
              {/* 1. Verifying / Polling UI */}
              {(status === "VERIFYING" || status === "POLLING") && (
                <>
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-3xl shadow-[0_0_25px_rgba(0,240,255,0.2)] mb-6">
                    <FiRefreshCw className="animate-spin text-cyan-400 h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-extrabold text-white mb-2">
                    {status === "VERIFYING" ? "Initiating Verification" : "Verifying Payment"}
                  </h3>
                  <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                    {status === "VERIFYING"
                      ? "Connecting to PhonePe Secure Gateway details..."
                      : `Polling transaction record status. Attempt ${pollCount + 1} of 6...`}
                  </p>
                  {transactionId && (
                    <div className="text-xs font-mono bg-white/5 border border-white/5 py-2 px-4 rounded-xl inline-block text-gray-300">
                      Txn: {transactionId}
                    </div>
                  )}
                </>
              )}

              {/* 2. Success UI */}
              {status === "SUCCESS" && (
                <>
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-green-500/10 border border-green-500/30 text-green-400 text-3xl shadow-[0_0_25px_rgba(74,222,128,0.2)] mb-6">
                    <FiCheckCircle className="text-green-400 h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-extrabold text-white mb-2">Payment Confirmed!</h3>
                  <p className="text-sm text-gray-400 mb-8">
                    Your transaction has settled successfully. Your CBP 7.0 workshop registration is confirmed.
                  </p>

                  <Link
                    href="/dashboard"
                    className="w-full inline-flex items-center justify-center rounded-xl bg-cyan-500 text-black py-4 text-xs font-extrabold uppercase tracking-widest hover:bg-cyan-400 transition shadow-[0_0_15px_rgba(0,240,255,0.3)] cursor-pointer"
                  >
                    Return to Dashboard
                  </Link>
                </>
              )}

              {/* 3. Failed UI */}
              {status === "FAILED" && (
                <>
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-red-500/10 border border-red-500/30 text-red-400 text-3xl shadow-[0_0_25px_rgba(239,68,68,0.2)] mb-6">
                    <FiSlash className="text-red-400 h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-extrabold text-white mb-2">Payment Failed</h3>
                  <p className="text-sm text-gray-400 mb-8 leading-relaxed">
                    {error || "The gateway returned a failed payment status or matching transaction was not found."}
                  </p>

                  <div className="flex gap-4">
                    <Link
                      href="/payment"
                      className="flex-1 inline-flex items-center justify-center rounded-xl bg-cyan-500 text-black py-3.5 text-xs font-extrabold uppercase tracking-widest hover:bg-cyan-400 transition cursor-pointer"
                    >
                      Retry Payment
                    </Link>
                    <Link
                      href="/dashboard"
                      className="flex-1 inline-flex items-center justify-center rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white py-3.5 text-xs font-extrabold uppercase tracking-widest transition cursor-pointer"
                    >
                      Dashboard
                    </Link>
                  </div>
                </>
              )}

              {/* 4. Polling Timeout UI */}
              {status === "PENDING_TIMEOUT" && (
                <>
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-3xl shadow-[0_0_25px_rgba(250,204,21,0.2)] mb-6">
                    <FiAlertCircle className="text-yellow-400 h-8 w-8" />
                  </div>
                  <h3 className="text-2xl font-extrabold text-white mb-2">Verification Processing</h3>
                  <p className="text-sm text-gray-400 mb-8 leading-relaxed">
                    We are waiting for settlement confirmation from PhonePe. You can manually refresh or verify again shortly.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={verifyTransaction}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 text-black py-3.5 text-xs font-extrabold uppercase tracking-widest hover:bg-cyan-400 transition cursor-pointer"
                    >
                      <FiRefreshCw />
                      Re-Verify Status
                    </button>
                    <Link
                      href="/dashboard"
                      className="flex-1 inline-flex items-center justify-center rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white py-3.5 text-xs font-extrabold uppercase tracking-widest transition cursor-pointer"
                    >
                      Back to Dashboard
                    </Link>
                  </div>
                </>
              )}
            </div>
          </Reveal>
        </div>
      </main>
    </PageTransition>
  )
}
