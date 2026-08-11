"use client"

import React from "react"
import Link from "next/link"
import { usePayment } from "../hooks/usePayment"
import { useAppSelector } from "@/store/hooks"
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

export default function StudentPaymentPortal() {
  const {
    loading,
    payLoading,
    payment,
    message,
    handleInitiatePhonePe,
  } = usePayment()

  const { name: authName, studentId: authStudentId, email: authEmail } = useAppSelector((state) => state.auth)

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
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 min-w-0 overflow-hidden">
                    <span className="text-slate-500 font-medium block mb-0.5">Transaction ID:</span>
                    <span className="font-mono text-cyan-800 font-bold break-all block">{formatTxnId(payment.transactionId)}</span>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 min-w-0 overflow-hidden">
                    <span className="text-slate-500 font-medium block mb-0.5">Registration ID:</span>
                    <span className="font-mono text-cyan-800 font-bold break-all block">{payment.registrationId}</span>
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
                    <FiDownload /> Download Receipt
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

        {/* Printable Receipt Isolated Block (Only visible on @media print) */}
        {payment && isSuccess && (
          <div className="printable-receipt hidden print:block bg-white text-slate-900 p-8 sm:p-9 border border-slate-400 rounded-[10px] max-w-3xl mx-auto space-y-6 font-sans">
            {/* University Header */}
            <div className="text-center space-y-1 border-b border-slate-900 pb-4">
              <h1 className="text-base sm:text-lg font-black uppercase tracking-wider text-slate-900 leading-tight">
                Malaviya National Institute of Technology Jaipur
              </h1>
              <h2 className="text-xs sm:text-sm font-bold text-slate-800">
                CBP 7.0 &mdash; Capacity Building Program
              </h2>
              <p className="text-[10px] text-slate-600">
                Department of Humanities &amp; Social Sciences &amp; Training &amp; Placement Cell
              </p>
              <div className="pt-2">
                <span className="border border-slate-900 text-slate-900 px-3.5 py-0.5 text-[11px] font-extrabold uppercase tracking-widest rounded-[4px] inline-block">
                  Official Registration Fee Receipt
                </span>
              </div>
            </div>

            {/* Details Section: 2 Equal Columns with Perfect Central Divider */}
            <div className="grid grid-cols-2 text-xs pt-1">
              {/* Student Details (Left Column) */}
              <div className="pr-6 space-y-2.5 border-r border-slate-300">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
                  Student Details
                </h3>
                <table className="w-full">
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="text-slate-500 font-medium py-1.5 w-28 shrink-0">Student Name:</td>
                      <td className="font-bold text-slate-900 py-1.5">{authName || (typeof window !== "undefined" && localStorage.getItem("cbp-name")) || "N/A"}</td>
                    </tr>
                    <tr>
                      <td className="text-slate-500 font-medium py-1.5">Student ID:</td>
                      <td className="font-mono font-bold text-slate-900 py-1.5">{authStudentId || (typeof window !== "undefined" && localStorage.getItem("cbp-studentId")) || "N/A"}</td>
                    </tr>
                    <tr>
                      <td className="text-slate-500 font-medium py-1.5">Email:</td>
                      <td className="font-bold text-slate-900 py-1.5 break-all">{authEmail || (typeof window !== "undefined" && localStorage.getItem("cbp-email")) || "N/A"}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Payment Details (Right Column) */}
              <div className="pl-6 space-y-2.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
                  Payment Details
                </h3>
                <table className="w-full">
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="text-slate-500 font-medium py-1.5 w-32 shrink-0">Registration ID:</td>
                      <td className="font-mono font-bold text-slate-900 py-1.5">{payment.registrationId}</td>
                    </tr>
                    <tr>
                      <td className="text-slate-500 font-medium py-1.5">Transaction ID:</td>
                      <td className="font-mono font-bold text-slate-900 py-1.5 break-all">{formatTxnId(payment.transactionId)}</td>
                    </tr>
                    <tr>
                      <td className="text-slate-500 font-medium py-1.5">Payment Mode:</td>
                      <td className="font-bold text-slate-900 py-1.5 uppercase">{payment.paymentMode || "ONLINE_GATEWAY"}</td>
                    </tr>
                    <tr>
                      <td className="text-slate-500 font-medium py-1.5">Payment Date:</td>
                      <td className="font-mono font-bold text-slate-900 py-1.5">{formatDate(payment.createdAt)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Financial Summary */}
            <div className="border border-slate-300 rounded-[6px] overflow-hidden mt-4">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-300 bg-slate-50 font-bold uppercase tracking-wider text-slate-700 text-left">
                    <th className="px-3.5 py-2 w-3/4">Description</th>
                    <th className="px-3.5 py-2 text-right">Amount (INR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="px-3.5 py-2.5 font-medium text-slate-800">
                      CBP 7.0 Student Registration &amp; Program Fee
                    </td>
                    <td className="px-3.5 py-2.5 text-right font-bold text-slate-900 font-mono">
                      {formatCurrency(payment.amount)}
                    </td>
                  </tr>
                  <tr className="bg-slate-50 font-bold">
                    <td className="px-3.5 py-2 text-slate-900 uppercase tracking-wider text-[11px]">Total Amount Paid</td>
                    <td className="px-3.5 py-2 text-right text-xs text-slate-950 font-mono">
                      {formatCurrency(payment.amount)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Status Verification Bar */}
            <div className="flex items-center justify-between text-xs border border-slate-300 px-3.5 py-2 rounded-[6px] bg-slate-50">
              <span className="text-slate-600 font-bold uppercase tracking-wider text-[11px]">Payment Status:</span>
              <span className="text-emerald-700 font-extrabold uppercase tracking-widest font-mono">
                {payment.paymentStatus} &mdash; VERIFIED
              </span>
            </div>

            {/* Signature Area */}
            <div className="pt-8 flex justify-between items-end text-xs">
              <div className="space-y-0.5">
                <p className="text-[10px] text-slate-400">Generated: {new Date().toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" })}</p>
                <p className="text-[10px] text-slate-400">Computer Generated Receipt &mdash; No Physical Signature Required</p>
              </div>
              <div className="text-center space-y-3 w-48">
                <div className="border-b border-slate-900 w-full"></div>
                <p className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">
                  Authorized Coordinator
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </PageTransition>
  )
}
