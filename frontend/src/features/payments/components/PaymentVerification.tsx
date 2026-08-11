"use client"

import React, { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { paymentApi } from "../services/paymentApi"
import { PaymentStatusResponse } from "../types"
import PageTransition from "@/components/animations/PageTransition"
import {
  FiCheckCircle,
  FiAlertCircle,
  FiRefreshCw,
  FiSlash,
  FiCopy,
  FiCheck,
  FiCreditCard,
  FiArrowLeft
} from "react-icons/fi"

type StatusState = "PENDING" | "SUCCESS" | "FAILED" | "UNKNOWN"

export default function PaymentVerification() {
  const params = useParams()
  const transactionId = (params?.transactionId as string) || ""

  const [status, setStatus] = useState<StatusState>("PENDING")
  const [paymentDetails, setPaymentDetails] = useState<PaymentStatusResponse | null>(null)
  const [pollCount, setPollCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  const verifyTransaction = useCallback(async () => {
    if (!transactionId) {
      setStatus("UNKNOWN")
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const result = await paymentApi.getPaymentStatus(transactionId)
      setPaymentDetails(result)
      
      if (result.paymentStatus === "SUCCESS") {
        setStatus("SUCCESS")
      } else if (result.paymentStatus === "FAILED") {
        setStatus("FAILED")
      } else {
        setStatus("PENDING")
      }
    } catch (err) {
      console.error("Verification status query failed:", err)
      setStatus("UNKNOWN")
    } finally {
      setLoading(false)
    }
  }, [transactionId])

  useEffect(() => {
    verifyTransaction()
  }, [verifyTransaction])

  // Polling implementation: every 4 seconds, up to 2 minutes (30 attempts)
  useEffect(() => {
    if (status !== "PENDING" || !transactionId) return

    const pollInterval = 4000
    const maxAttempts = 30

    const intervalId = setInterval(async () => {
      setPollCount((prevCount) => {
        const nextCount = prevCount + 1
        if (nextCount >= maxAttempts) {
          setStatus("UNKNOWN")
          clearInterval(intervalId)
          return nextCount;
        }

        paymentApi.getPaymentStatus(transactionId)
          .then((result) => {
            setPaymentDetails(result)
            if (result.paymentStatus === "SUCCESS") {
              setStatus("SUCCESS")
              clearInterval(intervalId)
            } else if (result.paymentStatus === "FAILED") {
              setStatus("FAILED")
              clearInterval(intervalId)
            }
          })
          .catch((err) => {
            console.error("Polling payment status failed:", err)
          })

        return nextCount
      })
    }, pollInterval)

    return () => clearInterval(intervalId)
  }, [status, transactionId])

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const truncateTxId = (id: string) => {
    if (!id) return ""
    if (id.length <= 22) return id
    return `${id.slice(0, 18)}...`
  }

  const formatCurrency = (val?: number) => {
    if (val === undefined || val === null) return "₹0.00"
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(val)
  }

  const formatDate = (isoString?: string) => {
    if (!isoString) return "—"
    try {
      const date = new Date(isoString)
      return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      })
    } catch {
      return "—"
    }
  }

  // Timeline completion checks
  const isInitiated = !!paymentDetails
  const isProcessing = isInitiated && (status === "PENDING" || status === "SUCCESS")
  const isCompleted = status === "SUCCESS"

  return (
    <PageTransition>
      <main className="min-h-[calc(100vh-80px)] bg-slate-50 text-slate-900 py-8 px-4 flex items-center justify-center">
        <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6 relative animate-in fade-in duration-200">
          
          {/* Header Link */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 text-slate-600 hover:text-slate-900 text-xs font-bold transition"
            >
              <FiArrowLeft className="text-xs" /> Dashboard
            </Link>
            <span className="text-[10px] font-mono font-extrabold text-cyan-800 bg-cyan-50 px-2.5 py-0.5 rounded-full border border-cyan-200 tracking-wider uppercase">
              Secure Checkout
            </span>
          </div>

          {/* Status Display Area */}
          <div className="text-center space-y-3">
            {/* Status Icon */}
            <div className="flex justify-center">
              {status === "SUCCESS" && (
                <div className="h-16 w-16 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(16,185,129,0.1)]">
                  <FiCheckCircle />
                </div>
              )}
              {status === "FAILED" && (
                <div className="h-16 w-16 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(244,63,94,0.1)]">
                  <FiSlash />
                </div>
              )}
              {status === "PENDING" && (
                <div className="h-16 w-16 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-600 flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(6,182,212,0.1)]">
                  <FiRefreshCw className="animate-spin text-2xl" />
                </div>
              )}
              {status === "UNKNOWN" && (
                <div className="h-16 w-16 rounded-full bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(245,158,11,0.1)]">
                  <FiAlertCircle />
                </div>
              )}
            </div>

            {/* Title & Amount */}
            <div className="space-y-1">
              <h2 className="text-lg font-black text-slate-850 tracking-tight">
                Payment Verification
              </h2>
              <p className="text-2xl font-black text-slate-900 tracking-tight font-mono">
                {paymentDetails ? formatCurrency(paymentDetails.amount) : "₹1,000"}
              </p>
              <div className="text-xs font-semibold text-slate-500">
                {status === "PENDING" && "Payment verification in progress"}
                {status === "SUCCESS" && "Payment completed successfully"}
                {status === "FAILED" && "Payment failed. Retry payment"}
                {status === "UNKNOWN" && "We are checking your payment status"}
              </div>
            </div>
          </div>

          {/* Progress Timeline */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-150 space-y-4">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Reconciliation Timeline
            </h3>
            
            <div className="space-y-3.5 relative">
              {/* Timeline Connection Line */}
              <div className="absolute left-[11px] top-2 bottom-2 w-0.5 bg-slate-200" />

              {/* Step 1: Initiated */}
              <div className="flex gap-3 items-start relative z-10">
                <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition ${
                  isInitiated ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-500"
                }`}>
                  {isInitiated ? "✓" : "1"}
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-extrabold text-slate-800 leading-tight">Payment Initiated</h4>
                  <p className="text-[10px] text-slate-500">Transaction request generated successfully</p>
                </div>
              </div>

              {/* Step 2: Processing */}
              <div className="flex gap-3 items-start relative z-10">
                <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition ${
                  isProcessing ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-500"
                }`}>
                  {isProcessing ? "✓" : "2"}
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-extrabold text-slate-800 leading-tight">Processing Status</h4>
                  <p className="text-[10px] text-slate-500">Verifying signature logs at checkout server</p>
                </div>
              </div>

              {/* Step 3: Completed */}
              <div className="flex gap-3 items-start relative z-10">
                <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition ${
                  isCompleted ? "bg-emerald-600 text-white" : "bg-slate-200 text-slate-500"
                }`}>
                  {isCompleted ? "✓" : "3"}
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-extrabold text-slate-800 leading-tight">Completed</h4>
                  <p className="text-[10px] text-slate-500">Registration and program fee settled</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Details Card */}
          <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 text-xs space-y-3 font-medium">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span className="text-slate-500">Transaction ID:</span>
              <div className="flex items-center gap-1 min-w-0">
                <span className="font-mono text-slate-900 font-bold break-all">
                  {transactionId || "—"}
                </span>
                {transactionId && (
                  <button
                    onClick={() => handleCopy(transactionId)}
                    className="p-1 text-slate-400 hover:text-slate-600 transition shrink-0"
                    title="Copy Transaction ID"
                  >
                    {copied ? <FiCheck className="text-emerald-600" /> : <FiCopy />}
                  </button>
                )}
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span className="text-slate-500">Registration ID:</span>
              <span className="font-mono text-slate-900 font-bold break-all">
                {paymentDetails?.registrationId || "—"}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span className="text-slate-500">Payment Mode:</span>
              <span className="font-bold text-slate-850 uppercase">Online Gateway</span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <span className="text-slate-500">Payment Date:</span>
              <span className="font-mono text-slate-900">
                {paymentDetails ? formatDate(paymentDetails.createdAt) : "—"}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link
              href="/payment"
              className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition inline-flex items-center justify-center gap-1.5 shadow-3xs text-center cursor-pointer"
            >
              <FiCreditCard />
              <span>Retry Payment</span>
            </Link>
            
            <button
              onClick={verifyTransaction}
              disabled={loading}
              className="flex-1 py-3 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-xl transition inline-flex items-center justify-center gap-1.5 border border-slate-200 shadow-3xs cursor-pointer disabled:opacity-50"
            >
              <FiRefreshCw className={loading ? "animate-spin" : ""} />
              <span>{loading ? "Verifying..." : "Refresh Status"}</span>
            </button>
          </div>

        </div>
      </main>
    </PageTransition>
  )
}
