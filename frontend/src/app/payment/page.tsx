"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Reveal from "@/components/animations/RevealOnScroll"
import PageTransition from "@/components/animations/PageTransition"
import { api, ApiError } from "@/utils/api"
import { FiCheckCircle, FiAlertCircle, FiCreditCard, FiArrowRight, FiInfo } from "react-icons/fi"

interface PaymentInfo {
  id: string
  registrationId: string
  paymentStatus: string
  amount: number
  transactionId: string
  createdAt: string
}

export default function PaymentPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [payment, setPayment] = useState<PaymentInfo | null>(null)

  const fetchPaymentDetails = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await api.get<PaymentInfo[]>("/api/v1/payment/me")
      if (data && data.length > 0) {
        // Grab latest payment record
        setPayment(data[0])
      } else {
        setPayment(null)
      }
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setPayment(null)
      } else {
        setError("Failed to retrieve payment details.")
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPaymentDetails()
  }, [])

  const handleInitiatePayment = async () => {
    try {
      setActionLoading(true)
      setError(null)
      const res: any = await api.post("/api/v1/payment/phonepe/initiate")
      if (res && res.redirectUrl) {
        // Redirect user to PhonePe sandbox checkout
        window.location.href = res.redirectUrl
      } else {
        setError("Failed to generate payment redirect link.")
      }
    } catch (err: any) {
      if (err instanceof ApiError) {
        setError(err.message || "Failed to initiate payment transaction.")
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
            Accessing Billing Portal...
          </span>
        </div>
      </div>
    )
  }

  return (
    <PageTransition>
      <main className="min-h-screen bg-black text-gray-100 bg-grid-cyber py-24 relative overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[160px] pointer-events-none" />

        <div className="mx-auto max-w-xl px-5 relative z-10">
          
          {/* Header */}
          <Reveal>
            <div className="text-center mb-12">
              <span className="inline-flex items-center gap-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 px-4 py-1.5 text-xs font-bold text-cyan-300 uppercase tracking-widest backdrop-blur-md">
                Secure Checkout Gateway
              </span>
              <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
                CBP 7.0 <span className="gradient-text-cyan">Payment</span>
              </h1>
              <p className="mt-2 text-base text-gray-400">
                Complete your Capacities Building program invoice checkout using PhonePe PG.
              </p>
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

          {/* Render States */}
          {!payment || payment.paymentStatus === "FAILED" ? (
            /* Case 1: Unpaid or Failed Attempt */
            <Reveal delay={80}>
              <div className="glass-card rounded-3xl p-8 border-cyan-500/30">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
                  <FiCreditCard className="text-cyan-400 h-6 w-6" />
                  <h3 className="text-lg font-bold text-white">Payment Summary</h3>
                </div>

                {payment?.paymentStatus === "FAILED" && (
                  <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/40 text-red-400 text-xs font-medium flex items-center gap-2">
                    <FiAlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span>Your previous transaction attempt ({payment.transactionId}) failed. Please try again.</span>
                  </div>
                )}

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center py-2.5 border-b border-white/5">
                    <span className="text-gray-400 text-sm">Program Fee Description</span>
                    <span className="text-white font-extrabold text-sm text-right">CBP 7.0 Registration Fee</span>
                  </div>
                  <div className="flex justify-between items-center py-2.5 border-b border-white/5">
                    <span className="text-gray-400 text-sm">Currency</span>
                    <span className="text-white font-extrabold text-sm text-right">INR (Indian Rupee)</span>
                  </div>
                  <div className="flex justify-between items-center py-2.5">
                    <span className="text-gray-400 text-sm">Amount Due</span>
                    <span className="text-cyan-400 font-black text-xl text-right">₹ 500.00</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-cyan-500/5 border border-cyan-500/20 text-xs text-cyan-300 flex gap-2.5 mb-8">
                  <FiInfo className="h-4 w-4 flex-shrink-0 text-cyan-400" />
                  <span>On clicking, you will be redirected to the secure PhonePe PG payment gateway sandbox. Do not refresh or exit the checkout page during transaction processing.</span>
                </div>

                <button
                  onClick={handleInitiatePayment}
                  disabled={actionLoading}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-500 text-black py-4 text-xs font-extrabold uppercase tracking-widest hover:bg-cyan-400 transition shadow-[0_0_20px_rgba(0,240,255,0.4)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {actionLoading ? "Redirecting to PhonePe..." : "Pay with PhonePe"}
                  {!actionLoading && <FiArrowRight className="h-4 w-4" />}
                </button>
              </div>
            </Reveal>
          ) : payment.paymentStatus === "SUCCESS" ? (
            /* Case 2: Already Paid */
            <Reveal delay={80}>
              <div className="glass-card rounded-3xl p-8 border-cyan-500/30 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-green-500/10 border border-green-500/30 text-green-400 text-3xl shadow-[0_0_25px_rgba(74,222,128,0.2)] mb-6">
                  🎉
                </div>
                <h3 className="text-2xl font-extrabold text-white mb-2">Payment Confirmed!</h3>
                <p className="text-sm text-gray-400 mb-8">
                  Your payment of 500.00 INR was received and processed successfully.
                </p>

                <div className="bg-white/5 border border-white/5 rounded-2xl p-5 mb-8 text-left text-sm space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-xs uppercase tracking-wider">Transaction ID</span>
                    <span className="font-mono font-bold text-white text-right text-xs">{payment.transactionId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-xs uppercase tracking-wider">Amount Paid</span>
                    <span className="font-bold text-green-300 text-right text-xs">₹ 500.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-xs uppercase tracking-wider">Timestamp</span>
                    <span className="font-bold text-white text-right text-xs">{new Date(payment.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                <Link
                  href="/dashboard"
                  className="w-full inline-flex items-center justify-center rounded-xl bg-cyan-500 text-black py-4 text-xs font-extrabold uppercase tracking-widest hover:bg-cyan-400 transition shadow-[0_0_15px_rgba(0,240,255,0.3)] cursor-pointer"
                >
                  Return to Dashboard
                </Link>
              </div>
            </Reveal>
          ) : (
            /* Case 3: PENDING / UNDER_VERIFICATION */
            <Reveal delay={80}>
              <div className="glass-card rounded-3xl p-8 border-cyan-500/30 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-3xl shadow-[0_0_25px_rgba(250,204,21,0.2)] mb-6 animate-pulse">
                  ⏳
                </div>
                <h3 className="text-2xl font-extrabold text-white mb-2">Checking payment status...</h3>
                <p className="text-sm text-gray-400 mb-8">
                  Your transaction status verification is currently processing.
                </p>

                <div className="bg-white/5 border border-white/5 rounded-2xl p-5 mb-8 text-left text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-xs uppercase tracking-wider">Transaction ID</span>
                    <span className="font-mono font-bold text-white text-right text-xs">{payment.transactionId}</span>
                  </div>
                </div>

                <Link
                  href={`/payment-status/${payment.transactionId}`}
                  className="w-full inline-flex items-center justify-center rounded-xl bg-cyan-500 text-black py-4 text-xs font-extrabold uppercase tracking-widest hover:bg-cyan-400 transition shadow-[0_0_15px_rgba(0,240,255,0.3)] cursor-pointer"
                >
                  Verify Transaction
                </Link>
              </div>
            </Reveal>
          )}

        </div>
      </main>
    </PageTransition>
  )
}
