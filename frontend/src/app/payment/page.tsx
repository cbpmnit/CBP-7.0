"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { paymentService } from "@/services/paymentService"
import { PaymentDetailResponse } from "@/types/payment"
import { formatCurrency, formatTxnId, formatDate } from "@/utils/formatters"
import PageTransition from "@/components/animations/PageTransition"
import {
  FiCreditCard,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiArrowLeft,
  FiDownload,
  FiExternalLink,
  FiCheck,
} from "react-icons/fi"

export default function PaymentPage() {
  const [loading, setLoading] = useState(true)
  const [payLoading, setPayLoading] = useState(false)
  const [payment, setPayment] = useState<PaymentDetailResponse | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    fetchPaymentDetails()
  }, [])

  const fetchPaymentDetails = async () => {
    setLoading(true)
    setMessage(null)
    try {
      const data = await paymentService.getMyPayment()
      setPayment(data)
    } catch (err: any) {
      if (err?.status !== 404) {
        setMessage(err?.message || "Failed to load payment details.")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleInitiatePhonePe = async () => {
    setPayLoading(true)
    setMessage(null)
    try {
      const response = await paymentService.initiatePhonePe()
      if (response.redirectUrl) {
        window.location.href = response.redirectUrl
      } else {
        setMessage("Payment initiated. Transaction ID: " + response.transactionId)
        fetchPaymentDetails()
      }
    } catch (err: any) {
      setMessage(err?.message || "Payment initiation failed. Please try again.")
    } finally {
      setPayLoading(false)
    }
  }

  const isSuccess = payment?.paymentStatus === "SUCCESS"
  const isPending = payment?.paymentStatus === "PENDING" || payment?.paymentStatus === "UNDER_VERIFICATION"

  const steps = [
    { label: "Initiated", completed: !!payment },
    { label: "Processing", completed: isSuccess || isPending },
    { label: "Completed", completed: isSuccess },
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
              Payments &amp; Receipts
            </span>
          </div>

          <div className="border-b border-slate-200 pb-4 mb-6">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
              <span className="text-cyan-700"><FiCreditCard /></span>
              <span>Payment Portal</span>
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-600">
              Payment status, transaction history, and official fee receipts for CBP 7.0.
            </p>
          </div>

          {message && (
            <div className="mb-6 p-4 rounded-xl border bg-cyan-50 border-cyan-200 text-cyan-800 text-xs font-semibold">
              {message}
            </div>
          )}

          {/* Payment Success Hero Experience */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm mb-6 cbp-card-interactive">
            {loading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-12 w-12 bg-slate-100 rounded-full mx-auto" />
                <div className="h-6 w-48 bg-slate-100 rounded mx-auto" />
                <div className="h-20 bg-slate-50 rounded" />
              </div>
            ) : payment ? (
              <div>
                <div className="text-center mb-6">
                  <div
                    className={`mx-auto h-16 w-16 rounded-full flex items-center justify-center text-3xl mb-3 ${
                      isSuccess
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                        : "bg-amber-50 text-amber-600 border border-amber-200"
                    }`}
                  >
                    {isSuccess ? <FiCheckCircle /> : <FiClock />}
                  </div>
                  <h2 className="text-xl font-extrabold text-slate-900">
                    {isSuccess ? "Payment Completed Successfully" : "Payment Pending Verification"}
                  </h2>
                  <p className="text-3xl font-extrabold text-slate-900 font-mono mt-2">
                    {formatCurrency(payment.amount)}
                  </p>
                </div>

                {/* Animated Payment Timeline */}
                <div className="mb-8 p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between max-w-md mx-auto relative">
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -translate-y-1/2 z-0" />
                    {steps.map((step, idx) => (
                      <div key={step.label} className="relative z-10 flex flex-col items-center gap-1.5 bg-slate-50 px-2">
                        <div
                          className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                            step.completed
                              ? "bg-emerald-600 text-white"
                              : "bg-slate-200 text-slate-500"
                          }`}
                        >
                          {step.completed ? <FiCheck /> : idx + 1}
                        </div>
                        <span className={`text-[11px] font-semibold ${step.completed ? "text-slate-900" : "text-slate-500"}`}>
                          {step.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 text-xs mb-6">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 font-medium block mb-0.5">Transaction ID:</span>
                    <span className="font-mono text-cyan-800 font-bold">{formatTxnId(payment.transactionId)}</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 font-medium block mb-0.5">Registration ID:</span>
                    <span className="font-mono text-cyan-800 font-bold">{payment.registrationId}</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 font-medium block mb-0.5">Payment Mode:</span>
                    <span className="font-bold text-slate-800 uppercase">{payment.paymentMode || "ONLINE_GATEWAY"}</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 font-medium block mb-0.5">Payment Date:</span>
                    <span className="font-mono text-slate-800">{formatDate(payment.createdAt)}</span>
                  </div>
                </div>

                {isSuccess ? (
                  <button
                    onClick={() => window.print()}
                    className="w-full rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white py-3 text-xs font-bold uppercase tracking-wider shadow-sm transition flex items-center justify-center gap-2"
                  >
                    <FiDownload /> Download Official Fee Receipt
                  </button>
                ) : (
                  <button
                    onClick={handleInitiatePhonePe}
                    disabled={payLoading}
                    className="w-full rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white py-3 text-xs font-bold uppercase tracking-wider shadow-sm transition disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <FiExternalLink />
                    <span>{payLoading ? "Redirecting to Gateway..." : "Retry / Initiate PhonePe Payment"}</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <FiAlertCircle className="mx-auto text-4xl text-amber-500 mb-3" />
                <h3 className="text-lg font-bold text-slate-900 mb-2">No Active Payment Record</h3>
                <p className="text-xs text-slate-600 mb-6 max-w-sm mx-auto">
                  Complete your CBP registration first to generate payment details and proceed with PhonePe online payment.
                </p>
                <button
                  onClick={handleInitiatePhonePe}
                  disabled={payLoading}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-6 py-3 text-xs font-bold uppercase tracking-wider shadow-sm transition disabled:opacity-50"
                >
                  <FiExternalLink />
                  <span>{payLoading ? "Initiating..." : "Initiate Fee Payment"}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </PageTransition>
  )
}
